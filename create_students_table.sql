-- SQL query to create the students table in Supabase
-- Run this in the Supabase SQL Editor if your table doesn't exist or has a different schema

-- Drop the table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS students;

-- Create the students table with the correct schema
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  collegename TEXT NOT NULL,
  degree TEXT NOT NULL,
  passingyear TEXT NOT NULL,
  domaininterest TEXT NOT NULL,
  assessment_pdf BYTEA,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Add an index on created_at for sorting in the admin panel
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Grant access to the authenticated and anon roles (for RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated, anon;

-- Example Row Level Security (RLS) policy
-- Uncomment and modify as needed
/*
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for selecting students (read-only for all users)
CREATE POLICY select_students ON students
  FOR SELECT
  USING (true);

-- Policy for inserting students (only authenticated users)
CREATE POLICY insert_students ON students
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating students (only authenticated users, only their own records)
CREATE POLICY update_students ON students
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/