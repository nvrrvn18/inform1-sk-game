export const MISSIONS = [
  { id:"misi1", number:1, title:"Kenali Tiga Unsur Sistem Komputer", short:"Bedakan hardware, software, dan brainware", concept:"HARDWARE • SOFTWARE • BRAINWARE" },
  { id:"misi2", number:2, title:"Temukan Fungsi Perangkat", short:"Kelompokkan input, process, output, dan storage", concept:"INPUT → PROCESS → OUTPUT → STORAGE" },
  { id:"misi3", number:3, title:"Ikuti Perjalanan Data", short:"Bangun dan amati alur data", concept:"INPUT → PROCESS → OUTPUT → STORAGE" },
  { id:"misi4", number:4, title:"Kenali Sistem Operasi", short:"Hubungkan OS, perangkat, dan aplikasi", concept:"PENGGUNA → OS → APLIKASI → HARDWARE" },
  { id:"final", number:5, title:"Final Mission", short:"Gabungkan semua konsep sistem komputer", concept:"SISTEM KOMPUTER" }
];

const A = "assets/image/";

export const DEVICES = [
  {id:"ram",name:"RAM",image:A+"RAM.png",type:"hardware",function:"storage",desc:"Memori sementara yang membantu komputer menyimpan data yang sedang digunakan."},
  {id:"rom",name:"ROM",image:A+"ROM.png",type:"hardware",function:"storage",desc:"Memori yang menyimpan informasi penting yang tidak berubah seperti memori kerja biasa."},
  {id:"barcode",name:"Barcode Scanner",image:A+"barcode-scanner.png",type:"hardware",function:"input",desc:"Memasukkan data dari kode batang ke sistem komputer."},
  {id:"cpu",name:"CPU / Processor",image:A+"cpu.png",type:"hardware",function:"process",desc:"Mengolah instruksi dan data dalam komputer."},
  {id:"graphic-card",name:"Graphic Card",image:A+"graphic-card.png",type:"hardware",function:"process",desc:"Membantu mengolah dan menghasilkan tampilan grafis."},
  {id:"gaming-keyboard",name:"Gaming Keyboard",image:A+"gaming-keyboard.png",type:"hardware",function:"input",desc:"Memasukkan perintah melalui tombol keyboard."},
  {id:"keyboard",name:"Keyboard",image:A+"keyboard.png",type:"hardware",function:"input",desc:"Memasukkan huruf, angka, dan perintah ke komputer."},
  {id:"lan-card",name:"LAN Card",image:A+"lan-card.png",type:"hardware",function:"input",desc:"Membantu komputer terhubung ke jaringan."},
  {id:"joystick",name:"Joystick",image:A+"joystick.png",type:"hardware",function:"input",desc:"Memasukkan perintah gerak pada permainan atau simulasi."},
  {id:"mic",name:"Mikrofon",image:A+"mic.png",type:"hardware",function:"input",desc:"Memasukkan suara ke sistem komputer."},
  {id:"monitor",name:"Monitor",image:A+"monitor.png",type:"hardware",function:"output",desc:"Menampilkan informasi visual dari komputer."},
  {id:"printer",name:"Printer",image:A+"printer.png",type:"hardware",function:"output",desc:"Menghasilkan keluaran dalam bentuk cetakan."},
  {id:"printer2",name:"Printer 2",image:A+"printer-2.png",type:"hardware",function:"output",desc:"Contoh lain perangkat output berupa printer."},
  {id:"speaker",name:"Speaker",image:A+"speaker.png",type:"hardware",function:"output",desc:"Menghasilkan keluaran suara."},
  {id:"ssd",name:"SSD",image:A+"ssd.png",type:"hardware",function:"storage",desc:"Menyimpan data secara permanen."},
  {id:"flashdisk",name:"Flashdisk",image:A+"flashdisk.png",type:"hardware",function:"storage",desc:"Media penyimpanan portabel untuk memindahkan data."},
  {id:"usb-port",name:"USB Port",image:A+"usb-port.png",type:"hardware",function:"input",desc:"Antarmuka untuk menghubungkan berbagai perangkat USB."},
  {id:"motherboard",name:"Motherboard",image:A+"motherboard.png",type:"hardware",function:"process",desc:"Papan utama tempat berbagai komponen komputer saling terhubung."},
  {id:"laptop",name:"Laptop",image:A+"laptop.png",type:"hardware",function:"computer",desc:"Komputer portabel dengan perangkat input, process, output, dan storage."},
  {id:"pc-desktop",name:"PC Desktop",image:A+"pc-desktop.png",type:"hardware",function:"computer",desc:"Komputer desktop yang tersusun dari beberapa perangkat."},
  {id:"smartphone",name:"Smartphone",image:A+"smartphone.png",type:"hardware",function:"computer",desc:"Perangkat komputasi portabel yang menjalankan sistem operasi dan aplikasi."},
  {id:"tablet",name:"Tablet",image:A+"tablet.png",type:"hardware",function:"computer",desc:"Perangkat komputasi portabel dengan layar sentuh."}
];

