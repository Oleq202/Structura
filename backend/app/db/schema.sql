CREATE TYPE user_role AS ENUM ('admin', 'manager', 'contractor');

CREATE TYPE task_status AS ENUM ('pending', 'completed');

CREATE TYPE operation_type AS ENUM ('create', 'update', 'delete', 'status_change');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    street_address VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    operation_type VARCHAR(50) NOT NULL DEFAULT 'update',
    action VARCHAR(255) NOT NULL,
    changes_json JSONB,
    entity_type VARCHAR(50) DEFAULT 'task',
    entity_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE building_managers (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, building_id)
);


CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'pl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_selected_buildings (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, building_id)
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

CREATE INDEX idx_buildings_city_district ON buildings(city, district);

CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- CREATE INDEX idx_building_managers_user ON building_managers(user_id);

CREATE INDEX idx_tasks_active ON tasks(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_building_active ON tasks(building_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_buildings_active ON buildings(city, district) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_users_active ON users(role) WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_family_id ON user_sessions(family_id);

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

