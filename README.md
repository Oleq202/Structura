# Structura

**Enterprise Field Service Management (FSM) & Property Maintenance Platform** — A modern, high-performance web application designed for property managers, administrators, and field contractors to orchestrate work orders, track building assets, and monitor operations in real time.

[![Backend](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-TailwindCSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Auth](https://img.shields.io/badge/Auth-JWT_&_HTTP--Only_Cookies-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [Core Features](#-core-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema & Architecture](#-database-schema--architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [User Roles & Permissions](#-user-roles--permissions)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [API Documentation](#-api-documentation)
- [License](#-license)

---

## 🌟 Key Highlights

- **Fine-Grained Role-Based Access Control (RBAC)**: Clear permission boundaries across Admin (system-wide administration & audit logs), Property Manager (all-building task creation, editing & dispatch), and Field Contractor (self-assigned task execution).
- **Comprehensive Building & Workspace Filtering**: Managers can access all buildings and customize their active workspace view with persistent building filters.
- **Admin-Only Audit Trail & Activity Logging**: Secure audit logging tracking task lifecycle events, IP addresses, user agents, and granular state diffs — accessible exclusively to Administrators.
- **Dual-Language Internationalization (i18n)**: Instant runtime switching between English (`en`) and Polish (`pl`).
- **Security-First Architecture**: 
Short-lived in-memory JWT access tokens, secure HTTP-only refresh token rotation with replay attack protection, and distributed sliding-window rate limiting (in-memory + Redis fallback).

---

## 🚀 Core Features

### 📋 Work Order & Task Management
- Create, edit, assign, prioritize, and track maintenance tasks across all properties.
- Dynamic task states: `pending` and `completed` with full lifecycle tracking.
- Filter tasks by status, contractor, building, city, district, or keyword search.
- Automatic timestamp maintenance via database triggers.

### 🏢 Property & Building Operations
- Full catalog of managed properties with geographic metadata (City, District, Street Address).
- Managers have full visibility across all buildings to coordinate maintenance work orders.
- Persistent workspace-level building filtering (`user_selected_buildings`) allowing users to tailor their active dashboard view.

### 🛡️ System Audit Trail (Admin Exclusive)
- Comprehensive timeline ledger capturing entity operations (`create`, `update`, `delete`, `status_change`).
- Filter logs by operation type, author, target entity, or timestamp range.
- Full accountability tracking with client IP address, user agent, and before/after JSON diffs.

### 📱 Responsive & Mobile-Ready UI
- Glassmorphism design elements and fluid animations.
- Dedicated mobile bottom navigation bar and desktop header for seamless cross-device workflows.
- Accessible modal dialogs for rapid task creation, building updates, and user management.

---

## 🛠️ Architecture & Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (0.115+) — High-performance async Python web framework
- **Server**: [Uvicorn](https://www.uvicorn.org/) with uvloop support
- **Database Driver**: [asyncpg](https://github.com/MagicStack/asyncpg) — High-throughput asynchronous PostgreSQL client with connection pooling
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) — Strict schema validation and settings parsing
- **Authentication**: `python-jose` (JWT) + `bcrypt` (secure password hashing)
- **Rate Limiting**: Custom sliding-window token bucket with optional Redis distributed backend
- **Real-Time / Async**: WebSocket channels & background worker tasks

### Frontend
- **Framework**: [React 19](https://react.dev/) — Latest React architecture with concurrent rendering
- **Build Tool**: [Vite 8](https://vitejs.dev/) — Lightning-fast HMR and bundle optimization
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — Next-generation utility-first styling engine
- **Routing**: [React Router v7](https://reactrouter.com/) — Declarative client-side navigation
- **Internationalization**: Custom lightweight i18n engine with complete English & Polish dictionaries
- **Quality Tools**: ESLint, React Doctor, Prettier

---

## 📂 Project Structure

```
Structura/
├── backend/
│   ├── app/
│   │   ├── db/                 # Database initialization, connection pool, schema.sql & seed.sql
│   │   ├── auth.py             # JWT token handling & password hashing
│   │   ├── main.py             # FastAPI entry point & API route handlers
│   │   ├── models.py           # Pydantic request/response schemas & domain models
│   │   ├── rate_limiter.py     # Sliding window rate limiting (In-memory / Redis)
│   │   └── worker.py           # Background processing & scheduled workers
│   ├── tests/                  # Pytest test suite
│   ├── .env.example            # Backend environment template
│   ├── pytest.ini             # Pytest configuration
│   └── requirements.txt        # Python backend dependencies
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images, logos, and icons
│   │   ├── components/         # Reusable UI components (Modals, Task, Header, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Application views (LoginPage, ManagerPage, LogsPage, SettingsPage)
│   │   ├── services/           # API client and authentication services
│   │   ├── App.jsx             # Main routing and layout orchestrator
│   │   ├── i18n.js             # Translation dictionaries & language state
│   │   ├── theme.js            # Theme switching and storage logic
│   │   └── index.css           # Global stylesheet & Tailwind directives
│   ├── package.json            # Frontend dependencies and npm scripts
│   └── vite.config.js          # Vite configuration
├── database.md                 # Full database schema and entity relationship documentation
└── README.md                   # Project documentation
```

---

## 🗄️ Database Schema & Architecture

Structura uses a normalized PostgreSQL relational database with 8 core tables:

1. **`users`** — User credentials, profile info, role (`admin`, `manager`, `contractor`), active status, and soft deletion (`deleted_at`).
2. **`buildings`** — Physical properties with geographic normalization (`city`, `district`, `street_address`), active status, and soft deletion.
3. **`tasks`** — Work orders tracked with `pending`/`completed` statuses, building references, creator, assignee, and automatic trigger-managed `updated_at`.
4. **`activity_logs`** — Granular audit trail capturing `create`/`update`/`delete`/`status_change` operations, `changes_json`, IP address, user agent, and timestamps.
5. **`building_managers`** — Many-to-many junction table mapping property managers to assigned buildings.
6. **`user_preferences`** — User-specific settings (e.g. persistent language preference `pl`/`en`).
7. **`user_selected_buildings`** — Persists each user's active workspace building filter selections.
8. **`user_sessions`** — Manages refresh token rotation with token family UUIDs (`family_id`) for secure session lifecycle and replay attack protection.

```
┌─────────────────────────────────┐
│        user_preferences         │
├─────────────────────────────────┤
│ user_id (PK, FK -> users.id)    │
│ language                        │
│ created_at, updated_at          │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              users              │           │            buildings            │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ login (Unique)                  │           │ city                            │
│ password_hash                   │           │ district                        │
│ first_name, last_name           │           │ street_address                  │
│ role (ENUM: admin/mgr/contract) │           │ is_active (BOOLEAN)             │
│ is_active, created_at, deleted_at           │ created_at, deleted_at          │
└───────┬──────────┬──────────▲───┘           └────────────────▲────────────────┘
        │          │          │                                │
        │          │          ├───────────────────────┐        │
        │          │          │   building_managers   │        │
        │          │          ├───────────────────────┤        │
        │          │          │ user_id (PK, FK)      ├────────┼────────┐
        │          │          │ building_id (PK, FK)  ├────────┘        │
        │          │          └───────────────────────┘                 │
        │          │                                                    │
        │          │          ┌──────────────────────────────┐          │
        │          │          │   user_selected_buildings    │          │
        │          │          ├──────────────────────────────┤          │
        │          │          │ user_id (PK, FK)             │          │
        │          │          │ building_id (PK, FK) ────────┼──────────┤
        │          │          └──────────────────────────────┘          │
        │          │                                                    │
        │          ▼                                                    │
        │ ┌─────────────────────────────────┐                           │
        │ │          user_sessions          │                           │
        │ ├─────────────────────────────────┤                           │
        │ │ id (PK), user_id (FK), token    │                           │
        │ │ family_id (UUID), expires_at    │                           │
        │ └─────────────────────────────────┘                           │
        │                                                               │
        │ creates (created_by) / assigns (assigned_to)                  │
        ▼                                                               ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                     tasks                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ id (PK) | title | description | status (pending/completed) | building_id (FK) │
│ created_by (FK) | assigned_to (FK) | created_at | updated_at | deleted_at     │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
                                        │ generates audit trail (Admin Only)
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                 activity_logs                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│ id (PK) | task_id (FK) | user_id (FK) | operation_type | action | changes_json│
│ entity_type | entity_id | ip_address | user_agent | timestamp                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

For full table schemas, column data types, constraints, partial indexes, and database triggers, see [database.md](database.md).

---

## ⚡ Getting Started

### Prerequisites

- **Python**: 3.9+
- **Node.js**: 18+ (Node 20+ recommended)
- **PostgreSQL**: 14+
- **Redis** *(Optional)*: 6+ (for distributed rate limiting)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and fill in your database credentials and secret key.*

5. **Start the development server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will be available at `http://localhost:8000`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `string` | *Required* | PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`) |
| `SECRET_KEY` | `string` | *Required* | Cryptographically secure 32+ character key for JWT signing |
| `JWT_ALGORITHM` | `string` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | `15` | Access token lifespan (in minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `int` | `7` | Refresh token lifespan (in days) |
| `ENVIRONMENT` | `string` | `development` | Runtime environment (`development` \| `production`) |
| `COOKIE_SECURE` | `bool` | `false` | Enable `Secure` flag on cookies (set to `true` with HTTPS) |
| `ALLOWED_ORIGINS` | `string` | `http://localhost:5173` | Comma-separated CORS allowed origins |
| `DB_POOL_MIN_SIZE` | `int` | `2` | Minimum asyncpg database pool connections |
| `DB_POOL_MAX_SIZE` | `int` | `10` | Maximum asyncpg database pool connections |
| `REDIS_URL` | `string` | *Optional* | Redis URL for distributed rate limiting (`redis://localhost:6379/0`) |

---

## 👥 User Roles & Permissions

| Feature / Action | Admin | Manager | Contractor |
| :--- | :---: | :---: | :---: |
| **View Buildings** | ✅ | ✅ | ❌ |
| **Manage Buildings (Create/Edit/Delete)** | ✅ | ❌ | ❌ |
| **View Tasks** | ✅ | ✅ | 🔶 Assigned To Self |
| **Create & Edit Tasks** | ✅ | ✅ | ❌ |
| **Update Task Status** | ✅ | ✅ | ✅ (Assigned To Self) |
| **Assign Tasks to Contractors** | ✅ | ✅ | ❌ |
| **Manage Users & Roles** | ✅ | ❌ | ❌ |
| **View System Audit Logs** | ✅ | ❌ | ❌ |

---

## 🧪 Testing & Quality Assurance

### Backend Tests
Run the automated test suite with pytest:
```bash
cd backend
pytest
```

### Frontend Code Quality
Check code formatting, linting, and health:
```bash
cd frontend

# Run ESLint
npm run lint

# Run React Doctor health checks
npm run doctor
```

---

## 📖 API Documentation

Once the backend is running, you can explore and test the endpoints directly via the interactive Swagger and ReDoc interfaces:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 📄 License

Copyright &copy; 2026 Structura. All Rights Reserved.  
Proprietary software. Unauthorized copying, distribution, or modification is strictly prohibited. See [LICENSE](LICENSE) for terms.
