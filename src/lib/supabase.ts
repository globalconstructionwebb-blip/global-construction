import { createClient } from '@supabase/supabase-js';

// Hårdkodar de publika nycklarna för att kringgå Next.js/Turbopack cache-bugg. 
// Dessa är säkra att exponera på klientsidan (public anon key).
const supabaseUrl = "https://ubaolkuyccfyurphdmgf.supabase.co";
const supabaseAnonKey = "sb_publishable_CfltW1c2YJf0V9jC3poE9Q_FmaBjxCI";

// Denna används på klientsidan (t.ex. i dina statiska HTML-filer eller React-komponenter som inte är server-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Denna används BARA på serversidan (t.ex. i Next.js API-routes eller Server Actions) för att bypassa RLS och få admin-rättigheter
// Denna används BARA på serversidan. Vi säkerställer att den inte kraschar klientsidan om den råkar importeras.
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
  : null as any;
