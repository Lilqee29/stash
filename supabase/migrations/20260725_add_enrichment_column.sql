-- Migration: Add enrichment JSONB column to saves table
-- Run this in Supabase Dashboard → SQL Editor → Run

-- Add enrichment column for Gemini-generated type-specific data
ALTER TABLE saves ADD COLUMN IF NOT EXISTS enrichment JSONB DEFAULT NULL;

-- Index for filtering by enrichment type
CREATE INDEX IF NOT EXISTS idx_saves_enrichment_type 
  ON saves USING btree ((enrichment->>'type')) 
  WHERE enrichment IS NOT NULL;

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'saves' AND column_name = 'enrichment';
