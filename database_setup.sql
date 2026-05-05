-- Run this in your PostgreSQL client (psql or pgAdmin)
-- to create the TutorConnect database

-- Create database
CREATE DATABASE tutorconnect;

-- Connect to database
\c tutorconnect;

-- All tables are created automatically by SQLAlchemy when the FastAPI server starts.
-- Just make sure PostgreSQL is running and the DATABASE_URL in .env is correct.

-- Optional: Create a dedicated user (recommended for production)
-- CREATE USER tcuser WITH PASSWORD 'yourpassword';
-- GRANT ALL PRIVILEGES ON DATABASE tutorconnect TO tcuser;

-- After first server startup, you can seed demo data:
-- (The server creates all tables on startup via SQLAlchemy)
