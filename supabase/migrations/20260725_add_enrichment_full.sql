-- ═══════════════════════════════════════════════════════════════
-- STASH: Add enrichment column + verify all tables exist
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- 1. Check if folders table exists, create if not
CREATE TABLE IF NOT EXISTS public.folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  platforms TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- 2. Check if saves table exists, create if not
CREATE TABLE IF NOT EXISTS public.saves (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  platform TEXT NOT NULL,
  content_type TEXT DEFAULT 'default',
  genre TEXT,
  rating NUMERIC,
  duration TEXT,
  description TEXT,
  release_date TEXT,
  director TEXT,
  saves_count INTEGER,
  diamonds INTEGER,
  creator TEXT,
  thumbnail_url TEXT,
  folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
  extracted_text JSONB,
  found_entities JSONB,
  cast_list JSONB,
  available_on JSONB,
  mentioned_in JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Add enrichment column (safe — won't error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'saves' AND column_name = 'enrichment'
  ) THEN
    ALTER TABLE saves ADD COLUMN enrichment JSONB DEFAULT NULL;
    RAISE NOTICE 'Added enrichment column to saves table';
  ELSE
    RAISE NOTICE 'enrichment column already exists — skipping';
  END IF;
END $$;

-- 4. Create index on enrichment type (safe — won't error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_saves_enrichment_type'
  ) THEN
    CREATE INDEX idx_saves_enrichment_type 
      ON saves USING btree ((enrichment->>'type')) 
      WHERE enrichment IS NOT NULL;
    RAISE NOTICE 'Created enrichment type index';
  ELSE
    RAISE NOTICE 'enrichment type index already exists — skipping';
  END IF;
END $$;

-- 5. Enable RLS on both tables (safe — idempotent)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (safe — won't error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Users can manage their own folders'
  ) THEN
    CREATE POLICY "Users can manage their own folders" ON public.folders
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saves' AND policyname = 'Users can manage their own saves'
  ) THEN
    CREATE POLICY "Users can manage their own saves" ON public.saves
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Verify everything
SELECT 
  'saves table' as item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saves' AND column_name = 'enrichment') 
    THEN '✅ enrichment column exists' 
    ELSE '❌ enrichment column missing' 
  END as status
UNION ALL
SELECT 
  'enrichment index',
  CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_saves_enrichment_type')
    THEN '✅ index exists'
    ELSE '❌ index missing'
  END
UNION ALL
SELECT 
  'RLS saves',
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saves')
    THEN '✅ policies active'
    ELSE '❌ no policies'
  END
UNION ALL
SELECT 
  'RLS folders',
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folders')
    THEN '✅ policies active'
    ELSE '❌ no policies'
  END;
