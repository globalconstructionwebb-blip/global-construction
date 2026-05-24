-- Skapa tabell för nyhetsbrevsprenumeranter
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Skapa en funktion för att uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Koppla funktionen till tabellen subscribers
DROP TRIGGER IF EXISTS update_subscribers_modtime ON subscribers;
CREATE TRIGGER update_subscribers_modtime
    BEFORE UPDATE ON subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Aktivera RLS (Row Level Security) men tillåt service role att läsa/skriva
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policys för säkerhet
CREATE POLICY "Allow service role full access" ON subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
