#!/bin/bash

# Скрипт для проверки готовности Docker окружения

set -e

echo "Проверка Docker окружения..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка Docker
echo -n "Проверка Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} (версия: $DOCKER_VERSION)"
else
    echo -e "${RED}✗${NC}"
    echo "Docker не установлен!"
    exit 1
fi

# Проверка Docker Compose
echo -n "Проверка Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} (версия: $COMPOSE_VERSION)"
else
    echo -e "${RED}✗${NC}"
    echo "Docker Compose не установлен!"
    exit 1
fi

# Проверка запущен ли Docker daemon
echo -n "Проверка Docker daemon... "
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Docker daemon не запущен!"
    exit 1
fi

# Проверка Make (опционально)
echo -n "Проверка Make... "
if command -v make &> /dev/null; then
    MAKE_VERSION=$(make --version | head -1 | cut -d ' ' -f3)
    echo -e "${GREEN}✓${NC} (версия: $MAKE_VERSION)"
else
    echo -e "${YELLOW}⚠${NC} (не критично, можно использовать docker-compose напрямую)"
fi

echo ""
echo "Проверка файлов конфигурации..."

# Проверка наличия необходимых файлов
FILES=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "pyproject.toml"
    "frontend/package.json"
)

for file in "${FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "Файл $file не найден!"
        exit 1
    fi
done

echo ""
echo "Проверка структуры проекта..."

# Проверка наличия директорий
DIRS=(
    "backend/src"
    "frontend/src"
    "ensembles"
    "data"
)

for dir in "${DIRS[@]}"; do
    echo -n "  $dir/... "
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} (создастся автоматически)"
    fi
done

echo ""
echo "Проверка docker-compose.yml..."

# Валидация docker-compose файла
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Файл docker-compose.yml валиден"
else
    echo -e "${RED}✗${NC} Ошибка в docker-compose.yml"
    docker-compose config
    exit 1
fi

echo ""
echo "${GREEN}Все проверки пройдены!${NC}"
echo ""
echo "Для запуска используйте:"
echo "  ${GREEN}make up${NC}       - запустить сервисы"
echo "  ${GREEN}make logs${NC}     - посмотреть логи"
echo "  ${GREEN}make down${NC}     - остановить сервисы"
echo ""
echo "Или без Make:"
echo "  ${GREEN}docker-compose up -d${NC}      - запустить сервисы"
echo "  ${GREEN}docker-compose logs -f${NC}    - посмотреть логи"
echo "  ${GREEN}docker-compose down${NC}       - остановить сервисы"
echo ""
echo "После запуска сервисы будут доступны на:"
echo "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo "  Backend:  ${GREEN}http://localhost:8000${NC}"
echo "  API Docs: ${GREEN}http://localhost:8000/docs${NC}"
