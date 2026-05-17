-- Lägg till fält för författarbild, specifikt publiceringsdatum, kategori, lästid och ingress (excerpt)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS author_image text,
ADD COLUMN IF NOT EXISTS publish_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS excerpt text;
