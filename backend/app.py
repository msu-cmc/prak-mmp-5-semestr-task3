import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gunicorn.app.wsgiapp import run
from src.users.router import auth_router, user_router

app = FastAPI(
    title="AnsamblesServer",
    version="1.0.0",
    description="Backend API for AnsamblesServer project",
)

app = FastAPI()

app.include_router(user_router)
app.include_router(auth_router)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    sys.argv = [
        "gunicorn",
        "app:app",
        "--workers=4",
        "--worker-class=uvicorn.workers.UvicornWorker",
        "--bind=0.0.0.0:8000",
        "--timeout=660",
    ]
    run()
