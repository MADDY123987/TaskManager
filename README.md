# 🗂️ Team Task Manager

A production-ready collaborative task management backend built with **Spring Boot 3**, featuring JWT authentication with OTP email verification, project management, task assignment, real-time notifications, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2 |
| Security | Spring Security + JWT |
| Database | MySQL 8 |
| Migrations | Flyway |
| ORM | Spring Data JPA / Hibernate |
| Email | Spring Mail (Gmail SMTP) + Thymeleaf |
| Cache | Redis |
| Messaging | RabbitMQ |
| Resilience | Resilience4j (Circuit Breaker, Retry, Bulkhead) |
| Rate Limiting | Token Bucket (custom filter) |
| API Docs | SpringDoc OpenAPI / Swagger UI |
| Build | Maven |

---

## 🌐 Live Deployment

### Frontend (Vercel)

https://task-manager-murex-alpha.vercel.app

### Backend API (Render)

https://taskmanager-api-5586.onrender.com

### API Documentation

https://taskmanager-api-5586.onrender.com/swagger-ui/index.html

### Health Check

https://taskmanager-api-5586.onrender.com/actuator/health

---

## ✨ Features

- **OTP-based Registration** — email verified before account creation
- **JWT Authentication** — stateless, Bearer token based
- **Forgot Password** — secure OTP reset flow
- **Project Management** — create projects, manage members with roles (ADMIN / MEMBER)
- **Task Management** — assign tasks, set priority and status, track due dates
- **Comments** — per-task comment threads
- **Notifications** — in-app + email notifications for task events
- **User Profile** — editable profile with avatar, bio, department
- **Audit Logs** — track all major actions
- **Dashboard** — summary stats with circuit breaker protection
- **Rate Limiting** — token bucket per IP
- **Async Emails** — non-blocking email delivery via `@Async`

---

## 🔐 Authentication Flow

### Register (2-step)
```
POST /api/auth/register       { name, email }            → sends 4-digit OTP
POST /api/auth/verify-otp     { name, email, otp, password } → returns JWT
```

### Login
```
POST /api/auth/login          { email, password }         → returns JWT
```

### Forgot Password (2-step)
```
POST /api/auth/forgot-password  { email }                 → sends 4-digit OTP
POST /api/auth/reset-password   { email, otp, newPassword } → success
```

### OTP Rules
- 4-digit code, expires in **5 minutes**
- Max **3 attempts** before invalidation
- **30-second cooldown** before resend

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Step 1: send OTP |
| POST | `/verify-otp` | Public | Step 2: create account |
| POST | `/login` | Public | Get JWT token |
| POST | `/forgot-password` | Public | Send reset OTP |
| POST | `/reset-password` | Public | Reset password |
| GET | `/me` | Bearer | Current user info |

### Projects — `/api/projects`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | List my projects |
| POST | `/` | Bearer | Create project |
| GET | `/{id}` | Bearer | Get project |
| PUT | `/{id}` | Bearer | Update project |
| DELETE | `/{id}` | Bearer | Delete project |
| POST | `/{id}/members` | Bearer (ADMIN) | Add member |
| DELETE | `/{id}/members/{userId}` | Bearer (ADMIN) | Remove member |

### Tasks — `/api/tasks`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/project/{projectId}` | Bearer | List tasks |
| POST | `/project/{projectId}` | Bearer | Create task |
| GET | `/{id}` | Bearer | Get task |
| PUT | `/{id}` | Bearer | Update task |
| DELETE | `/{id}` | Bearer (ADMIN) | Delete task |
| PATCH | `/{id}/status` | Bearer | Update status |

### Other
| Prefix | Description |
|---|---|
| `/api/profile` | User profile CRUD |
| `/api/notifications` | In-app notifications |
| `/api/comments` | Task comments |
| `/api/dashboard` | Summary stats |
| `/api/audit` | Audit logs |

Full interactive docs: `http://localhost:8080/swagger-ui.html`

---

## 🗄️ Database Schema

```
users
  └── projects (created_by → users.id)
        └── project_members (project_id, user_id, role)
        └── tasks (project_id, assigned_to, created_by)
              └── comments (task_id, user_id)
otp_verifications (email, otp, purpose, expires_at, attempts)
notifications (user_id, type, title, message)
```

---

## ⚙️ Setup & Run

### Prerequisites
- Java 17+
- MySQL 8
- Redis
- RabbitMQ
- Maven

### 1. Clone & configure

```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/taskmanager
    username: root
    password: your_password

  mail:
    username: your_gmail@gmail.com
    password: your_16_char_app_password   # Gmail App Password

app:
  mail:
    from: your_gmail@gmail.com
```

### 2. Create database

```bash
mysql -u root -p
```
```sql
CREATE DATABASE taskmanager;
exit;
```

### 3. Run

```bash
mvn spring-boot:run
```

Flyway auto-creates all tables on first run.

### 4. Access

| URL | Description |
|---|---|
| `http://localhost:8080/swagger-ui.html` | Swagger UI |
| `http://localhost:8080/api-docs` | OpenAPI JSON |
| `http://localhost:8080/actuator/health` | Health check |

---

## 🌍 Environment Variables (Production / Railway)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8080) |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `MAIL_USERNAME` | Gmail address |
| `MAIL_PASSWORD` | Gmail App Password |
| `REDIS_URL` | Redis connection URL |
| `RABBITMQ_URL` | RabbitMQ AMQP URL |

---

## 📁 Project Structure

```
src/main/java/com/taskmanager/
├── auth/
│   ├── dto/          AuthDTOs.java
│   ├── entity/       User, UserRepository, OtpVerification, OtpRepository
│   ├── AuthController.java
│   ├── AuthService.java
│   └── OtpService.java
├── project/          ProjectController, ProjectService, entities
├── task/             TaskController, TaskService, entities
├── comment/          CommentController, CommentService
├── notification/     EmailService, NotificationService, entities
├── profile/          ProfileController, ProfileService
├── dashboard/        DashboardController, DashboardService
├── audit/            AuditController, AuditService
├── security/         JwtUtil, UserPrincipal, CustomUserDetailsService, TaskSecurityService
├── filter/           JwtAuthFilter, RateLimitFilter
├── config/           SecurityConfig, RabbitMQConfig, RedisConfig
├── common/           ApiResponse
└── exception/        GlobalExceptionHandler, BadRequestException
src/main/resources/
├── db/migration/     V1__init.sql
└── application.yml
```

---

## 🔒 Security

- Passwords hashed with **BCrypt** (strength 12)
- JWT signed with **HMAC-SHA256**
- JWT expiry: **24 hours**
- OTP invalidated after use or after 3 failed attempts
- Rate limiting: 10 req/burst, 5 req/s refill
- CORS configured (update `allowedOriginPatterns` for production)
- CSRF disabled (stateless JWT API)

---

## 📧 Email Setup (Gmail)

1. Enable **2-Step Verification** on your Google account
2. Go to **Security → App Passwords**
3. Generate a password for "Mail" → "Other (TaskManager)"
4. Use the 16-character password in `spring.mail.password`

---

## 🧪 Testing the Auth Flow

```bash
# Step 1: Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Madhavan","email":"your@email.com"}'

# Step 2: Verify OTP (check your email)
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"Madhavan","email":"your@email.com","otp":"1234","password":"secret123"}'

# Step 3: Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"secret123"}'
```

---

## 📄 License

MIT
