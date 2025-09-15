from fastapi import APIRouter, HTTPException, Depends, Request
from ..models.user import UserCreate, UserOut
from ..database import db
from ..utils import hash_password, verify_password, create_access_token, get_current_user, create_reset_token, verify_reset_token
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetRequest(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    try:
        existing = await db.users.find_one({"email": user.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = hash_password(user.password)
        user_dict = {"username": user.username, "email": user.email, "password": hashed_pw}

        result = await db.users.insert_one(user_dict)
        return {"id": str(result.inserted_id), "username": user.username, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(request: LoginRequest):
    try:
        user = await db.users.find_one({"email": request.email})
        if not user or not verify_password(request.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({"sub": user["email"]}, timedelta(minutes=30))
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/logout")
async def logout(current_user: str = Depends(get_current_user)):
    """
    For now, logout just confirms success. 
    In future, we can add token blacklisting here.
    """
    try:
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")
    
@router.post("/forgot-password")
async def forgot_password(request: ResetRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = create_reset_token(user["email"])
    # In real app: send email with token link
    return {"reset_token": token, "message": "Password reset link generated"}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    email = verify_reset_token(data.token)
    hashed_pw = hash_password(data.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password": hashed_pw}})
    return {"message": "Password reset successful"}

