# Team Task Manager — Backend API

A production-grade Spring Boot REST API for team task management with JWT auth, RBAC, Redis caching, RabbitMQ async events, and Resilience4j circuit breakers.

---

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | Spring Boot 3.2, Java 17                |
| Auth          | Spring Security + JWT (JJWT 0.12)       |
| Database      | MySQL 8 + Spring Data JPA + Flyway      |
| Cache         | Redis (Spring Cache, TTL 60s)           |
| Messaging     | RabbitMQ (task events, overdue scanner) |
| Resilience    | Resilience4j (circuit breaker, retry, bulkhead) |
| Docs          | springdoc-openapi (Swagger UI)          |
| Containerised | Docker multi-stage build                |
| Deployed on   | Railway                                 |

---

## API Endpoints

### Auth
| Method | Path                  | Access | Description              |
|--------|-----------------------|--------|--------------------------|
| POST   | `/api/auth/signup`    | Public | Register new user        |
| POST   | `/api/auth/login`     | Public | Login, returns JWT       |
| GET    | `/api/auth/me`        | Auth   | Current user info        |

### Projects
| Method | Path                                    | Access | Description              |
|--------|-----------------------------------------|--------|--------------------------|
| POST   | `/api/projects`                         | Auth   | Create project (→ Admin) |
| GET    | `/api/projects`                         | Auth   | List my projects         |
| GET    | `/api/projects/{id}`                    | Member | Project details          |
| PUT    | `/api/projects/{id}`                    | Admin  | Update project           |
| DELETE | `/api/projects/{id}`                    | Admin  | Delete project           |
| POST   | `/api/projects/{id}/members`            | Admin  | Add member               |
| DELETE | `/api/projects/{id}/members/{userId}`   | Admin  | Remove member            |

### Tasks
| Method | Path                                    | Access   | Description               |
|--------|-----------------------------------------|----------|---------------------------|
| POST   | `/api/projects/{id}/tasks`              | Admin    | Create task               |
| GET    | `/api/projects/{id}/tasks`              | Member*  | List tasks (* own only)   |
| GET    | `/api/tasks/{id}`                       | Member*  | Get task                  |
| PUT    | `/api/tasks/{id}`                       | Admin/Assignee | Update task        |
| PATCH  | `/api/tasks/{id}/status`                | Assignee | Update status only        |
| DELETE | `/api/tasks/{id}`                       | Admin    | Delete task               |

### Dashboard
| Method | Path              | Access | Description                       |
|--------|-------------------|--------|-----------------------------------|
| GET    | `/api/dashboard`  | Auth   | Metrics: totals, by-status, overdue (cached 60s) |

---

## Local Development

### Prerequisites
- Java 17+
- Maven 3.9+
- Docker & Docker Compose

### 1. Clone and configure
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
cp .env.example .env
# Edit .env with your local values
```

### 2. Start infrastructure with Docker Compose
```bash
docker compose up -d
```
This starts MySQL, Redis, and RabbitMQ locally.

### 3. Run the application
```bash
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4. Run tests
```bash
mvn test
```
Tests use H2 in-memory DB and skip Redis/RabbitMQ automatically.

---

## Docker Compose (local infra)

```yaml
# docker-compose.yml  — paste this alongside the project
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: taskmanager
    ports: ["3306:3306"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"   # management UI at localhost:15672
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

---

## Railway Deployment

### One-time setup

1. Create a Railway project at [railway.app](https://railway.app)
2. Add three plugins from the Railway dashboard:
   - **MySQL** — Railway auto-sets `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
   - **Redis** — Railway auto-sets `REDIS_URL`
   - **RabbitMQ** — Railway auto-sets `RABBITMQ_URL`
3. Add these environment variables manually in Railway → Variables:

```
DB_URL=jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
REDIS_URL=${{REDIS_URL}}
RABBITMQ_URL=${{RABBITMQ_URL}}
JWT_SECRET=<run: openssl rand -hex 32>
```

4. Deploy:
```bash
railway login
railway link
railway up
```

Railway will build the Dockerfile and deploy. Flyway runs migrations automatically on startup.

### Health check
```
GET https://your-app.railway.app/actuator/health
```

### Swagger UI on Railway
```
https://your-app.railway.app/swagger-ui.html
```

---

## Render Deployment

1. Create a new **Web Service** → connect your GitHub repo
2. Set **Runtime**: Docker
3. Add the same environment variables as above (Render provides PostgreSQL/Redis add-ons, or use external services)
4. Set **Health Check Path**: `/actuator/health`

> **Note for Render free tier:** Free instances spin down after inactivity. Use the paid tier or set a cron ping to keep it alive.

---

## Architecture Highlights

### Resilience4j patterns
- **Circuit Breaker** on dashboard and task list — opens after 5 failures, serves fallback (empty/stale) response
- **Retry** on transient DB errors — 3 attempts, exponential backoff (100ms → 200ms → 400ms)
- **Bulkhead** — dashboard queries use a separate thread pool (max 10 concurrent) so a slow aggregation cannot starve task mutations

### Redis caching
- `dashboard` cache: TTL 60s, evicted on any task write
- `projects` cache: TTL 120s, evicted on member changes
- Rate limiting: token bucket per `userId` or IP, 100 req/min

### RabbitMQ async events
- `task.assigned` queue: fired when a task is assigned; consumer logs and can email
- `task.overdue.check` queue: fed by a scheduled scan every 30 min
- Dead Letter Queue configured on the assigned queue for failed messages

### RBAC (two-layer)
1. `@PreAuthorize` / `TaskSecurityService` at the controller layer
2. Service-layer ownership check — Members can only update tasks assigned to them, preventing horizontal privilege escalation

---

## Project Structure

```
src/main/java/com/taskmanager/
├── TaskManagerApplication.java
├── auth/                   # Signup, login, JWT
├── project/                # Project CRUD, membership
├── task/                   # Task CRUD, assignment, scheduler
├── dashboard/              # Aggregated metrics
├── messaging/              # RabbitMQ publisher + consumer
├── security/               # JWT util, UserPrincipal, RBAC service
├── filter/                 # JWT auth filter, rate-limit filter
├── config/                 # Security, Redis, RabbitMQ, OpenAPI
├── common/                 # ApiResponse wrapper
└── exception/              # Custom exceptions + global handler
```

---

## Environment Variables Reference

| Variable        | Required | Description                              |
|-----------------|----------|------------------------------------------|
| `DB_URL`        | Yes      | MySQL JDBC URL                           |
| `DB_USERNAME`   | Yes      | MySQL username                           |
| `DB_PASSWORD`   | Yes      | MySQL password                           |
| `REDIS_URL`     | Yes      | Redis connection URL                     |
| `RABBITMQ_URL`  | Yes      | RabbitMQ AMQP URL                        |
| `JWT_SECRET`    | Yes      | Min 256-bit secret for JWT signing       |
| `PORT`          | No       | HTTP port (default: 8080; Railway injects automatically) |
