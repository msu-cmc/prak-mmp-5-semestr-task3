"""Frontend client for ui.py compatibility.

This module provides Client class and plot_learning_curves function
for communication with the backend API.
"""
from typing import Any

import pandas as pd
import plotly.express as px
import requests

from ensembles.backend import ExperimentConfig


class ConvergenceHistoryResponse:
    """Response with convergence history."""

    def __init__(self, train: list[float], val: list[float] | None = None):
        self.train = train
        self.val = val

    def model_dump(self) -> dict:
        return {"train": self.train, "val": self.val}


class Client:
    """HTTP client for backend API."""

    def __init__(self, base_url: str) -> None:
        """Initialize the Client with a base URL for the API."""
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()

    def get_names(self) -> list[str]:
        """Get list of existing experiment names."""
        response = self.session.get(f"{self.base_url}/existing_experiments/")
        response.raise_for_status()
        return response.json()["experiment_names"]

    def register_experiment(
        self,
        experiment_config: ExperimentConfig,
        train_file: Any
    ) -> None:
        """Register a new experiment with configuration and training data."""
        import json

        train_file.seek(0)

        files = {"train_file": (train_file.name, train_file, "text/csv")}
        params = {"config": json.dumps(experiment_config.model_dump())}

        response = self.session.post(
            f"{self.base_url}/register_experiment/",
            params=params,
            files=files,
        )
        response.raise_for_status()

    def load_experiment_config(self, experiment_name: str) -> ExperimentConfig:
        """Load configuration of an existing experiment."""
        response = self.session.get(
            f"{self.base_url}/experiment_config/",
            params={"experiment_name": experiment_name},
        )
        response.raise_for_status()
        return ExperimentConfig(**response.json())

    def is_training_needed(self, experiment_name: str) -> bool:
        """Check if model needs training."""
        response = self.session.get(
            f"{self.base_url}/needs_training",
            params={"experiment_name": experiment_name},
        )
        response.raise_for_status()
        return response.json()["response"]

    def train_model(self, experiment_name: str) -> None:
        """Train model for the specified experiment."""
        response = self.session.post(
            f"{self.base_url}/train/",
            params={"experiment_name": experiment_name},
        )
        response.raise_for_status()

    def get_convergence_history(
        self,
        experiment_name: str
    ) -> ConvergenceHistoryResponse:
        """Get convergence history (learning curves) for experiment."""
        response = self.session.get(
            f"{self.base_url}/convergence_history/",
            params={"experiment_name": experiment_name},
        )
        response.raise_for_status()
        data = response.json()
        return ConvergenceHistoryResponse(
            train=data["train"],
            val=data.get("val"),
        )

    def predict(self, experiment_name: str, test_file: Any) -> list[float]:
        """Make predictions using trained model."""
        test_file.seek(0)

        files = {"test_file": (test_file.name, test_file, "text/csv")}

        response = self.session.post(
            f"{self.base_url}/predict/",
            params={"experiment_name": experiment_name},
            files=files,
        )
        response.raise_for_status()
        return response.json()["predictions"]


def plot_learning_curves(convergence_history: ConvergenceHistoryResponse):
    """Plot learning curves using plotly."""
    data = convergence_history.model_dump()
    df = pd.DataFrame(data)
    df_melted = df.reset_index().melt(
        id_vars=["index"],
        value_vars=["train", "val"],
        var_name="Dataset",
        value_name="RMSLE",
    )

    train_loss = min(convergence_history.train)
    val_loss = min(convergence_history.val) if convergence_history.val else 0

    return px.line(
        df_melted,
        x="index",
        y="RMSLE",
        color="Dataset",
        labels={"index": "Iterations", "RMSLE": "RMSLE"},
        title=f"RMSLE: train [{train_loss:.4f}] | validation [{val_loss:.4f}]",
    )
