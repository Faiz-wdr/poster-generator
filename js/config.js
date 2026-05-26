/**
 * Supabase Client Environment Credentials Config
 * Exposes credentials safely to Vanilla JS on the client side.
 * 
 * Vercel Deployment Builder Strategy:
 * When deploying, set Vercel's Build Command to:
 *   echo "window.ENV = { SUPABASE_URL: '$SUPABASE_URL', SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY' };" > js/config.js
 */
window.ENV = {
  SUPABASE_URL: "https://ujmqljrgzmugqzrmhapt.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_QJXt8AmwNViPZaKvwsgCSg_7WO4QluV"
};
