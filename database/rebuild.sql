/* =====================================================
   REBUILD DATABASE SCRIPT
   School Management System
   -----------------------------------------------------
   - Drops old tables
   - Recreates all tables
   - Adds relationships
===================================================== */

-- =========================================
-- DROP TABLES (SAFE ORDER - CHILD → PARENT)
-- =========================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS staff_assignments CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS parent_student CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- =========================================
-- USERS TABLE (ALL ROLES)
-- =========================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'student', 'parent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- PARENT ↔ STUDENT RELATION
-- =========================================
CREATE TABLE parent_student (
  id SERIAL PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,

  CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT unique_parent_student UNIQUE (parent_id, student_id)
);


-- =========================================
-- CLASSES TABLE
-- =========================================
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- SUBJECTS TABLE
-- =========================================
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- STAFF ASSIGNMENTS TABLE
-- =========================================
CREATE TABLE staff_assignments (
  id SERIAL PRIMARY KEY,
  staff_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_staff_assignment_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_assignment_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_assignment_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,

  CONSTRAINT unique_staff_assignment UNIQUE (staff_id, class_id, subject_id)
);


-- =========================================
-- LESSONS TABLE
-- =========================================
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  staff_id INT NOT NULL,
  title TEXT NOT NULL,
  subject VARCHAR(50),
  class VARCHAR(50),
  term VARCHAR(20),

  type VARCHAR(20) NOT NULL CHECK (type IN ('lesson_note', 'lesson_plan')),

  file_url TEXT NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =========================================
-- RESULTS TABLE
-- =========================================
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(50) NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  term VARCHAR(20) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =========================================
-- PUBLISHED REPORT CARDS TABLE
-- =========================================
CREATE TABLE result_publications (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  total_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  average_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  remark VARCHAR(20) NOT NULL,
  published_by INT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_result_publication_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_publication_published_by FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_result_publication UNIQUE (student_id, term)
);


-- =========================================
-- ATTENDANCE TABLE
-- =========================================
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  staff_id INT NOT NULL,

  action VARCHAR(20) NOT NULL CHECK (action IN ('Check-In', 'Check-Out')),

  date DATE NOT NULL,
  time TIME NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_attendance_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =========================================
-- NOTIFICATIONS TABLE
-- =========================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,

  user_id INT,
  role_target VARCHAR(20), -- optional broadcast

  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =========================================
-- ANNOUNCEMENTS TABLE
-- =========================================
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  role_target VARCHAR(20), -- admin can target role

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- EVENTS TABLE
-- =========================================
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  image_url TEXT,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- GALLERY IMAGES TABLE
-- =========================================
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- INDEXES (PERFORMANCE BOOST)
-- =========================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_attendance_staff ON attendance(staff_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_lessons_staff ON lessons(staff_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_staff_assignments_staff ON staff_assignments(staff_id);
CREATE INDEX idx_staff_assignments_class ON staff_assignments(class_id);
CREATE INDEX idx_staff_assignments_subject ON staff_assignments(subject_id);


-- =========================================
-- INITIAL CLASSES + SUBJECTS (OPTIONAL)
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO classes (name) VALUES
  ('Primary 1'),
  ('Primary 2'),
  ('Primary 3'),
  ('Secondary 1'),
  ('Secondary 2')
ON CONFLICT DO NOTHING;

INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Science'),
  ('History'),
  ('French')
ON CONFLICT DO NOTHING;


-- =========================================
-- SEED ADMIN + STAFF USERS (OPTIONAL)
-- =========================================
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@school.com', '@Hashedpassword12', 'admin');

INSERT INTO users (name, email, password, role)
VALUES ('Staff User', 'staff@school.com', '@Hashedpassword123', 'staff');