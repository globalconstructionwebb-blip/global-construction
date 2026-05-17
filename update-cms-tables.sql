-- Uppdatera Blogg-tabellen (posts)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS author text,
ADD COLUMN IF NOT EXISTS author_image text,
ADD COLUMN IF NOT EXISTS publish_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS blocks jsonb;

-- Uppdatera Jobb-tabellen (jobs)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS job_type text,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS blocks jsonb,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;

-- Uppdatera FAQ-tabellen (faqs)
ALTER TABLE public.faqs 
ADD COLUMN IF NOT EXISTS blocks jsonb,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;
