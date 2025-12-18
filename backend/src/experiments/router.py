import io
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from src.experiments.schemas import (
    ConvergenceHistoryResponse,
    ExistingExperimentsResponse,
    ExperimentConfig,
    ExperimentConfigResponse,
    NeedsTrainingResponse,
    PredictResponse,
    TrainResponse,
)
from src.experiments import service


experiments_router = APIRouter(prefix="", tags=["Experiments"])


@experiments_router.get(
    path="/existing_experiments/",
    response_model=ExistingExperimentsResponse
)
async def get_existing_experiments() -> ExistingExperimentsResponse:
    """Get list of all existing experiments."""
    names = service.get_existing_experiments()
    return ExistingExperimentsResponse(experiment_names=names)


@experiments_router.post(
    path="/register_experiment/",
    response_model=TrainResponse
)
async def register_experiment(
    config: Annotated[str, Query(description="JSON string of ExperimentConfig")],
    train_file: Annotated[UploadFile, File(description="Training CSV file")],
) -> TrainResponse:
    """Register a new experiment with configuration and training data."""
    import json

    try:
        config_data = json.loads(config)
        experiment_config = ExperimentConfig(**config_data)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid config JSON: {str(e)}"
        )

    if service.experiment_exists(experiment_config.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Experiment '{experiment_config.name}' already exists"
        )

    contents = await train_file.read()
    df = pd.read_csv(io.BytesIO(contents))

    if experiment_config.target_column not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target column '{experiment_config.target_column}' not found"
        )

    service.save_experiment_config(experiment_config)
    service.save_training_data(experiment_config.name, df)

    return TrainResponse(
        success=True,
        message=f"Experiment '{experiment_config.name}' registered successfully",
        experiment_name=experiment_config.name,
    )


@experiments_router.get(
    path="/experiment_config/",
    response_model=ExperimentConfigResponse
)
async def get_experiment_config(
    experiment_name: Annotated[str, Query(description="Name of the experiment")]
) -> ExperimentConfigResponse:
    """Get configuration of an existing experiment."""
    if not service.experiment_exists(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_name}' not found"
        )

    config = service.load_experiment_config(experiment_name)
    return ExperimentConfigResponse(**config.model_dump())


@experiments_router.get(
    path="/needs_training",
    response_model=NeedsTrainingResponse
)
async def needs_training(
    experiment_name: Annotated[str, Query(description="Name of the experiment")]
) -> NeedsTrainingResponse:
    """Check if model needs training."""
    if not service.experiment_exists(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_name}' not found"
        )

    needs = not service.model_is_trained(experiment_name)
    return NeedsTrainingResponse(response=needs)


@experiments_router.post(
    path="/train/",
    response_model=TrainResponse
)
async def train_model(
    experiment_name: Annotated[str, Query(description="Name of the experiment")]
) -> TrainResponse:
    """Train model for the specified experiment."""
    if not service.experiment_exists(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_name}' not found"
        )

    try:
        service.train_model(experiment_name)
        return TrainResponse(
            success=True,
            message=f"Model for '{experiment_name}' trained successfully",
            experiment_name=experiment_name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )


@experiments_router.get(
    path="/convergence_history/",
    response_model=ConvergenceHistoryResponse
)
async def get_convergence_history(
    experiment_name: Annotated[str, Query(description="Name of the experiment")]
) -> ConvergenceHistoryResponse:
    """Get convergence history (learning curves) for experiment."""
    if not service.experiment_exists(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_name}' not found"
        )

    if not service.model_is_trained(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model for '{experiment_name}' has not been trained yet"
        )

    return service.get_convergence_history(experiment_name)


@experiments_router.post(
    path="/predict/",
    response_model=PredictResponse
)
async def predict(
    experiment_name: Annotated[str, Query(description="Name of the experiment")],
    test_file: Annotated[UploadFile, File(description="Test CSV file")],
) -> PredictResponse:
    """Make predictions using trained model."""
    if not service.experiment_exists(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_name}' not found"
        )

    if not service.model_is_trained(experiment_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model for '{experiment_name}' has not been trained yet"
        )

    contents = await test_file.read()
    df = pd.read_csv(io.BytesIO(contents))

    predictions = service.predict(experiment_name, df)
    return PredictResponse(predictions=predictions)
