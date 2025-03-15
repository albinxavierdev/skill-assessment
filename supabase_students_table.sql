-- SQL query to create the students table in Supabase
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  collegeName TEXT NOT NULL,
  degree TEXT NOT NULL,
  passingYear INTEGER NOT NULL,
  domainInterest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on email for faster lookups
CREATE INDEX idx_students_email ON students(email);

-- Add an index on created_at for sorting in the admin panel
CREATE INDEX idx_students_created_at ON students(created_at); 