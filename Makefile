.PHONY: help build up down restart logs clean prune ps backend-logs frontend-logs

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	docker-compose build

up: ## Запустить все сервисы
	docker-compose up -d
	@echo "\n✅ Сервисы запущены:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

down: ## Остановить все сервисы
	docker-compose down

restart: down up ## Перезапустить все сервисы

logs: ## Показать логи всех сервисов
	docker-compose logs -f

backend-logs: ## Показать логи backend
	docker-compose logs -f backend

frontend-logs: ## Показать логи frontend
	docker-compose logs -f frontend

ps: ## Показать статус контейнеров
	docker-compose ps

clean: down ## Остановить и удалить контейнеры, сети
	docker-compose down -v

prune: clean ## Полная очистка (включая образы)
	docker-compose down -v --rmi all

rebuild: clean build up ## Пересобрать и запустить

dev: ## Запустить в dev режиме с логами
	docker-compose up --build

shell-backend: ## Войти в shell backend контейнера
	docker-compose exec backend /bin/sh

shell-frontend: ## Войти в shell frontend контейнера
	docker-compose exec frontend /bin/sh

test-backend: ## Запустить тесты backend
	docker-compose exec backend python -m pytest tests/

health: ## Проверить здоровье сервисов
	@echo "Backend health:"
	@curl -f http://localhost:8000/docs > /dev/null 2>&1 && echo "  ✅ Backend is healthy" || echo "  ❌ Backend is down"
	@echo "Frontend health:"
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "  ✅ Frontend is healthy" || echo "  ❌ Frontend is down"
