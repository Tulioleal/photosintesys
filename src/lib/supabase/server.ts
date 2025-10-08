import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Use a service role key on the server for
// trusted writes. If `SUPABASE_SERVICE_ROLE_KEY` isn't set we fall back to
// the anon key (useful for local dev but not recommended for production).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY. Did you set .env.local?"
  );
}

export const supabaseServer = createClient(supabaseUrl ?? "", supabaseServiceRole ?? "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
