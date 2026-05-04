-- Seed academic term if not exists
INSERT INTO academic_terms (id, school_id, name, starts_on, ends_on, is_active) 
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'SY 2025-2026 - Term 2', '2026-01-13', '2026-05-22', true)
ON CONFLICT DO NOTHING;

-- Seed student user accounts
INSERT INTO users (id, email, password_hash, role, full_name, created_at, updated_at)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'st-021@school.edu', '$2a$06$fake1hash', 'student', 'Alyssa Cruz', now(), now()),
  ('44444444-4444-4444-4444-444444444442', 'st-034@school.edu', '$2a$06$fake2hash', 'student', 'Joshua Lim', now(), now()),
  ('44444444-4444-4444-4444-444444444443', 'st-045@school.edu', '$2a$06$fake3hash', 'student', 'Maria Garcia', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'st-056@school.edu', '$2a$06$fake4hash', 'student', 'Marco Santos', now(), now()),
  ('44444444-4444-4444-4444-444444444445', 'st-067@school.edu', '$2a$06$fake5hash', 'student', 'Sofia Reyes', now(), now()),
  ('44444444-4444-4444-4444-444444444446', 'st-078@school.edu', '$2a$06$fake6hash', 'student', 'Katrina Santos', now(), now()),
  ('44444444-4444-4444-4444-444444444447', 'st-089@school.edu', '$2a$06$fake7hash', 'student', 'Adrian Flores', now(), now()),
  ('44444444-4444-4444-4444-444444444448', 'st-090@school.edu', '$2a$06$fake8hash', 'student', 'Luna Torres', now(), now())
ON CONFLICT DO NOTHING;

-- Seed sections
INSERT INTO sections (id, school_id, academic_term_id, section_code, name, grade_level, adviser_user_id, is_active)
VALUES
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'GRADE10A', 'Grade 10 - Newton', 'Grade 10', '22222222-2222-2222-2222-222222222222', true),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'GRADE11B', 'Grade 11 - Einstein', 'Grade 11', '22222222-2222-2222-2222-222222222222', true),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'GRADE12S', 'Grade 12 - STEM A', 'Grade 12', '22222222-2222-2222-2222-222222222222', true)
ON CONFLICT DO NOTHING;

-- Seed section subjects
INSERT INTO section_subjects (id, section_id, subject_code, subject_name, meeting_days, teacher_user_id)
VALUES
  ('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'MATH10', 'Mathematics', '{"Monday","Wednesday","Friday"}', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'ENG10', 'English', '{"Tuesday","Thursday"}', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'PHY11', 'Physics', '{"Monday","Wednesday","Friday"}', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'CHEM11', 'Chemistry', '{"Tuesday","Thursday"}', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', 'CAP12', 'Capstone', '{"Monday","Wednesday","Friday"}', '22222222-2222-2222-2222-222222222222'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 'RES12', 'Research', '{"Tuesday","Thursday"}', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Seed more students (now with valid user_id references)
INSERT INTO students (id, school_id, user_id, student_number, first_name, last_name, grade_level, homeroom, pin_hash, status)
VALUES
  ('11111110-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'ST-021', 'Alyssa', 'Cruz', 'Grade 10', 'Newton', '$2a$06$fake1hash', 'active'),
  ('11111111-1111-1111-1111-111111111110', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', 'ST-034', 'Joshua', 'Lim', 'Grade 10', 'Newton', '$2a$06$fake2hash', 'active'),
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444443', 'ST-045', 'Maria', 'Garcia', 'Grade 10', 'Newton', '$2a$06$fake3hash', 'active'),
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'ST-056', 'Marco', 'Santos', 'Grade 11', 'Einstein', '$2a$06$fake4hash', 'active'),
  ('11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444445', 'ST-067', 'Sofia', 'Reyes', 'Grade 11', 'Einstein', '$2a$06$fake5hash', 'active'),
  ('11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444446', 'ST-078', 'Katrina', 'Santos', 'Grade 12', 'STEM A', '$2a$06$fake6hash', 'active'),
  ('11111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444447', 'ST-089', 'Adrian', 'Flores', 'Grade 12', 'STEM A', '$2a$06$fake7hash', 'active'),
  ('11111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444448', 'ST-090', 'Luna', 'Torres', 'Grade 12', 'STEM A', '$2a$06$fake8hash', 'active')
ON CONFLICT DO NOTHING;

-- Enroll students in sections
INSERT INTO student_enrollments (id, student_id, section_id)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111110-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff0', '11111111-1111-1111-1111-111111111110', '66666666-6666-6666-6666-666666666666'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', '11111111-1111-1111-1111-111111111112', '66666666-6666-6666-6666-666666666666'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', '11111111-1111-1111-1111-111111111113', '77777777-7777-7777-7777-777777777777'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff3', '11111111-1111-1111-1111-111111111114', '77777777-7777-7777-7777-777777777777'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff4', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff5', '11111111-1111-1111-1111-111111111116', '88888888-8888-8888-8888-888888888888'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff6', '11111111-1111-1111-1111-111111111117', '88888888-8888-8888-8888-888888888888')
ON CONFLICT DO NOTHING;
