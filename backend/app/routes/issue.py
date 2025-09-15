from fastapi import APIRouter, Depends, HTTPException
from ..models.issue import IssueCreate, IssueOut
from ..utils import get_current_user
from ..database import db
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/projects/{project_id}/issues", tags=["Issues"])

async def get_project_and_role(project_id: str, current_user: str):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    member = next((m for m in project["members"] if m["email"] == current_user), None)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    return project, member["role"]

# Create issue
@router.post("/", response_model=IssueOut)
async def create_issue(project_id: str, issue: IssueCreate, current_user: str = Depends(get_current_user)):
    project, role = await get_project_and_role(project_id, current_user)
    if role not in ["Admin", "Member"]:
        raise HTTPException(status_code=403, detail="Only Admins and Members can create issues")

    issue_dict = {
        "project_id": project_id,
        "title": issue.title,
        "description": issue.description,
        "status": issue.status,
        "reporter": current_user,
        "assignee": issue.assignee,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.issues.insert_one(issue_dict)
    return {"id": str(result.inserted_id), **issue_dict}

# List issues
@router.get("/", response_model=List[IssueOut])
async def list_issues(project_id: str, current_user: str = Depends(get_current_user)):
    project, role = await get_project_and_role(project_id, current_user)

    cursor = db.issues.find({"project_id": project_id})
    issues = []
    async for i in cursor:
        issues.append({
            "id": str(i["_id"]),
            "project_id": i["project_id"],
            "title": i["title"],
            "description": i.get("description"),
            "status": i["status"],
            "reporter": i["reporter"],
            "assignee": i.get("assignee"),
            "created_at": i["created_at"],
            "updated_at": i["updated_at"]
        })
    return issues

# Update issue
@router.put("/{issue_id}", response_model=IssueOut)
async def update_issue(project_id: str, issue_id: str, data: IssueCreate, current_user: str = Depends(get_current_user)):
    project, role = await get_project_and_role(project_id, current_user)
    issue = await db.issues.find_one({"_id": ObjectId(issue_id), "project_id": project_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Role enforcement
    if role == "Viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot update issues")
    if role == "Member" and issue["reporter"] != current_user and issue.get("assignee") != current_user:
        raise HTTPException(status_code=403, detail="Members can only update their own issues")

    update_data = {
        "title": data.title,
        "description": data.description,
        "status": data.status,
        "assignee": data.assignee,
        "updated_at": datetime.utcnow()
    }
    await db.issues.update_one({"_id": ObjectId(issue_id)}, {"$set": update_data})

    updated = await db.issues.find_one({"_id": ObjectId(issue_id)})
    return {
        "id": str(updated["_id"]),
        "project_id": updated["project_id"],
        "title": updated["title"],
        "description": updated.get("description"),
        "status": updated["status"],
        "reporter": updated["reporter"],
        "assignee": updated.get("assignee"),
        "created_at": updated["created_at"],
        "updated_at": updated["updated_at"]
    }

# Delete issue
@router.delete("/{issue_id}")
async def delete_issue(project_id: str, issue_id: str, current_user: str = Depends(get_current_user)):
    project, role = await get_project_and_role(project_id, current_user)
    issue = await db.issues.find_one({"_id": ObjectId(issue_id), "project_id": project_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Role enforcement
    if role == "Viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot delete issues")
    if role == "Member" and issue["reporter"] != current_user:
        raise HTTPException(status_code=403, detail="Members can only delete issues they reported")

    await db.issues.delete_one({"_id": ObjectId(issue_id)})
    return {"message": "Issue deleted successfully"}
