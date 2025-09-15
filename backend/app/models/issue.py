from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Literal["To Do", "In Progress", "Done"] = "To Do"
    assignee: Optional[str] = None

class IssueOut(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str]
    status: str
    reporter: str
    assignee: Optional[str]
    created_at: datetime
    updated_at: datetime
