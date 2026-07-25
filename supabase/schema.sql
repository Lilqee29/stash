-- Supabase Database Schema for Stash App

-- 1. Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  platforms TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- 2. Create saves table
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
  enrichment JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Row Level Security
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
END
$$;
