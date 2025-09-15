from fastapi import APIRouter, Depends, HTTPException, status
from ..models.project import ProjectCreate, ProjectOut, Member
from ..utils import get_current_user
from ..database import db
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["Projects"])

# Create project
@router.post("/", response_model=ProjectOut)
async def create_project(project: ProjectCreate, current_user: str = Depends(get_current_user)):
    try:
        # Ensure project key is unique
        existing = await db.projects.find_one({"key": project.key.upper()})
        if existing:
            raise HTTPException(status_code=400, detail="Project key already exists")

        project_dict = {
            "name": project.name,
            "key": project.key.upper(),
            "description": project.description,
            "type": project.type,
            "owner": current_user,
            "members": [{"email": current_user, "role": "Admin"}],
            "created_at": datetime.utcnow()
        }
        result = await db.projects.insert_one(project_dict)
        return {"id": str(result.inserted_id), **project_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

# List projects
@router.get("/", response_model=List[ProjectOut])
async def list_projects(current_user: str = Depends(get_current_user)):
    try:
        projects_cursor = db.projects.find({"members.email": current_user})
        projects = []
        async for p in projects_cursor:
            projects.append({
                "id": str(p["_id"]),
                "name": p["name"],
                "key": p["key"],
                "description": p.get("description"),
                "type": p["type"],
                "owner": p["owner"],
                "members": p.get("members", []),
                "created_at": p["created_at"]
            })
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch projects: {str(e)}")

# Add member
@router.post("/{project_id}/members", response_model=ProjectOut)
async def add_member(project_id: str, member: Member, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Only Admins can add members
        admin = next((m for m in project["members"] if m["email"] == current_user and m["role"] == "Admin"), None)
        if not admin:
            raise HTTPException(status_code=403, detail="Only Admins can add members")

        # Check if user already exists
        if any(m["email"] == member.email for m in project["members"]):
            raise HTTPException(status_code=400, detail="User already a member")

        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$push": {"members": {"email": member.email, "role": member.role}}}
        )

        updated = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated:
            raise HTTPException(status_code=404, detail="Project not found")

        return {
            "id": str(updated["_id"]),
            "name": updated["name"],
            "key": updated["key"],
            "description": updated.get("description"),
            "type": updated["type"],
            "owner": updated["owner"],
            "members": updated.get("members", []),
            "created_at": updated["created_at"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add member: {str(e)}")

# Update member role
@router.patch("/{project_id}/members/{email}", response_model=ProjectOut)
async def update_member_role(project_id: str, email: str, role: str, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        admin = next((m for m in project["members"] if m["email"] == current_user and m["role"] == "Admin"), None)
        if not admin:
            raise HTTPException(status_code=403, detail="Only Admins can update roles")

        result = await db.projects.update_one(
            {"_id": ObjectId(project_id), "members.email": email},
            {"$set": {"members.$.role": role}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        updated = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated:
            raise HTTPException(status_code=404, detail="Project not found")

        return {
            "id": str(updated["_id"]),
            "name": updated["name"],
            "key": updated["key"],
            "description": updated.get("description"),
            "type": updated["type"],
            "owner": updated["owner"],
            "members": updated.get("members", []),
            "created_at": updated["created_at"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update member role: {str(e)}")

# Remove member
@router.delete("/{project_id}/members/{email}", response_model=ProjectOut)
async def remove_member(project_id: str, email: str, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        admin = next((m for m in project["members"] if m["email"] == current_user and m["role"] == "Admin"), None)
        if not admin:
            raise HTTPException(status_code=403, detail="Only Admins can remove members")

        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$pull": {"members": {"email": email}}}
        )

        updated = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated:
            raise HTTPException(status_code=404, detail="Project not found")

        return {
            "id": str(updated["_id"]),
            "name": updated["name"],
            "key": updated["key"],
            "description": updated.get("description"),
            "type": updated["type"],
            "owner": updated["owner"],
            "members": updated.get("members", []),
            "created_at": updated["created_at"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove member: {str(e)}")


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "members.email": current_user})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied")

        project["_id"] = str(project["_id"])
        return {
            "id": project["_id"],
            "name": project["name"],
            "key": project["key"],
            "description": project.get("description"),
            "type": project["type"],
            "owner": project["owner"],
            "members": project.get("members", []),
            "created_at": project["created_at"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}")
    

# Update project
@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, data: ProjectCreate, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Only Admins can update project
        admin = next((m for m in project["members"] if m["email"] == current_user and m["role"] == "Admin"), None)
        if not admin:
            raise HTTPException(status_code=403, detail="Only Admins can update project")

        # Prevent duplicate key (if changing)
        if project["key"] != data.key.upper():
            existing = await db.projects.find_one({"key": data.key.upper()})
            if existing:
                raise HTTPException(status_code=400, detail="Project key already exists")

        update_data = {
            "name": data.name,
            "key": data.key.upper(),
            "description": data.description,
            "type": data.type,
        }

        await db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": update_data})

        updated = await db.projects.find_one({"_id": ObjectId(project_id)})
        updated["_id"] = str(updated["_id"])
        return {
            "id": updated["_id"],
            "name": updated["name"],
            "key": updated["key"],
            "description": updated.get("description"),
            "type": updated["type"],
            "owner": updated["owner"],
            "members": updated.get("members", []),
            "created_at": updated["created_at"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update project: {str(e)}")


# Delete project
@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: str = Depends(get_current_user)):
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Only Admins can delete project
        admin = next((m for m in project["members"] if m["email"] == current_user and m["role"] == "Admin"), None)
        if not admin:
            raise HTTPException(status_code=403, detail="Only Admins can delete project")

        await db.projects.delete_one({"_id": ObjectId(project_id)})
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")

