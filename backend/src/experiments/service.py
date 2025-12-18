import json
import math
import sys
from pathlib import Path
from typing import Union

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from ensembles.boosting import GradientBoostingMSE
from ensembles.random_forest import RandomForestMSE
from ensembles.utils import ConvergenceHistory

from src.experiments.schemas import (
    ConvergenceHistoryResponse,
    ExperimentConfig,
)


RUNS_DIR = Path(__file__).resolve().parents[3] / "runs"


def get_runs_dir() -> Path:
    """Get the runs directory path."""
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    return RUNS_DIR


def get_experiment_dir(experiment_name: str) -> Path:
    """Get the directory for a specific experiment."""
    return get_runs_dir() / experiment_name


def get_existing_experiments() -> list[str]:
    """Get list of existing experiment names."""
    runs_dir = get_runs_dir()
    if not runs_dir.exists():
        return []
    return [d.name for d in runs_dir.iterdir() if d.is_dir()]


def experiment_exists(experiment_name: str) -> bool:
    """Check if experiment already exists."""
    return experiment_name in get_existing_experiments()


def save_experiment_config(config: ExperimentConfig) -> None:
    """Save experiment configuration to disk."""
    exp_dir = get_experiment_dir(config.name)
    exp_dir.mkdir(parents=True, exist_ok=True)

    config_path = exp_dir / "config.json"
    with config_path.open("w") as f:
        json.dump(config.model_dump(), f, indent=2)


def load_experiment_config(experiment_name: str) -> ExperimentConfig:
    """Load experiment configuration from disk."""
    exp_dir = get_experiment_dir(experiment_name)
    config_path = exp_dir / "config.json"

    with config_path.open("r") as f:
        data = json.load(f)

    return ExperimentConfig(**data)


def save_training_data(experiment_name: str, df: pd.DataFrame) -> None:
    """Save training data to experiment directory."""
    exp_dir = get_experiment_dir(experiment_name)
    data_path = exp_dir / "train_data.csv"
    df.to_csv(data_path, index=False)


def load_training_data(experiment_name: str) -> pd.DataFrame:
    """Load training data from experiment directory."""
    exp_dir = get_experiment_dir(experiment_name)
    data_path = exp_dir / "train_data.csv"
    return pd.read_csv(data_path)


def model_is_trained(experiment_name: str) -> bool:
    """Check if model has been trained."""
    exp_dir = get_experiment_dir(experiment_name)
    model_dir = exp_dir / "model"
    return model_dir.exists() and (model_dir / "params.json").exists()


def parse_max_features(
    max_features: Union[str, int, float],
    n_features: int
) -> Union[int, float, None]:
    """Parse max_features parameter for sklearn trees."""
    if isinstance(max_features, str):
        if max_features == "all":
            return None
        elif max_features == "sqrt":
            return "sqrt"
        elif max_features == "log2":
            return "log2"
        else:
            try:
                return int(max_features)
            except ValueError:
                return float(max_features)
    return max_features


def train_model(experiment_name: str) -> ConvergenceHistory:
    """Train model for the specified experiment."""
    config = load_experiment_config(experiment_name)
    df = load_training_data(experiment_name)

    target_col = config.target_column
    X = df.drop(columns=[target_col]).values
    y = df[target_col].values

    n_features = X.shape[1]
    max_features = parse_max_features(config.max_features, n_features)

    tree_params = {
        "max_depth": config.max_depth,
        "max_features": max_features,
    }

    train_size = int(0.8 * len(X))
    X_train, X_val = X[:train_size], X[train_size:]
    y_train, y_val = y[:train_size], y[train_size:]

    if config.ml_model == "Random Forest":
        model = RandomForestMSE(
            n_estimators=config.n_estimators,
            tree_params=tree_params,
        )
    else:
        model = GradientBoostingMSE(
            n_estimators=config.n_estimators,
            tree_params=tree_params,
            learning_rate=config.learning_rate,
        )

    convergence_history = model.fit(
        X=X_train,
        y=y_train,
        X_val=X_val,
        y_val=y_val,
        trace=True,
    )

    exp_dir = get_experiment_dir(experiment_name)
    model_dir = exp_dir / "model"
    if model_dir.exists():
        import shutil
        shutil.rmtree(model_dir)

    model.dump(str(model_dir))

    if convergence_history:
        history_path = exp_dir / "convergence_history.json"
        history_data = {
            "train": convergence_history["train"],
            "val": convergence_history.get("val"),
        }
        with history_path.open("w") as f:
            json.dump(history_data, f, indent=2)

    return convergence_history


def get_convergence_history(experiment_name: str) -> ConvergenceHistoryResponse:
    """Get convergence history for experiment."""
    exp_dir = get_experiment_dir(experiment_name)
    history_path = exp_dir / "convergence_history.json"

    with history_path.open("r") as f:
        data = json.load(f)

    return ConvergenceHistoryResponse(**data)


def load_model(experiment_name: str):
    """Load trained model from disk."""
    config = load_experiment_config(experiment_name)
    exp_dir = get_experiment_dir(experiment_name)
    model_dir = str(exp_dir / "model")

    if config.ml_model == "Random Forest":
        return RandomForestMSE.load(model_dir)
    else:
        return GradientBoostingMSE.load(model_dir)


def predict(experiment_name: str, df: pd.DataFrame) -> list[float]:
    """Make predictions using trained model."""
    config = load_experiment_config(experiment_name)
    model = load_model(experiment_name)

    if config.target_column in df.columns:
        df = df.drop(columns=[config.target_column])

    X = df.values
    predictions = model.predict(X)

    result = []
    for p in predictions:
        if math.isnan(p) or math.isinf(p):
            result.append(0.0)
        else:
            result.append(float(p))

    return result
