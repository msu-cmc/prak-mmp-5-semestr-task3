import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import numpy.typing as npt
from sklearn.tree import DecisionTreeRegressor

from ensembles.utils import ConvergenceHistory


class GradientBoostingMSE:
    const_prediction: float

    def __init__(
        self,
        n_estimators: int,
        tree_params: dict[str, Any] | None = None,
        learning_rate=0.1,
    ) -> None:
        """
        Initializes the GradientBoostingMSE model.

        This is a handmade gradient boosting regressor that trains a sequence of
        short decision trees to correct the errors of each other's predictions.
        It employs scikit-learn's `DecisionTreeRegressor` under the hood.

        Args:
            n_estimators (int):
                Number of trees to boost each other.
            tree_params (dict[str, Any] | None, optional):
                Parameters for the decision trees. Defaults to None.
            learning_rate (float, optional):
                Scaling factor for the "gradient" step 
                (the weight applied to each tree prediction). Defaults to 0.1.
        """
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
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
        Trains an ensemble of trees on the provided data.

        Args:
            X (npt.NDArray[np.float64]):
                Objects features matrix, array of shape (n_objects, n_features).
            y (npt.NDArray[np.float64]):
                Regression labels, array of shape (n_objects,).
            X_val (npt.NDArray[np.float64] | None, optional):
                Validation set of objects, array of shape
                (n_val_objects, n_features). Defaults to None.
            y_val (npt.NDArray[np.float64] | None, optional):
                Validation set of labels, array of shape (n_val_objects,).
                Defaults to None.
            trace (bool | None, optional):
                Whether to calculate RMSLE while training.
                True by default if validation data is provided.
                Defaults to None.
            patience (int | None, optional):
                Number of training steps without decreasing
                the train loss (or validation if provided),
                after which to stop training. Defaults to None.

        Returns:
            ConvergenceHistory | None: Instance of `ConvergenceHistory`
            if `trace=True` or if validation data is provided.
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

        # Инициализация: начальное предсказание - среднее значение целевой переменной
        self.const_prediction = float(np.mean(y))
        current_prediction = np.full(X.shape[0], self.const_prediction)

        # Обучаем деревья последовательно
        for i, tree in enumerate(self.forest):
            # Вычисляем антиградиент (для MSE это просто остатки: y - y_pred)
            residuals = y - current_prediction

            # Обучаем дерево на антиградиенте
            tree.fit(X, residuals)

            # Обновляем предсказания
            tree_predictions = tree.predict(X)
            current_prediction += self.learning_rate * tree_predictions

            # Если нужна история сходимости
            if trace and convergence_history is not None:
                # Предсказание текущего ансамбля
                y_pred_train = self._predict_trees(X, i + 1)
                train_loss = rmsle(y, y_pred_train)
                convergence_history["train"].append(train_loss)

                if X_val is not None and y_val is not None:
                    y_pred_val = self._predict_trees(X_val, i + 1)
                    val_loss = rmsle(y_val, y_pred_val)
                    convergence_history["val"].append(val_loss)  # type: ignore

                # Проверка early stopping
                if patience is not None and whether_to_stop(convergence_history, patience):
                    # Обрезаем ансамбль до текущего размера
                    self.forest = self.forest[:i + 1]
                    self.n_estimators = i + 1
                    break

        return convergence_history

    def _predict_trees(
            self,
            X: npt.NDArray[np.float64],
            n_trees: int
    ) -> npt.NDArray[np.float64]:
        """
        Вспомогательная функция для предсказания с
        использованием первых n_trees деревьев.

        Args:
            X: Матрица признаков
            n_trees: Количество деревьев для использования

        Returns:
            Предсказания
        """
        prediction = np.full(X.shape[0], self.const_prediction)
        for tree in self.forest[:n_trees]:
            prediction += self.learning_rate * tree.predict(X)
        return prediction

    def predict(
            self,
            X: npt.NDArray[np.float64]
    ) -> npt.NDArray[np.float64]:
        """
        Makes predictions with the ensemble of trees.

        All the trees make sequential predictions.

        Args:
            X (npt.NDArray[np.float64]): Objects'
            features matrix, array of shape (n_objects, n_features).

        Returns:
            npt.NDArray[np.float64]: Predicted values,
            array of shape (n_objects,).
        """
        # Начинаем с константного предсказания
        prediction = np.full(
            shape=X.shape[0],
            fill_value=self.const_prediction
        )

        # Последовательно добавляем предсказания каждого дерева с учетом learning_rate
        for tree in self.forest:
            prediction += self.learning_rate * tree.predict(X)

        return prediction

    def dump(
            self,
            dirpath: str
    ) -> None:
        """
        Saves the model to the specified directory.

        Args:
            dirpath (str): Path to the directory
            where the model will be saved.
        """
        path = Path(dirpath)
        path.mkdir(parents=True)

        params = {
            "n_estimators": self.n_estimators,
            "learning_rate": self.learning_rate,
            "const_prediction": self.const_prediction,
        }
        with (path / "params.json").open("w") as file:
            json.dump(params, file, indent=4)

        trees_path = path / "trees"
        trees_path.mkdir()
        for i, tree in enumerate(self.forest):
            joblib.dump(
                value=tree,
                filename=trees_path / f"tree_{i:04d}.joblib"
            )

    @classmethod
    def load(
        cls,
        dirpath: str
    ) -> "GradientBoostingMSE":
        """
        Loads the model from the specified directory.

        Args:
            dirpath (str): Path to the directory
            where the model is saved.

        Returns:
            GradientBoostingMSE: An instance of
            the GradientBoostingMSE model.
        """
        with (Path(dirpath) / "params.json").open() as file:
            params = json.load(file)
        instance = cls(
            n_estimators=params["n_estimators"],
            learning_rate=params["learning_rate"]
        )

        trees_path = Path(dirpath) / "trees"

        instance.forest = [
            joblib.load(filename=trees_path / f"tree_{i:04d}.joblib")
            for i in range(params["n_estimators"])
        ]
        instance.const_prediction = params["const_prediction"]

        return instance