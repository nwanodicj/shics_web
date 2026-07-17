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
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS parent_student CASCADE;
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
-- INDEXES (PERFORMANCE BOOST)
-- =========================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_attendance_staff ON attendance(staff_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_lessons_staff ON lessons(staff_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);


-- =========================================
-- SEED ADMIN + STAFF USERS (OPTIONAL)
-- =========================================
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@school.com', '@Hashedpassword12', 'admin');

INSERT INTO users (name, email, password, role)
VALUES ('Staff User', 'staff@school.com', '@Hashedpassword123', 'staff');