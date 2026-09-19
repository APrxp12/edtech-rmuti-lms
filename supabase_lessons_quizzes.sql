-- ==============================================================================
-- RMUTI LMS - Lessons & Quizzes Schema for Supabase
-- Course: 30-401-001-204 นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการจัดการเรียนรู้
-- ==============================================================================

-- 1. สร้างตาราง LESSONS (บทเรียน, โครงสร้างคลิปวิดีโอ, เอกสาร PDF, Infographic)
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

-- 2. สร้างตาราง QUIZZES (แบบทดสอบก่อนเรียนและหลังเรียน, ข้อสอบ, ชอยส์, เฉลย)
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
-- ==============================================================================

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

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
-- REALTIME PUBLICATION
-- ==============================================================================

DO $$
BEGIN
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
