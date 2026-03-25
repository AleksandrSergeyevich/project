# Autotest — полный запуск

## Архитектура

```
POST /jobs  (multipart: file=архив.zip, type=preland, author=..., name=...)
        ↓
   Go API (:8080)  →  RabbitMQ  →  Go Worker
                                       ↓
                              1. unzip архив → ./backend/tmp/
                              2. docker run web-<jobID>   (nginx c архивом, :3000)
                              3. docker run cypress-runner (тесты против web-<jobID>)
                              4. stop web-<jobID>
                              5. результат → PostgreSQL (jobs.result)
```

## Требования

- Docker >= 20.x
- Docker Compose >= 2.x
- Свободные порты: **8080** (API), **15672** (RabbitMQ UI)

---

## Запуск

### Шаг 1 — Собрать образы web-server и cypress-runner

```bash
docker compose --profile build-only build
```

Эта команда строит образы `autotest-web-server` и `autotest-cypress-runner`.
Worker запускает их динамически через `docker run`.

### Шаг 2 — Запустить всю инфраструктуру

```bash
docker compose up --build
```

Поднимет: `db` → `rabbitmq` → `app` (API) + `worker`.

---

## Использование

### Создать задачу (загрузить архив)

```bash
curl -X POST http://localhost:8080/jobs \
  -F "file=@/путь/к/архиву.zip" \
  -F "type=preland" \
  -F "author=username" \
  -F "name=test-run-1"
```

Поле `type` — какой набор тестов запустить:
| type | путь к тестам |
|---|---|
| `preland` | cypress/e2e/preland/**/*.cy.js |
| `offer` | cypress/e2e/offer/**/*.cy.js |
| `landoffer` | cypress/e2e/landoffer/**/*.cy.js |

Ответ:
```json
{ "id": "550e8400-e29b-41d4-a716-446655440000" }
```

### Получить статус задачи

```bash
curl http://localhost:8080/jobs?id=550e8400-e29b-41d4-a716-446655440000
```

Статусы: `pending` → `running` → `done` / `failed`

### Список всех задач

```bash
curl http://localhost:8080/jobs
curl "http://localhost:8080/jobs?author=username"
curl "http://localhost:8080/jobs?name=test"
```

---

## Структура проекта

```
autotest/
├── docker-compose.yml          # оркестрация всех сервисов
├── backend/                    # Go backend
│   ├── cmd/app/main.go         # API сервер (:8080)
│   ├── cmd/worker/main.go      # Worker (читает RabbitMQ)
│   ├── docker/
│   │   ├── Dockerfile.app
│   │   └── Dockerfile.worker   # включает docker-cli
│   ├── internal/
│   │   ├── api/                # handler, routes, dto
│   │   ├── executor/
│   │   │   ├── docker.go       # запуск web + cypress контейнеров
│   │   │   └── executor.go     # unzip архива
│   │   ├── service/            # бизнес-логика
│   │   ├── repository/         # работа с PostgreSQL
│   │   ├── worker/             # обработка задач из очереди
│   │   └── queue/rabbitmq/     # RabbitMQ клиент
│   ├── migrations/             # SQL миграции
│   ├── uploads/                # загруженные архивы
│   └── tmp/                    # распакованные архивы (runtime)
├── web-server/                 # nginx образ для раздачи архива
│   ├── Dockerfile
│   └── nginx.conf
└── cypress-runner/             # Cypress тесты
    ├── Dockerfile
    ├── cypress.config.js
    ├── package.json            # включает mochawesome-merge
    ├── plugins/
    │   └── db-reporter.js      # after:run: мёрж JSON + запись в БД
    └── cypress/e2e/
        ├── preland/            # 19 тест-файлов
        ├── offer/
        └── landoffer/
```

---

## Повторный запуск / сброс

```bash
# Остановить
docker compose down

# Полный сброс с БД
docker compose down -v

# Пересобрать образы
docker compose --profile build-only build --no-cache
docker compose up --build
```

## RabbitMQ UI

Открыть в браузере: http://localhost:15672  
Логин: `guest` / Пароль: `guest`
