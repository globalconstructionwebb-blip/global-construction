-- KRAFTFULL RLS-FIX FÖR GLOBAL CONSTRUCTION
-- Detta skript rensar alla gamla regler och öppnar upp för både inloggade och anonyma anrop.

DO $$ 
DECLARE 
    t text;
    pol text;
BEGIN 
    -- Lista på alla berörda tabeller
    FOR t IN SELECT unnest(ARRAY['posts', 'projects', 'jobs', 'faqs']) LOOP
        -- 1. Inaktivera RLS tillfälligt för att rensa
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
        
        -- 2. Ta bort ALLA existerande policies på tabellen
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', pol, t);
        END LOOP;

        -- 3. Aktivera RLS igen
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        -- 4. Skapa en helt öppen policy för alla (SELECT, INSERT, UPDATE, DELETE)
        -- Vi sätter denna till 'anon' och 'authenticated' för att vara 100% säkra
        EXECUTE format('CREATE POLICY "Full access for everyone" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
        
        -- 5. Ge rättigheter till relevanta roller
        EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, postgres, service_role', t);
    END LOOP;
END $$;

-- Säkerställ att ID-sekvenser är åtkomliga (viktigt för nya rader)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
