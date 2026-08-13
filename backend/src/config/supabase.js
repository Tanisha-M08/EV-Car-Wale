import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Public client — used for read-only queries served to the frontend.
// Uses the publishable/anonymous key; safe to use for public reads.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY
);

// Server-only admin client — used for CMS write operations.
// Uses the service-role key which is NEVER exposed to the frontend.
// This client bypasses RLS so it must only ever be used server-side.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);