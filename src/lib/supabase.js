import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validate that the anon key looks like a real Supabase JWT (base64 segments).
 * Invalid/placeholder keys will cause every API call to hang until network timeout,
 * so we skip client creation entirely if the key is obviously wrong.
 */
function isValidSupabaseKey(key) {
  if (!key || key.length < 30) return false;
  // Real Supabase anon keys are JWTs: three base64 segments separated by dots
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  // First segment should decode to a JSON header with "alg"
  try {
    const header = JSON.parse(atob(parts[0]));
    return !!header.alg;
  } catch {
    return false;
  }
}

const hasValidConfig = !!(supabaseUrl && supabaseAnonKey && isValidSupabaseKey(supabaseAnonKey));

export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    "Supabase credentials are missing or invalid (anon key is not a valid JWT). " +
    "Running in local-only mode with browser storage."
  );
}
