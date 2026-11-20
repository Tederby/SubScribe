# SubScribe

> **Digital Subscription & Split-Bill Tracker Progressive Web App (PWA)**  
> Dibangun dengan arsitektur Utilitarian / Industrial (Technical Apparatus) terinspirasi oleh Teenage Engineering.

---

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Tech Stack](#tech-stack)
3. [Struktur Repositori](#struktur-repositori)
4. [Panduan Instalasi & Menjalankan di Localhost](#panduan-instalasi--menjalankan-di-localhost)
   - [Prasyarat](#prasyarat)
   - [Langkah 1: Setup Database (Supabase)](#langkah-1-setup-database-supabase)
   - [Langkah 2: Menjalankan Backend API](#langkah-2-menjalankan-backend-api)
   - [Langkah 3: Menjalankan Frontend PWA](#langkah-3-menjalankan-frontend-pwa)
5. [Panduan Pengujian (Testing Guide) di Localhost](#panduan-pengujian-testing-guide-di-localhost)
   - [A. Pengujian Backend API (Terminal / cURL)](#a-pengujian-backend-api-terminal--curl)
   - [B. Pengujian Fitur Antarmuka (Browser)](#b-pengujian-fitur-antarmuka-browser)
   - [C. Pengujian Kemampuan Offline & PWA](#c-pengujian-kemampuan-offline--pwa)
6. [Dokumentasi Lengkap](#dokumentasi-lengkap)

---

## Gambaran Umum
**SubScribe** adalah aplikasi pelacak langganan digital dan tagihan patungan (*split-bill*) berbasis PWA (Progressive Web App). Aplikasi ini mempermudah pencatatan layanan langganan (seperti Netflix, Spotify, ChatGPT, Google One), simulasi perhitungan pembagian biaya per orang, pencatatan status pelunasan anggota per periode, serta pengiriman pesan tagihan otomatis via WhatsApp.

---

## Tech Stack
- **Backend:** Node.js (ES Modules), Express.js, Supabase JS SDK (`@supabase/supabase-js`), CORS, Dotenv.
- **Frontend:** React 18, Vite, Tailwind CSS, `lucide-react`, `vite-plugin-pwa` (Workbox Service Worker).
- **Database:** Supabase PostgreSQL (`schema.sql`).
- **Desain & UI:** Utilitarian / Industrial Hardware Apparatus, Mobile-First PWA (dioptimasi untuk Android APK/TWA dan desktop).

---

## Struktur Repositori
```text
SubScribe/
├── backend/                  # REST API Express.js
│   ├── src/
│   │   ├── config/           # Konfigurasi Supabase Client
│   │   ├── controllers/      # Logika controller (MVC)
│   │   ├── models/           # Query model Supabase
│   │   ├── routes/           # Endpoint express
│   │   └── index.js          # Entry point server
│   ├── .env.example          # Contoh variabel lingkungan backend
│   └── package.json
├── frontend/                 # Progressive Web App React + Vite
│   ├── src/
│   │   ├── components/       # Komponen UI (BottomNav, dll.)
│   │   ├── pages/            # Halaman (Services, Groups, Detail, Profile)
│   │   ├── services/         # Layer komunikasi API & failover offline
│   │   ├── App.jsx
│   │   └── index.css         # Styling Industrial Utilitarian
│   ├── .env.example          # Contoh variabel lingkungan frontend
│   ├── vite.config.js        # Konfigurasi Vite & PWA Workbox
│   └── package.json
├── docs/                     # Dokumentasi arsitektur, API, & database
└── schema.sql                # Skema database & seed data Indonesia
```

---

## Panduan Instalasi & Menjalankan di Localhost

### Prasyarat
- **Node.js**: Versi `>= 18.0.0` (disarankan Node.js v20 LTS).
- **npm**: Versi `>= 9.0.0`.
- Browser modern (Chrome, Edge, Firefox, Brave) untuk pengujian PWA.

---

### Langkah 1: Setup Database (Supabase)
> **Catatan:** Jika Anda belum ingin menghubungkan Supabase sekarang, **aplikasi tetap dapat berjalan dan diuji** berkat sistem *data resilience* (`dataService.js`) yang otomatis beralih ke cache lokal dan data preset offline.

Jika ingin menghubungkan ke database Supabase sungguhan:
1. Buka dashboard [Supabase](https://supabase.com) dan buat project baru.
2. Buka menu **SQL Editor** pada project Supabase Anda.
3. Salin seluruh isi file [`schema.sql`](./schema.sql) dan jalankan (*Run*) query tersebut. Ini akan membuat tabel `categories`, `services`, dan `split_groups` lengkap dengan data sampel langganan Indonesia.
4. Buka **Project Settings** > **API**, lalu catat:
   - `Project URL`
   - `anon / public key`

---

### Langkah 2: Menjalankan Backend API

1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Siapkan file environment:
   ```bash
   cp .env.example .env
   ```
4. Buka file `.env` dan sesuaikan nilainya:
   ```env
   PORT=3000
   SUPABASE_URL=https://project-kamu.supabase.co
   SUPABASE_KEY=kunci-anon-supabase-kamu
   ```
   *(Jika belum ada akun Supabase, biarkan nilai default untuk menjalankan server dalam mode fallback)*.
5. Jalankan backend server:
   ```bash
   # Mode pengembangan dengan auto-reload (Node.js watch mode)
   npm run dev
   ```
6. Backend akan aktif di: **`http://localhost:3000`**.  
   Uji apakah server berjalan melalui browser atau curl:
   ```bash
   curl http://localhost:3000/api/health
   # Respons: {"status":"ok","app":"SubScribe API", ...}
   ```

---

### Langkah 3: Menjalankan Frontend PWA

1. Buka **jendela terminal baru** (biarkan terminal backend tetap berjalan) dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. (Opsional) Buat file `.env` jika URL backend berbeda dari `http://localhost:3000`:
   ```bash
   cp .env.example .env
   ```
4. Jalankan Vite development server:
   ```bash
   npm run dev
   ```
5. Frontend akan aktif di: **`http://localhost:5173`**.

---

## Panduan Pengujian (Testing Guide) di Localhost

### A. Pengujian Backend API (Terminal / cURL)
Anda dapat memverifikasi endpoint REST API menggunakan terminal atau tools seperti Postman / Bruno / Thunder Client:

1. **Health Check:**
   ```bash
   curl -X GET http://localhost:3000/api/health
   ```
2. **Daftar Kategori Layanan:**
   ```bash
   curl -X GET http://localhost:3000/api/categories
   ```
3. **Daftar Layanan Subscription:**
   ```bash
   curl -X GET http://localhost:3000/api/services
   ```
4. **Daftar Grup Split-Bill:**
   ```bash
   curl -X GET http://localhost:3000/api/groups
   ```
5. **Menambah Grup Baru:**
   ```bash
   curl -X POST http://localhost:3000/api/groups \
     -H "Content-Type: application/json" \
     -d '{
       "group_name": "Grup Uji Coba",
       "service_name": "Spotify Family",
       "leader_name": "Budi",
       "leader_phone": "6281234567890",
       "price_per_person": 14500,
       "billing_day": 5,
       "member_list": "Budi, Andi, Caca"
     }'
   ```

---

### B. Pengujian Fitur Antarmuka (Browser)
Buka **`http://localhost:5173`** di peramban web:

1. **Katalog Layanan (`/`)**:
   - Periksa kartu layanan (Netflix, Spotify, ChatGPT, Google One).
   - Klik filter kategori di bagian atas (contoh: *Semua*, *Video Streaming*, *Musik*, *Produktivitas AI*).
   - Klik tombol `+ REG_NEW` untuk menguji penambahan paket langganan baru.

2. **Kalkulator Patungan / Detail Layanan (`/services/:id`)**:
   - Klik salah satu kartu layanan dari katalog.
   - Gerakkan slider atau atur jumlah anggota (slot) untuk melihat perhitungan otomatis biaya per orang secara *real-time*.
   - Klik tombol **`BUAT GRUP PATUNGAN DARI LAYANAN INI`** untuk membuat grup split-bill dengan data yang sudah terisi otomatis.

3. **Manajemen Grup & Roster (`/groups`)**:
   - Lihat daftar grup yang sudah terdaftar beserta total iuran dan status tanggal jatuh tempo.
   - Tambah grup baru melalui form `+ BUKA GRUP BARU`.
   - Klik pada grup untuk masuk ke detail grup (`/groups/:id`).

4. **Pelacakan Status Bayar & Tagihan WhatsApp (`/groups/:id`)**:
   - **Checklist Bayar**: Klik tombol toggle bayar (`LUNAS` / `BELUM`) pada setiap nama anggota untuk mencatat status pelunasan. Perhatikan indikator progress bar pelunasan bertambah.
   - **Tambah Anggota**: Tambahkan nama anggota baru ke dalam roster grup.
   - **Tagih via WhatsApp**: Klik tombol `TAGIH VIA WHATSAPP`. Ini akan membuka tautan WhatsApp dengan pesan format penagihan rapi yang sudah terisi nama grup, nominal, dan nomor rekening/rekening tujuan.

5. **Sistem Telemetry & Profil (`/profile`)**:
   - Periksa indikator status koneksi (menampilkan `LIVE` jika backend aktif atau `CACHE` jika offline).
   - **Export Snapshot**: Klik tombol unduh JSON untuk mencadangkan data lokal.
   - **Import Snapshot**: Uji restore data dari file JSON cadangan.
   - **Factory Reset**: Klik reset untuk mengembalikan konfigurasi data ke preset awal.

---

### C. Pengujian Kemampuan Offline & PWA

1. **Uji Mode Offline**:
   - Buka DevTools di browser (`F12` atau `Ctrl+Shift+I`).
   - Masuk ke tab **Network**, ubah opsi kecepatan dari *No throttling* menjadi **Offline**.
   - Muat ulang (*refresh*) halaman atau navigasikan ke berbagai tab.
   - Halaman tetap terbuka mulus dan data tetap dapat diakses berkat Service Worker dan Local Storage resilience.
2. **Uji Instalasi PWA**:
   - Di Google Chrome / Edge, periksa icon **Install SubScribe** di address bar peramban (atau menu titik tiga > *Install SubScribe*).
   - Install aplikasi untuk merasakan pengalaman standalone window selayaknya aplikasi desktop/mobile asli.

---

## Dokumentasi Lengkap
Untuk spesifikasi arsitektur teknis lebih mendalam, silakan baca dokumen di folder [`docs/`](./docs/):
- [Arsitektur Sistem](./docs/architecture.md)
- [Spesifikasi API Endpoint](./docs/api.md)
- [Desain Database](./docs/database.md)

---

## Lisensi
Dilisensikan untuk keperluan akademik dan pengembangan perangkat lunak bebas.
