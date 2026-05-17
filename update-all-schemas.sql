-- Uppdatera Projekt-tabellen fA r att stA dja Block Editor
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS author text,
ADD COLUMN IF NOT EXISTS author_image text,
ADD COLUMN IF NOT EXISTS publish_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS blocks jsonb;

-- Uppdatera Jobb-tabellen fA r att stA dja Block Editor och rikare metadata
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS excerpt text;

-- SA kerstA ll att Storage Bucket finns fA r bilderna (om inte skapad tidigare)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
