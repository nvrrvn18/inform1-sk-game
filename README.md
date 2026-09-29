# Sistem Komputer Kelas VII

Aplikasi pembelajaran interaktif berbasis game untuk materi **Sistem Komputer** kelas VII.

## Fitur

- 8 misi pembelajaran berurutan
- Peta perjalanan belajar
- Lock/unlock misi
- Klasifikasi hardware, software, brainware
- Input, process, output, storage
- Build the System
- Data Journey
- Final Mission
- Skor dan progress tersimpan otomatis dengan `localStorage`
- Export hasil belajar ke file `.txt`
- Mobile-first dan kompatibel dengan GitHub Pages
- Tanpa database dan tanpa backend

## Menjalankan secara lokal

Cukup buka `index.html` di browser modern.

## Upload ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload semua file dalam folder ini ke repository.
3. Buka **Settings > Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/root`.
6. Simpan.
7. GitHub akan memberikan URL Pages untuk aplikasi.

## Penyimpanan data

Progress tersimpan di browser pengguna menggunakan `localStorage`.

Artinya:

- refresh halaman tidak menghapus progress;
- menutup browser tidak menghapus progress;
- progress hanya tersedia pada browser dan perangkat yang sama;
- menghapus data browser dapat menghapus progress;
- tidak ada sinkronisasi antarperangkat.

## Struktur

```text
/
├── index.html
├── style.css
├── script.js
├── assets/
└── README.md
```

## Catatan

Aplikasi ini sepenuhnya statis dan tidak membutuhkan Node.js, PHP, database, Firebase, Supabase, atau server backend.
