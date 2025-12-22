.PHONY: help build up down restart logs clean ps

help: ## Показать справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	docker-compose build

up: ## Запустить сервисы
	docker-compose up -d
	@echo "\n✅ Сервисы запущены:"
	@echo "   Frontend (Streamlit): http://localhost:8501"
	@echo "   Backend API:          http://localhost:8000"
	@echo "   Swagger Docs:         http://localhost:8000/docs"

down: ## Остановить сервисы
	docker-compose down

restart: down up ## Перезапустить

logs: ## Логи всех сервисов
	docker-compose logs -f

ps: ## Статус контейнеров
	docker-compose ps

clean: ## Остановить и удалить volumes
	docker-compose down -v

rebuild: clean build up ## Пересобрать

health: ## Проверить здоровье
	@curl -sf http://localhost:8000/health && echo " Backend OK" || echo "Backend DOWN"
	@curl -sf http://localhost:8501/_stcore/health && echo " Frontend OK" || echo "Frontend DOWN"
