INSERT INTO schools (id, code, name, timezone)
VALUES ('11111111-1111-1111-1111-111111111111', 'ZP-001', 'ZapRoll Academy', 'Asia/Manila')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (id, school_id, role, status, email, password_hash, full_name)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'teacher',
  'active',
  'teacher@school.edu',
  crypt('password', gen_salt('bf')),
  'Teacher Admin'
)
ON CONFLICT (school_id, email) DO NOTHING;

INSERT INTO users (id, school_id, role, status, email, password_hash, full_name)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'student',
  'active',
  'katrina.santos@school.edu',
  crypt('1234', gen_salt('bf')),
  'Katrina Santos'
)
ON CONFLICT (school_id, email) DO NOTHING;

INSERT INTO students (id, school_id, user_id, student_number, first_name, last_name, grade_level, homeroom, pin_hash)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'ST-078',
  'Katrina',
  'Santos',
  'Grade 12',
  'STEM A',
  crypt('1234', gen_salt('bf'))
)
ON CONFLICT (school_id, student_number) DO NOTHING;