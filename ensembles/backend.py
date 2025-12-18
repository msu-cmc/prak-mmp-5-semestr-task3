"""Backend schemas for ui.py compatibility.

This module re-exports ExperimentConfig for use in ui.py
"""
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
