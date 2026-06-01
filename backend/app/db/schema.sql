-- Create role enum for strict access control
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'contractor');

-- Create task status enum
CREATE TYPE task_status AS ENUM ('pending', 'completed');

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BUILDINGS TABLE
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    street_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASKS TABLE (The single unified registry)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTIVITY LOGS TABLE (For Admin telemetry)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Junction table linking Managers (from users table) to Buildings
CREATE TABLE building_managers (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, building_id)
);

-- PERFORMANCE INDEXES FOR FAST API SPEEDS

-- Optimizes the Contractor's mobile dashboard query (where assigned_to = current_user_id)
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Optimizes Admin reports and regional filtering
CREATE INDEX idx_buildings_city_district ON buildings(city, district);

-- Optimizes loading the history feed for a particular task
CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);

-- Index for lightning-fast lookups when a manager logs in
CREATE INDEX idx_building_managers_user ON building_managers(user_id);

-- Trigger function to automatically maintain the updated_at timestamp on task edits
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();