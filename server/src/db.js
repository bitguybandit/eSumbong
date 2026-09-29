import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Service-role client used exclusively on the server. It bypasses RLS and must
// never be exposed to the browser.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
