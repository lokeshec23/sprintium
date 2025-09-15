from fastapi import APIRouter, Depends, HTTPException
from ..database import db
from ..utils import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    try:
        user = await db.users.find_one({"email": current_user}, {"password": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user["_id"] = str(user["_id"])
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
