"""
Простой тест для проверки реализации Random Forest и Gradient Boosting
"""
import numpy as np
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split

from ensembles.random_forest import RandomForestMSE
from ensembles.boosting import GradientBoostingMSE
from ensembles.utils import rmsle


def test_random_forest():
    print("=== Тестирование RandomForestMSE ===")

    # Генерируем тестовые данные
    X, y = make_regression(n_samples=1000, n_features=10, noise=0.1, random_state=42)
    y = np.abs(y)  # RMSLE требует неотрицательные значения
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

    # Создаем и обучаем модель
    rf = RandomForestMSE(n_estimators=10, tree_params={"max_depth": 5, "random_state": 42})
    history = rf.fit(X_train, y_train, X_val, y_val, trace=True)

    # Проверяем результаты
    y_pred = rf.predict(X_test)
    test_rmsle = rmsle(y_test, y_pred)

    print(f"Размер леса: {rf.n_estimators}")
    print(f"Test RMSLE: {test_rmsle:.4f}")
    if history:
        print(f"Train RMSLE (последняя): {history['train'][-1]:.4f}")
        if history['val']:
            print(f"Val RMSLE (последняя): {history['val'][-1]:.4f}")
    print()

    # Тест с patience
    print("Тест с early stopping (patience=3):")
    rf_patience = RandomForestMSE(n_estimators=20, tree_params={"max_depth": 5, "random_state": 42})
    history_patience = rf_patience.fit(X_train, y_train, X_val, y_val, trace=True, patience=3)
    print(f"Остановились на {rf_patience.n_estimators} деревьях из 20")
    print()


def test_gradient_boosting():
    print("=== Тестирование GradientBoostingMSE ===")

    # Генерируем тестовые данные
    X, y = make_regression(n_samples=1000, n_features=10, noise=0.1, random_state=42)
    y = np.abs(y)  # RMSLE требует неотрицательные значения
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

    # Создаем и обучаем модель
    gb = GradientBoostingMSE(
        n_estimators=50,
        tree_params={"max_depth": 3, "random_state": 42},
        learning_rate=0.1
    )
    history = gb.fit(X_train, y_train, X_val, y_val, trace=True)

    # Проверяем результаты
    y_pred = gb.predict(X_test)
    test_rmsle = rmsle(y_test, y_pred)

    print(f"Количество деревьев: {gb.n_estimators}")
    print(f"Learning rate: {gb.learning_rate}")
    print(f"Константное предсказание: {gb.const_prediction:.4f}")
    print(f"Test RMSLE: {test_rmsle:.4f}")
    if history:
        print(f"Train RMSLE (последняя): {history['train'][-1]:.4f}")
        if history['val']:
            print(f"Val RMSLE (последняя): {history['val'][-1]:.4f}")
    print()

    # Тест с patience
    print("Тест с early stopping (patience=5):")
    gb_patience = GradientBoostingMSE(
        n_estimators=100,
        tree_params={"max_depth": 3, "random_state": 42},
        learning_rate=0.1
    )
    history_patience = gb_patience.fit(X_train, y_train, X_val, y_val, trace=True, patience=5)
    print(f"Остановились на {gb_patience.n_estimators} деревьях из 100")
    print()


if __name__ == "__main__":
    np.random.seed(42)
    test_random_forest()
    test_gradient_boosting()
    print("✓ Все тесты пройдены успешно!")
