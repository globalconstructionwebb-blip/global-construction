-- Supabase Schema: Global Construction CMS
-- Klistra in detta i "SQL Editor" i din Supabase Dashboard och klicka på "Run".

-- 1. Skapa tabell för Blogginlägg (Kunskapsbanken)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  image_url text,
  author text,
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Skapa tabell för Projekt
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  images text[] DEFAULT '{}'::text[],
  client text,
  category text,
  published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Skapa tabell för FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Skapa tabell för Jobb (Lediga tjänster)
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  location text NOT NULL,
  job_type text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ställ in Row Level Security (RLS) så att datan kan läsas av besökare på hemsidan
-- men bara ändras av inloggade (Service Role / Admin)

-- Aktivera RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Skapa policys för publik LÄSNING (vem som helst kan se innehållet)
CREATE POLICY "Public kan läsa posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Public kan läsa projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public kan läsa faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public kan läsa jobs" ON public.jobs FOR SELECT USING (true);

-- (Vi behöver inte skapa explicit skriv-policy för admin, eftersom vi kommer
-- använda SERVICE_ROLE-nyckeln i vår Adminportal, vilken bypassar RLS automatiskt).
