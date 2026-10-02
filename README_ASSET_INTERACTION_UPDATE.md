# Update Asset & Interaksi Sistem Komputer

Package ini mengganti aktivitas lama agar menggunakan asset gambar dari repository dan interaksi manipulatif.

## File yang diganti
- `js/app.js`
- `js/game/missions.js`
- `js/game/interactions.js`
- `css/style.css`

## Asset yang digunakan
Kode menggunakan folder utama:
`assets/image/`

Jika folder di repository bernama `assets/images/`, kode sudah memiliki fallback otomatis untuk gambar individual.

## Interaksi
- Desktop: drag-and-drop ke zona.
- Mobile: tap gambar → dialog konfirmasi → pilih tujuan.
- Klik gambar membuka dialog dengan gambar besar dan pertanyaan kontekstual.
- Sequence Mission 3 mendukung drag dan tap.
- Misi 3 menampilkan animasi data menggunakan asset keyboard → CPU → monitor → SSD.
- Final Mission menggunakan gambar sebagai pilihan jawaban.

## Aktivitas
1. Misi 1: mengelompokkan hardware, software, brainware.
2. Misi 2: mengelompokkan perangkat berdasarkan input, process, output, storage + mini challenge kebutuhan perangkat.
3. Misi 3: menyusun perjalanan data + animasi + what-if.
4. Misi 4: memasangkan OS dengan jenis perangkat + mengidentifikasi software aplikasi + simulasi peran OS.
5. Final Mission: identifikasi objek dari situasi.

## Supabase
Tidak ada perubahan schema. File `js/database/progress.js` tetap dapat digunakan.

Jangan mengganti `js/config/supabase-config.js` jika konfigurasi Supabase Anda sekarang sudah benar.
