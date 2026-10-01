# Dashboard Guru dengan Kode Guru

## 1. Jalankan SQL

Di Supabase → SQL Editor → New Query, jalankan:

`database/teacher_dashboard_code.sql`

Kode contoh:

`GURU-SK7-2026`

Sebaiknya setelah berhasil, ganti dengan kode Anda sendiri:

```sql
update public.teacher_access
set kode = 'KODE-GURU-BARU'
where kode = 'GURU-SK7-2026';
```

## 2. Upload file

Tambahkan/ganti:
- `teacher.html`
- `css/dashboard.css`
- `js/teacher/dashboard.js`

Jangan mengganti `js/config/supabase-config.js` yang sudah berhasil pada aplikasi siswa.

## 3. Buka

`https://USERNAME.github.io/NAMA-REPOSITORY/teacher.html`

Masukkan kode guru.

## Catatan keamanan

Kode guru adalah shared access code, bukan autentikasi individual. Siapa pun yang mengetahui kode dapat membuka dashboard. Untuk penggunaan sekolah yang lebih ketat, gunakan login akun guru/email atau autentikasi lain.

Kode tidak ditulis di JavaScript. Validasi dilakukan oleh fungsi Supabase `get_teacher_dashboard`.
