const SUPABASE_URL = "https://nvrrvn18.github.io/inform1-sk-game/";
const SUPABASE_ANON_KEY = "denhcuszatxqhloiqsye";

window.supabaseClient = null;
window.supabaseConfigReady = false;

if (!SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('MASUKKAN')) {
  console.warn('Supabase belum dikonfigurasi. Isi js/config/supabase-config.js.');
} else if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('MASUKKAN')) {
  console.warn('Supabase anon/publishable key belum diisi.');
} else {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseConfigReady = true;
}
