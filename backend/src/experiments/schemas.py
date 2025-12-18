from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class ExperimentConfig(BaseModel):
    """Configuration for ML experiment."""

    name: str = Field(..., description="Unique experiment name")
    ml_model: Literal["Random Forest", "Gradient Boosting"] = Field(
        ..., description="Model type to train"
    )
    n_estimators: Annotated[int, Field(ge=1, description="Number of trees")] = 100
    max_depth: Annotated[int, Field(ge=1, description="Maximum tree depth")] = 15
    max_features: Union[str, int, float] = Field(
        default="all",
        description="Max features per split: 'all', 'sqrt', 'log2', int or float"
    )
    target_column: Union[str, None] = Field(
        default=None, description="Name of the target column in dataset"
    )
    learning_rate: Annotated[float, Field(gt=0, le=1)] = Field(
        default=0.1, description="Learning rate for Gradient Boosting"
    )


class ExperimentConfigResponse(ExperimentConfig):
    """Response model for experiment config."""
    pass


class TrainResponse(BaseModel):
    """Response from training endpoint."""

    success: bool
    message: str
    experiment_name: str


class PredictResponse(BaseModel):
    """Response from prediction endpoint."""

    predictions: list[float]


class ConvergenceHistoryResponse(BaseModel):
    """Response with convergence history."""

    train: list[float]
    val: list[float] | None = None


class ExistingExperimentsResponse(BaseModel):
    """Response with list of existing experiments."""

    experiment_names: list[str] = []


class NeedsTrainingResponse(BaseModel):
    """Response indicating if model needs training."""

    response: bool
