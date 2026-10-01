# Sistem Komputer Kelas VII - GitHub Pages + Supabase

Versi ini adalah aplikasi pembelajaran interaktif yang langsung menggunakan Supabase Anonymous Authentication dan database.

## Sebelum menjalankan

1. Di Supabase aktifkan `Authentication > Providers > Anonymous`.
2. Jalankan SQL database yang sudah dibuat sebelumnya.
3. Buka `js/config/supabase-config.js`.
4. Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` menggunakan nilai dari `Project Settings > API`.
5. Upload seluruh folder ke GitHub.
6. Aktifkan GitHub Pages dari branch `main` dan folder root.

## Alur aplikasi

Nama + kelas → Anonymous Auth → profil siswa → peta misi → aktivitas → skor → Supabase.

## Misi

1. Kenali Tiga Unsur Sistem Komputer
2. Temukan Fungsi Perangkat
3. Ikuti Perjalanan Data
4. Kenali Sistem Operasi
5. Final Mission

## Keamanan

Frontend hanya menggunakan publishable/anon key. Jangan masukkan `service_role` key ke repository.

RLS harus tetap aktif seperti pada SQL setup.
