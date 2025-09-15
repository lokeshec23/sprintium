from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, user, project


app = FastAPI(title="Sprintium Backend")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(project.router)

@app.get("/")
def root():
    return {"message": "Sprintium backend is running 🚀"}
