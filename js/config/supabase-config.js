const SUPABASE_URL = "https://denhcuszatxqhloiqsye.supabase.co/";
const SUPABASE_ANON_KEY = "sb_publishable_0CCmrBw7Aqb5-e6jiKkwSw_e_SWei_5";

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
