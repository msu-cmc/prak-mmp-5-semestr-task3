import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gunicorn.app.wsgiapp import run
from src.users.router import auth_router, user_router
from src.parameters.router import parameter_router
from src.types.router import type_router
from src.user_types.router import user_type_router
from src.sessions.router import session_router
from src.workouts.router import workout_router
from src.workouts_exercises.router import workout_exercises_router
from src.sets.router import sets_router
from src.messages.router import messages_router
from src.chats.router import chats_router
from src.exercises.router import router as exercises_router
from src.equipments.router import router as equipments_router
from src.muscles.router import router as muscles_router
from src.exercise_muscle.router import router as exercise_muscle_router


app = FastAPI(
    title="AkramFit Backend",
    version="1.0.0",
    description="Backend API for AkramFit project",
)

app = FastAPI()

app.include_router(session_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(exercises_router)
app.include_router(exercise_muscle_router)
app.include_router(muscles_router)
app.include_router(equipments_router)
app.include_router(parameter_router)
app.include_router(type_router)
app.include_router(user_type_router)
app.include_router(workout_router)
app.include_router(workout_exercises_router)
app.include_router(sets_router)
app.include_router(messages_router)
app.include_router(chats_router)

origins = [
    "https://158.160.201.240",
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
