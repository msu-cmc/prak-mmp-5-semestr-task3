"""Minimal FastAPI app for ML experiments.

This app only includes experiments endpoints for training and inference.
No database or authentication required.
"""
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.experiments.router import experiments_router

app = FastAPI(
    title="ML Ensembles Server",
    version="1.0.0",
    description="Backend API for ML Ensembles training and prediction",
)

app.include_router(experiments_router)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8501",
    "http://127.0.0.1:8501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
