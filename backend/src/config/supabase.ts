import { createClient } from '@supabase/supabase-js';

// Uses the SERVICE ROLE key (not anon) because uploads/deletes here happen
// server-side on behalf of the user, bypassing Storage RLS policies deliberately.
// NEVER expose this key to the frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default supabaseAdmin;
