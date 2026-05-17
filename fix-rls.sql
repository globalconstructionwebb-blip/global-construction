-- 1. Avaktivera Row Level Security (RLS) för dina tabeller
-- Detta låter ditt admin-gränssnitt skriva, redigera och ta bort inlägg utan att du behöver konfigurera avancerad Supabase Auth.
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- 2. Tillåt uppladdning och läsning av bilder i din "images" bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR ALL
USING (bucket_id = 'images');
