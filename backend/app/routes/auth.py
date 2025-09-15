from fastapi import APIRouter, HTTPException, Depends
from ..models.user import UserCreate, UserOut
from ..database import db
from ..utils import hash_password, verify_password, create_access_token
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

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
