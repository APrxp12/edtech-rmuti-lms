-- ==============================================================================
-- RMUTI LMS - Supabase Database Schema & Initial Data
-- Course: 30-401-001-204 นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้
-- Instructor: ผศ.ดร.เฉลิมพล บุญทศ
-- ==============================================================================
-- วิธีการใช้งาน:
-- 1. ไปที่ Supabase Dashboard (https://supabase.com/dashboard)
-- 2. เลือกโปรเจกต์ของคุณ -> ไปที่เมนู "SQL Editor" จากแถบเมนูด้านซ้าย
-- 3. วางโค้ด SQL ด้านล่างนี้ทั้งหมด แล้วกดปุ่ม "Run" ด้านล่างขวา
-- ==============================================================================

-- 1. สร้างตาราง USERS (ข้อมูลผู้ใช้, สิทธิ์, รูปโปรไฟล์ Google)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  student_id TEXT NOT NULL DEFAULT '-',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  is_profile_completed BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT DEFAULT '',
  first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. สร้างตาราง ACCESS_RULES (กฎ Whitelist โดเมน และอีเมล)
CREATE TABLE IF NOT EXISTS public.access_rules (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('domain', 'email')),
  value TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'allow' CHECK (decision IN ('allow', 'deny')),
  default_role TEXT NOT NULL DEFAULT 'student' CHECK (default_role IN ('student', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. สร้างตาราง ANNOUNCEMENTS (ประกาศและข่าวสารรายวิชา)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('announcement', 'update', 'activity')),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. สร้างตาราง USER_PROGRESS (ความก้าวหน้าการเรียนและผลคะแนน)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  assigned_version_id TEXT NOT NULL DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_percent NUMERIC NOT NULL DEFAULT 0,
  is_pre_test_completed BOOLEAN NOT NULL DEFAULT false,
  pre_test_score JSONB,
  is_post_test_unlocked BOOLEAN NOT NULL DEFAULT false,
  post_test_attempts JSONB DEFAULT '[]'::jsonb,
  pre_test_attempts JSONB DEFAULT '[]'::jsonb,
  best_post_test_score_percent NUMERIC,
  watched_videos JSONB DEFAULT '{}'::jsonb,
  first_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_lesson_unique UNIQUE (user_id, lesson_id)
);

-- 5. สร้างตาราง SYSTEM_SETTINGS (การตั้งค่าระบบและเกณฑ์การผ่าน)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. สร้างตาราง LESSONS (บทเรียน, โครงสร้างคลิปวิดีโอ, เอกสาร PDF, Infographic)
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  counts_in_course_progress BOOLEAN NOT NULL DEFAULT true,
  cover_image_url TEXT,
  intro_infographic_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  current_published_version_id TEXT,
  current_draft_version_id TEXT,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. สร้างตาราง QUIZZES (แบบทดสอบก่อนเรียนและหลังเรียน, ข้อสอบ, ชอยส์, เฉลย)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre_test', 'post_test')),
  title TEXT NOT NULL,
  current_published_version_id TEXT,
  current_draft_version_id TEXT,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- อนุญาตให้เว็บฝั่ง Client สามารถอ่านและบันทึกข้อมูลผ่าน anon key ได้อย่างปลอดภัย
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- นโยบาย USERS
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update users" ON public.users;
CREATE POLICY "Allow public insert/update users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย ACCESS_RULES
DROP POLICY IF EXISTS "Allow public read access_rules" ON public.access_rules;
CREATE POLICY "Allow public read access_rules" ON public.access_rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write access_rules" ON public.access_rules;
CREATE POLICY "Allow public write access_rules" ON public.access_rules FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย ANNOUNCEMENTS
DROP POLICY IF EXISTS "Allow public read announcements" ON public.announcements;
CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write announcements" ON public.announcements;
CREATE POLICY "Allow public write announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย USER_PROGRESS
DROP POLICY IF EXISTS "Allow public read user_progress" ON public.user_progress;
CREATE POLICY "Allow public read user_progress" ON public.user_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write user_progress" ON public.user_progress;
CREATE POLICY "Allow public write user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย SYSTEM_SETTINGS
DROP POLICY IF EXISTS "Allow public read system_settings" ON public.system_settings;
CREATE POLICY "Allow public read system_settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write system_settings" ON public.system_settings;
CREATE POLICY "Allow public write system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย LESSONS
DROP POLICY IF EXISTS "Allow public read lessons" ON public.lessons;
CREATE POLICY "Allow public read lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write lessons" ON public.lessons;
CREATE POLICY "Allow public write lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);

-- นโยบาย QUIZZES
DROP POLICY IF EXISTS "Allow public read quizzes" ON public.quizzes;
CREATE POLICY "Allow public read quizzes" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write quizzes" ON public.quizzes;
CREATE POLICY "Allow public write quizzes" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTION
-- เปิดระบบ Realtime ให้เมื่อมีผู้ใช้ล็อกอิน หน้า Admin จะอัปเดตทันที
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'access_rules'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.access_rules;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lessons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'quizzes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
  END IF;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA (ข้อมูลเริ่มต้นระบบ)
-- ==============================================================================

-- 1. ผู้ดูแลระบบและผู้ใช้งานเริ่มต้น
INSERT INTO public.users (id, email, full_name, display_name, student_id, role, status, is_profile_completed, avatar_url)
VALUES 
  ('usr-dev-001', 'bugzonvazan@gmail.com', 'ผู้พัฒนาระบบ (Developer)', 'Lamut (ผู้พัฒนา)', '-', 'admin', 'active', true, ''),
  ('usr-prof-001', 'chalermpol.b@rmuti.ac.th', 'ผศ.ดร.เฉลิมพล บุญทศ', 'ผศ.ดร.เฉลิมพล บุญทศ', '-', 'admin', 'active', true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'),
  ('usr-std-001', 'mon.yeedee@rmuti.ac.th', 'นางสาวมน ยี่ดี', 'มน ยี่ดี', '6730401001-2', 'student', 'active', true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'),
  ('usr-std-002', 'somchai.jai@rmuti.ac.th', 'นายสมชาย ใจดี', 'สมชาย ใจดี', '6730401002-0', 'student', 'active', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, full_name = EXCLUDED.full_name, status = EXCLUDED.status;

-- 2. กฎการเข้าถึงเริ่มต้น (Whitelist)
INSERT INTO public.access_rules (id, type, value, decision, default_role, is_active, note)
VALUES
  ('rule-01', 'domain', 'rmuti.ac.th', 'allow', 'student', true, 'โดเมนหลักของมหาวิทยาลัยฯ อนุญาตนักศึกษาและบุคลากรทุกคน'),
  ('rule-02', 'email', 'chalermpol.b@rmuti.ac.th', 'allow', 'admin', true, 'อีเมลอาจารย์ผู้สอน ประจำรายวิชา ได้รับสิทธิ์ Admin'),
  ('rule-03', 'email', 'bugzonvazan@gmail.com', 'allow', 'admin', true, 'อีเมลผู้พัฒนาระบบหลัก (Primary Developer) ได้สิทธิ์ Admin')
ON CONFLICT (id) DO NOTHING;

-- 3. ประกาศรายวิชาเริ่มต้น
INSERT INTO public.announcements (id, title, body, category, image_url, status, published_at)
VALUES
  ('ann-001', 'ยินดีต้อนรับสู่รายวิชา นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้', 'ขอให้นักศึกษาทุกคนศึกษาแนวการสอนและทำแบบทดสอบก่อนเรียน (Pre-test) บทที่ 1 ให้เรียบร้อยก่อนเริ่มเรียนในสัปดาห์แรก', 'announcement', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', 'published', NOW() - INTERVAL '2 days'),
  ('ann-002', 'อัปเดตเอกสารประกอบการสอนบทที่ 1 เรียบร้อยแล้ว', 'นักศึกษาสามารถดาวน์โหลดไฟล์สไลด์ Infographic และแบบฝึกหัดท้ายบทได้จากเมนูบทเรียน', 'update', null, 'published', NOW() - INTERVAL '1 day'),
  ('ann-003', 'กิจกรรมส่งงานชิ้นที่ 1: แผนการประยุกต์ใช้นวัตกรรมดิจิทัล', 'กำหนดส่งผลงานภายในวันศุกร์นี้ เวลา 23:59 น. ผ่านระบบจัดการการเรียนรู้', 'activity', null, 'published', NOW())
ON CONFLICT (id) DO NOTHING;
