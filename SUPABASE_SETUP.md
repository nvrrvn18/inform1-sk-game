# Panduan Menghubungkan dengan Supabase

## 1. Anonymous Auth

Supabase Dashboard → Authentication → Providers → Anonymous → Enable.

## 2. Database

Gunakan SQL schema yang sudah dibuat sebelumnya. Tabel yang diperlukan:

- students
- missions
- mission_progress
- activity_results
- final_results

## 3. API

Supabase Dashboard → Project Settings → API.

Salin:
- Project URL
- Publishable/anon key

Ke `js/config/supabase-config.js`.

Contoh:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "xxxxx";
```

Jangan gunakan service_role key di frontend.

## 4. GitHub Pages

Repository → Settings → Pages → Deploy from branch → main → root.

## 5. Uji

Buka website, masukkan nama dan kelas, lalu klik Mulai. Cek Authentication → Users dan tabel `students`. Setelah misi selesai, cek `mission_progress`.
