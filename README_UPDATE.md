# Update Progress Supabase

Ganti 2 file berikut di repository GitHub:

1. `js/database/progress.js`
2. `js/app.js`

Perubahan:
- progress misi memakai `upsert` dengan konflik `user_id,mission_id`;
- `best_score` tidak turun;
- `attempts` bertambah;
- penyimpanan progress ditunggu sebelum misi berpindah;
- hasil aktivitas dan final tidak lagi diam-diam mengabaikan error;
- cache progress lokal digunakan sebagai cadangan ketika pembacaan Supabase gagal.

Tidak perlu menjalankan SQL baru.

## Setelah upload

1. Commit kedua file ke GitHub.
2. Tunggu GitHub Pages selesai deploy.
3. Hard refresh browser.
4. Login dengan nama dan kelas.
5. Selesaikan Misi 1.
6. Periksa `mission_progress` dan `activity_results` di Supabase.

Target Misi 1:
- `mission_id`: `misi1`
- `completed`: `true`
- `score`: `100`
- `best_score`: `100`

Jika data tidak masuk, buka Console dan kirim error lengkapnya.
