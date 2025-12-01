include tests/.env
export

IMAGE_NAME = agr_test
CONTAINER_NAME =  agr_test_container
BROWSER		  ?= python -m http.server -d

# Database commands
.PHONY: db-build
db-build:
	docker build \
		--build-arg DB_NAME=$${DB_NAME} \
		--build-arg DB_USER=$${DB_USER} \
		--build-arg DB_PASSWORD=$${DB_PASSWORD} \
		-t $(IMAGE_NAME) tests/

.PHONY: db-run
db-run:
	docker run -d \
		-p 5432:5432 \
		--env POSTGRES_PASSWORD=$${DB_PASSWORD} \
		--env POSTGRES_USER=$${DB_USER} \
		--env POSTGRES_DB=$${DB_NAME} \
		--env-file tests/.env \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME)
	sleep 5


.PHONY: db-delete
db-delete:
	docker rm -f $(CONTAINER_NAME) || true


MINIO_IMAGE        ?= minio/minio:latest
MINIO_CONTAINER    ?= minio-local
MINIO_DATA_DIR     ?= $(HOME)/minio/data
MINIO_LOGS_DIR     ?= $(HOME)/minio/logs

MINIO_PORT         ?= 9000
MINIO_CONSOLE_PORT ?= 9001

MINIO_BUCKETS ?= projects


minio-up:
	@mkdir -p "$(MINIO_DATA_DIR)" "$(MINIO_LOGS_DIR)"
	-@docker rm -f $(MINIO_CONTAINER) >/dev/null 2>&1 || true
	docker run -d --name $(MINIO_CONTAINER) \
		-p $(MINIO_PORT):9000 -p $(MINIO_CONSOLE_PORT):9001 \
		-e MINIO_ROOT_USER=$${MINIO_ACCESS_KEY} \
		-e MINIO_ROOT_PASSWORD=$${MINIO_SECRET_KEY} \
		-v "$(MINIO_DATA_DIR):/data" \
		-v "$(MINIO_LOGS_DIR):/var/log/minio" \
		$(MINIO_IMAGE) server /data --console-address ":9001"
	@echo "MinIO поднят: http://localhost:$(MINIO_PORT) (console: http://localhost:$(MINIO_CONSOLE_PORT))"

minio-down:
	@docker rm -f $(MINIO_CONTAINER) || true

minio-logs:
	@docker logs -f $(MINIO_CONTAINER)

minio-clean:
	@echo "ОСТОРОЖНО: удалю данные MinIO в $(MINIO_DATA_DIR)"
	@rm -rf "$(MINIO_DATA_DIR)"
	@echo "OK."
