import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import numpy.typing as npt
from sklearn.tree import DecisionTreeRegressor

from ensembles.utils import ConvergenceHistory


class RandomForestMSE:
    def __init__(
        self, n_estimators: int, tree_params: dict[str, Any] | None = None
    ) -> None:
        """
        Handmade random forest regressor.

        Classic ML algorithm that trains a set of independent tall decision trees and averages its predictions. Employs scikit-learn `DecisionTreeRegressor` under the hood.

        Args:
            n_estimators (int): Number of trees in the forest.
            tree_params (dict[str, Any] | None, optional): Parameters for sklearn trees. Defaults to None.
        """
        self.n_estimators = n_estimators
        if tree_params is None:
            tree_params = {}
        self.forest = [
            DecisionTreeRegressor(**tree_params) for _ in range(n_estimators)
        ]

    def fit(
        self,
        X: npt.NDArray[np.float64],
        y: npt.NDArray[np.float64],
        X_val: npt.NDArray[np.float64] | None = None,
        y_val: npt.NDArray[np.float64] | None = None,
        trace: bool | None = None,
        patience: int | None = None,
    ) -> ConvergenceHistory | None:
        """
        Train an ensemble of trees on the provided data.

        Args:
            X (npt.NDArray[np.float64]): Objects features matrix, array of shape (n_objects, n_features).
            y (npt.NDArray[np.float64]): Regression labels, array of shape (n_objects,).
            X_val (npt.NDArray[np.float64] | None, optional): Validation set of objects, array of shape (n_val_objects, n_features). Defaults to None.
            y_val (npt.NDArray[np.float64] | None, optional): Validation set of labels, array of shape (n_val_objects,). Defaults to None.
            trace (bool | None, optional): Whether to calculate rmsle while training. True by default if validation data is provided. Defaults to None.
            patience (int | None, optional): Number of training steps without decreasing the train loss (or validation if provided), after which to stop training. Defaults to None.

        Returns:
            ConvergenceHistory | None: Instance of `ConvergenceHistory` if `trace=True` or if validation data is provided.
        """
        from ensembles.utils import rmsle, whether_to_stop

        # Определяем, нужно ли отслеживать историю
        if trace is None:
            trace = X_val is not None and y_val is not None

        convergence_history: ConvergenceHistory | None = None
        if trace:
            convergence_history = {
                "train": [],
                "val": [] if X_val is not None and y_val is not None else None,
            }

        n_objects = X.shape[0]

        # Обучаем каждое дерево на bootstrap-выборке
        for i, tree in enumerate(self.forest):
            # Bootstrap sampling: случайная выборка с возвращением
            bootstrap_indices = np.random.choice(n_objects, size=n_objects, replace=True)
            X_bootstrap = X[bootstrap_indices]
            y_bootstrap = y[bootstrap_indices]

            # Обучаем дерево
            tree.fit(X_bootstrap, y_bootstrap)

            # Если нужна история сходимости
            if trace and convergence_history is not None:
                # Предсказание текущего ансамбля (от 0 до i включительно)
                y_pred_train = self._predict_trees(X, i + 1)
                train_loss = rmsle(y, y_pred_train)
                convergence_history["train"].append(train_loss)

                if X_val is not None and y_val is not None:
                    y_pred_val = self._predict_trees(X_val, i + 1)
                    val_loss = rmsle(y_val, y_pred_val)
                    convergence_history["val"].append(val_loss)  # type: ignore

                # Проверка early stopping
                if patience is not None and whether_to_stop(convergence_history, patience):
                    # Обрезаем лес до текущего размера
                    self.forest = self.forest[:i + 1]
                    self.n_estimators = i + 1
                    break

        return convergence_history

    def _predict_trees(self, X: npt.NDArray[np.float64], n_trees: int) -> npt.NDArray[np.float64]:
        """
        Вспомогательная функция для предсказания с использованием первых n_trees деревьев.

        Args:
            X: Матрица признаков
            n_trees: Количество деревьев для использования

        Returns:
            Предсказания
        """
        predictions = np.array([tree.predict(X) for tree in self.forest[:n_trees]])
        return np.mean(predictions, axis=0)

    def predict(self, X: npt.NDArray[np.float64]) -> npt.NDArray[np.float64]:
        """
        Make prediction with ensemble of trees.

        All the trees make their own predictions which then are averaged.

        Args:
            X (npt.NDArray[np.float64]): Objects' features matrix, array of shape (n_objects, n_features).

        Returns:
            npt.NDArray[np.float64]: Predicted values, array of shape (n_objects,).
        """
        # Получаем предсказания от всех деревьев и усредняем их
        predictions = np.array([tree.predict(X) for tree in self.forest])
        return np.mean(predictions, axis=0)

    def dump(self, dirpath: str) -> None:
        """
        Save the trained model to the specified directory.

        Args:
            dirpath (str): Path to the directory where the model will be saved.
        """
        path = Path(dirpath)
        path.mkdir(parents=True)

        params = {"n_estimators": self.n_estimators}
        with (path / "params.json").open("w") as file:
            json.dump(params, file, indent=4)

        trees_path = path / "trees"
        trees_path.mkdir()
        for i, tree in enumerate(self.forest):
            joblib.dump(tree, trees_path / f"tree_{i:04d}.joblib")

    @classmethod
    def load(cls, dirpath: str) -> "RandomForestMSE":
        """
        Load a trained model from the specified directory.

        Args:
            dirpath (str): Path to the directory where the model is saved.

        Returns:
            RandomForestMSE: An instance of the loaded model.
        """
        with (Path(dirpath) / "params.json").open() as file:
            params = json.load(file)
        instance = cls(params["n_estimators"])

        trees_path = Path(dirpath) / "trees"

        instance.forest = [
            joblib.load(trees_path / f"tree_{i:04d}.joblib")
            for i in range(params["n_estimators"])
        ]

        return instance