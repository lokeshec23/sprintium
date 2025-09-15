from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class Member(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(Admin|Member|Viewer)$")

class ProjectCreate(BaseModel):
    name: str
    key: str = Field(..., min_length=2, max_length=10)
    description: Optional[str] = None
    type: str = "software"

class ProjectOut(BaseModel):
    id: str
    name: str
    key: str
    description: Optional[str]
    type: str
    owner: str
    members: List[Member]
    created_at: datetime
