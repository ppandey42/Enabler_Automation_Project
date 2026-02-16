-- Initialize database schema for LS ENABLER
-- This file is used by PostgreSQL in Docker

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE rfi_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE rfi_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE reject_reason AS ENUM ('Invalid Data', 'Missing Documents', 'Policy Violation', 'Technical Issues');
CREATE TYPE reject_status AS ENUM ('Pending', 'Appealed', 'Final');
CREATE TYPE document_type AS ENUM ('Architecture', 'Design', 'Implementation', 'Testing');
CREATE TYPE review_priority AS ENUM ('Urgent', 'High', 'Normal', 'Low');
CREATE TYPE review_status AS ENUM ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Needs Revision');

-- Set timezone
SET timezone = 'UTC';