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

        -- 4. Skapa säkra policies för läsning och skrivning
        -- Anonyma besökare (och alla andra) får läsa
        EXECUTE format('CREATE POLICY "Public kan läsa" ON public.%I FOR SELECT USING (true)', t);
        -- Endast inloggade administratörer får skapa, ändra och ta bort
        EXECUTE format('CREATE POLICY "Endast authenticated kan ändra" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
        
        -- 5. Ge rättigheter till relevanta roller
        -- Viktigt: anon får endast SELECT, inte ALL
        EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon', t);
        EXECUTE format('GRANT ALL ON TABLE public.%I TO authenticated, postgres, service_role', t);
    END LOOP;
END $$;

-- Säkerställ att ID-sekvenser är åtkomliga (viktigt för nya rader)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
