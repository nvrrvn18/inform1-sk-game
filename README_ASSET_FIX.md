# Asset Loading + Desktop Overflow Fix

Perbaikan ini ditujukan untuk versi aplikasi Sistem Komputer Kelas VII yang menggunakan asset PNG.

## File yang diganti

- `css/style.css`
- `js/app.js`

`missions.js` dan `interactions.js` disertakan sebagai referensi, tetapi tidak wajib diganti jika versi repository Anda sudah sama.

## Perbaikan

1. Gambar tidak lagi semuanya dimuat sekaligus saat halaman misi dirender.
2. Asset dimuat saat mendekati viewport menggunakan IntersectionObserver.
3. `decoding="async"` digunakan agar decoding gambar tidak terlalu menghambat rendering.
4. Tidak ada lagi fallback URL kedua untuk setiap gambar yang dapat menyebabkan request tambahan.
5. Grid desktop menggunakan `minmax(0, 1fr)` agar ukuran intrinsic PNG tidak membuat kartu melebar.
6. Gambar dibatasi dengan `max-width` dan `max-height` sehingga tetap berada di dalam card.
7. Asset card memakai `overflow:hidden` dan `min-width:0` untuk mencegah gambar keluar dari card.
8. Perilaku mobile tetap dipertahankan.

## Struktur asset

Kode menggunakan:

`assets/image/NAMA_FILE.png`

Pastikan folder dan kapitalisasi nama file sama persis dengan repository.

## Rekomendasi performa tambahan

Jika file PNG berasal dari sprite sheet 4096x4096 dan setiap crop masih berukuran sangat besar, sebaiknya kompres asset menjadi WebP sekitar 800-1200 px pada sisi terpanjang untuk penggunaan kartu. PNG tetap dapat disimpan sebagai master, sedangkan WebP digunakan aplikasi.
