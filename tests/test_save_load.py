"""
Тест сохранения и загрузки моделей
"""
import numpy as np
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
import shutil
from pathlib import Path

from ensembles.random_forest import RandomForestMSE
from ensembles.boosting import GradientBoostingMSE
from ensembles.utils import rmsle


def test_rf_save_load():
    print("=== Тест сохранения/загрузки RandomForestMSE ===")

    # Генерируем данные
    X, y = make_regression(n_samples=500, n_features=10, noise=0.1, random_state=42)
    y = np.abs(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Обучаем модель
    rf = RandomForestMSE(n_estimators=5, tree_params={"max_depth": 4, "random_state": 42})
    rf.fit(X_train, y_train)

    # Предсказания до сохранения
    y_pred_before = rf.predict(X_test)
    rmsle_before = rmsle(y_test, y_pred_before)

    # Сохраняем
    model_path = Path("test_models/rf_model")
    if model_path.exists():
        shutil.rmtree(model_path)
    rf.dump(str(model_path))
    print(f"✓ Модель сохранена в {model_path}")

    # Загружаем
    rf_loaded = RandomForestMSE.load(str(model_path))
    print(f"✓ Модель загружена из {model_path}")

    # Предсказания после загрузки
    y_pred_after = rf_loaded.predict(X_test)
    rmsle_after = rmsle(y_test, y_pred_after)

    # Проверяем идентичность
    print(f"RMSLE до сохранения: {rmsle_before:.6f}")
    print(f"RMSLE после загрузки: {rmsle_after:.6f}")
    print(f"Предсказания идентичны: {np.allclose(y_pred_before, y_pred_after)}")
    assert np.allclose(y_pred_before, y_pred_after), "Предсказания должны быть идентичны!"
    print()


def test_gb_save_load():
    print("=== Тест сохранения/загрузки GradientBoostingMSE ===")

    # Генерируем данные
    X, y = make_regression(n_samples=500, n_features=10, noise=0.1, random_state=42)
    y = np.abs(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Обучаем модель
    gb = GradientBoostingMSE(
        n_estimators=10,
        tree_params={"max_depth": 3, "random_state": 42},
        learning_rate=0.1
    )
    gb.fit(X_train, y_train)

    # Предсказания до сохранения
    y_pred_before = gb.predict(X_test)
    rmsle_before = rmsle(y_test, y_pred_before)

    # Сохраняем
    model_path = Path("test_models/gb_model")
    if model_path.exists():
        shutil.rmtree(model_path)
    gb.dump(str(model_path))
    print(f"✓ Модель сохранена в {model_path}")

    # Загружаем
    gb_loaded = GradientBoostingMSE.load(str(model_path))
    print(f"✓ Модель загружена из {model_path}")

    # Предсказания после загрузки
    y_pred_after = gb_loaded.predict(X_test)
    rmsle_after = rmsle(y_test, y_pred_after)

    # Проверяем идентичность
    print(f"RMSLE до сохранения: {rmsle_before:.6f}")
    print(f"RMSLE после загрузки: {rmsle_after:.6f}")
    print(f"Предсказания идентичны: {np.allclose(y_pred_before, y_pred_after)}")
    assert np.allclose(y_pred_before, y_pred_after), "Предсказания должны быть идентичны!"

    # Проверяем параметры
    print(f"Const prediction сохранён: {gb.const_prediction == gb_loaded.const_prediction}")
    print(f"Learning rate сохранён: {gb.learning_rate == gb_loaded.learning_rate}")
    print()


if __name__ == "__main__":
    np.random.seed(42)
    test_rf_save_load()
    test_gb_save_load()

    # Удаляем тестовые модели
    shutil.rmtree("test_models")
    print("✓ Все тесты сохранения/загрузки пройдены успешно!")
