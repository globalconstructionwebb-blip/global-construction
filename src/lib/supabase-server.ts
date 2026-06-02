import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ubaolkuyccfyurphdmgf.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey && process.env.NODE_ENV === 'production') {
  console.warn("VARNING: SUPABASE_SERVICE_ROLE_KEY saknas i produktionsmiljön!");
}

// Denna klient bypassar all RLS-säkerhet.
// Får ABSOLUT INTE importeras i client components. Endast för server-side logik (API, Server Actions).
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || "sb_publishable_dummy_key_for_build"
);