export const PEOPLE = [
  {id:"brainware",name:"Brainware",image:A+"brainware.png",type:"brainware",desc:"Manusia yang menggunakan, mengatur, atau mengelola sistem komputer."},
  {id:"user1",name:"Pengguna 1",image:A+"user1.png",type:"brainware",desc:"Contoh manusia yang berinteraksi dengan komputer."},
  {id:"user2",name:"Pengguna 2",image:A+"user2.png",type:"brainware",desc:"Contoh manusia yang menggunakan sistem komputer."}
];

export const SOFTWARE = [
  {id:"windows",name:"Windows",image:A+"windows-os.png",type:"software",subtype:"os",desc:"Sistem operasi untuk komputer yang mengelola perangkat dan aplikasi."},
  {id:"linux",name:"Linux",image:A+"linux-os.png",type:"software",subtype:"os",desc:"Sistem operasi yang digunakan pada berbagai perangkat komputer."},
  {id:"android",name:"Android",image:A+"android-os.png",type:"software",subtype:"os",desc:"Sistem operasi yang banyak digunakan pada perangkat mobile."},
  {id:"ios",name:"iOS",image:A+"ios-os.png",type:"software",subtype:"os",desc:"Sistem operasi untuk perangkat mobile Apple."},
  {id:"chrome",name:"Chrome",image:A+"chrome.png",type:"software",subtype:"application",desc:"Contoh aplikasi web browser."},
  {id:"browser",name:"Web Browser",image:A+"web-browser.png",type:"software",subtype:"application",desc:"Aplikasi untuk mengakses dan menjelajahi web."},
  {id:"word",name:"Word Processor",image:A+"word-processor.png",type:"software",subtype:"application",desc:"Aplikasi untuk membuat dan mengolah dokumen teks."},
  {id:"calculator",name:"Calculator",image:A+"calculator.png",type:"software",subtype:"application",desc:"Aplikasi untuk melakukan perhitungan."},
  {id:"media",name:"Media Player",image:A+"media-player.png",type:"software",subtype:"application",desc:"Aplikasi untuk memutar media seperti audio atau video."},
  {id:"facebook",name:"Facebook",image:A+"facebook.png",type:"software",subtype:"application",desc:"Contoh aplikasi layanan sosial digital."},
  {id:"instagram",name:"Instagram",image:A+"instagram.png",type:"software",subtype:"application",desc:"Contoh aplikasi layanan sosial digital."},
  {id:"tiktok",name:"TikTok",image:A+"tiktok.png",type:"software",subtype:"application",desc:"Contoh aplikasi layanan sosial digital."},
  {id:"youtube",name:"YouTube",image:A+"youtube.png",type:"software",subtype:"application",desc:"Contoh layanan digital untuk video."}
];

export const ALL_OBJECTS = [...DEVICES, ...PEOPLE, ...SOFTWARE];
