import { createClient } from '@supabase/supabase-js';

// Använder miljövariabler i första hand, med fallbacks för bygget om de saknas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ubaolkuyccfyurphdmgf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CfltW1c2YJf0V9jC3poE9Q_FmaBjxCI";

// Denna används på klientsidan (t.ex. i dina statiska HTML-filer eller React-komponenter som inte är server-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
