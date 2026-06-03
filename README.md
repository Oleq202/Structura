# Structura

A modern Field Service Management (FSM) system for property maintenance. Enables building administrators to assign work orders and contractors to resolve them on-site. Built as a high-performance web app using React, FastAPI, and PostgreSQL.

## Features

- **Role-Based Access Control**: Three user roles (Admin, Manager, Contractor) with scoped permissions
- **Task Management**: Create, assign, and track maintenance tasks across multiple buildings
- **Building Management**: Manage properties with detailed location information (city, district, street address)
- **Activity Logging**: Complete audit trail of all task modifications and system events
- **Real-Time Updates**: WebSocket support for live task status updates
- **Multi-Building Support**: Managers can oversee multiple properties through flexible mapping
- **Geographic Organization**: Buildings organized by city and district for efficient regional management

## Tech Stack

### Backend
- **FastAPI** (0.115.12) - Modern, fast web framework for building APIs
- **PostgreSQL** - Relational database with asyncpg driver
- **JWT Authentication** - Secure token-based authentication with python-jose
- **bcrypt** - Password hashing for security
- **WebSockets** - Real-time communication support
- **Pydantic** - Data validation and settings management

### Frontend
- **React 19** - UI library with modern hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **ESLint** - Code linting and quality control

## Project Structure

```
Structura/
├── backend/
│   ├── app/
│   │   ├── db/          # Database connection and models
│   │   └── main.py      # FastAPI application entry point
│   ├── tests/           # Backend test suite
│   ├── requirements.txt # Python dependencies
│   └── pytest.ini      # Pytest configuration
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── assets/     # Source assets
│   │   ├── App.tsx     # Main application component
│   │   └── i18n.js     # Internationalization setup
│   ├── package.json    # Node.js dependencies
│   └── vite.config.js  # Vite configuration
├── database.md         # Database schema documentation
└── README.md          # This file
```

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users** - User accounts with role-based access (admin, manager, contractor)
- **buildings** - Property locations with geographic details
- **tasks** - Work orders with status tracking and assignment
- **activity_logs** - Audit trail for task modifications
- **building_managers** - Junction table for manager-to-building relationships

For detailed schema information, see [database.md](database.md).

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables (create `.env` file):
```
DATABASE_URL=postgresql://user:password@localhost:5432/structura
SECRET_KEY=your-secret-key-here
```

6. Run the backend server:
```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

## API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## User Roles

- **Admin**: Global access to all buildings, tasks, and users
- **Manager**: Can create and assign tasks for buildings they manage
- **Contractor**: Can view and update tasks assigned to them

## Development

### Adding New Features
1. Backend: Add endpoints in `backend/app/main.py`
2. Frontend: Create components in `frontend/src/components/`
3. Database: Update schema in `database.md` and migrate accordingly

### Code Style
- Backend: Follow PEP 8 guidelines
- Frontend: Use ESLint configuration provided
- Commit messages: Use clear, descriptive messages

## License

This project is licensed under the MIT License.
