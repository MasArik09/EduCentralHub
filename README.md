# EduCentralHub 🎓

[![Status](https://img.shields.io/badge/STATUS-WORK_IN_PROGRESS-orange?style=flat-square&logo=gitbook&logoColor=white)](file:///)
[![Developed With](https://img.shields.io/badge/DEVELOPED_WITH-ANTIGRAVITY_v2.0.1-purple?style=flat-square)](file:///)
[![Go](https://img.shields.io/badge/BACKEND-GO_1.21-00ADD8?style=flat-square&logo=go&logoColor=white)](file:///)
[![React](https://img.shields.io/badge/FRONTEND-REACT_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](file:///)
[![PostgreSQL](https://img.shields.io/badge/DATABASE-POSTGRESQL-316192?style=flat-square&logo=postgresql&logoColor=white)](file:///)

> [!IMPORTANT]
> **STATUS PROYEK:** Masih dalam Tahap Pengerjaan (Work In Progress 🛠️).

---

## 🤝 Kredit Kolaborasi
Proyek **EduCentralHub** ini dikembangkan secara dinamis oleh **Arthur** dengan asistensi penuh dari **Antigravity AI** (Coding Assistant premium rancangan tim Google DeepMind).

---

## 💻 Tech Stack & Syarat Versi Minimal

Untuk menjalankan dan mengembangkan proyek ini, pastikan lingkungan lokal Anda memenuhi persyaratan versi minimal berikut:

### 🛠️ Teknologi yang Digunakan (Tech Stack)

| Komponen | Teknologi | Badges |
| :--- | :--- | :--- |
| **Backend** | Go (Golang) v1.21+ | ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white) ![Gin](https://img.shields.io/badge/Gin-00ADD8?style=flat-square&logo=go&logoColor=white) |
| **Frontend** | React.js v18+ | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Database** | PostgreSQL v15+ | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) |
| **Libraries** | JWT, Axios, SweetAlert2 | ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON-web-tokens&logoColor=white) ![SweetAlert2](https://img.shields.io/badge/SweetAlert2-purple?style=flat-square) |


---

## ✨ Fitur yang Sudah Selesai (Completed Features)

Sistem telah dilengkapi dengan fitur-fitur berstandar industri berikut:

1.  **Refactoring Arsitektur Monolitik menjadi Modular:** Memecah file `Dashboard.jsx` monster >1400 baris menjadi struktur sub-folder `src/components/` dan `src/pages/` yang clean dan human-readable.
2.  **Arsitektur Dual-Backend Service:** Arsitektur modular yang kokoh dan efisien, terintegrasi langsung dengan database PostgreSQL.
3.  **Sistem Otentikasi (Authentication System):**
    *   Pendaftaran akun (*Register*) baru.
    *   Masuk sistem (*Login*) berbasis *multi-role* (Admin, Guru, Siswa).
    *   Proteksi keamanan rute backend menggunakan **JWT (JSON Web Token)**.
4.  **Dashboard Admin Modern & Pembaruan UI Eksklusif:**
    *   Mengadopsi tema *Light Minimalist Modern* yang bersih, responsif, dan premium.
    *   Sterilisasi noda background kotor lama di area header/judul halaman (seperti pada direktori siswa dan enroll massal).
    *   Penyempurnaan tombol aksi (seperti tombol *Refresh Data*) menjadi *luxury style* dengan shadow empuk dan mikro-animasi ikon yang dinamis.
5.  **Pusat Manajemen Kelas (Manage Class):**
    *   CRUD (Create, Read, Update, Delete) kelas.
    *   Sistem pembatasan kapasitas (*quota constraint*) maksimum siswa dan pengajar secara dinamis.
6.  **Detail Anggota Kelas:** Tampilan modal mendetail untuk melihat daftar pengajar dan siswa yang terdaftar di dalam setiap kelas secara terpisah.
7.  **Pendaftaran Siswa Massal (Bulk Actions Multi-Select):**
    *   Fitur pendaftaran siswa massal dengan tata letak dinamis dua kolom (*Dual-Panel Layout*).
    *   Dilengkapi dengan fitur UX Premium **Shift-Click Range Selection** untuk mempermudah pemilihan rentang checkbox secara instan.
8.  **Aksi Massal Anggota Kelas (WhatsApp-Style Bulk Action):**
    *   *Multi-select checkbox* untuk memilih beberapa siswa sekaligus di dalam kelas.
    *   Memindahkan siswa terpilih ke kelas lain secara massal (*Bulk Move*).
    *   Mengeluarkan siswa terpilih secara massal (*Bulk Remove*).
    *   Seluruh eksekusi diamankan dengan konfirmasi SweetAlert2 bertema light mode yang modern.
9.  **Menu Direktori Data Siswa dengan Nomor Urut Dinamis:** Halaman direktori data siswa terpadu bertema Light Minimalist Modern dengan penomoran indeks otomatis (`No.`) yang rapi, menampilkan NIS/NIP, Nama Lengkap, Kelas, WhatsApp link, dan Email.
10. **Perancangan Blueprint Kluster Baru:** Struktur folder dan routing modular disiapkan lengkap untuk 4 kelompok besar menu Admin:
    *   **MANAJEMEN PENGGUNA:** Kelola User, Impor Massal, Akun Orang Tua.
    *   **MANAJEMEN SEKOLAH:** Kelola Kelas & Rombel, Kurikulum & Mapel, Kalender Akademik.
    *   **LAPORAN & ANALITIK:** Dasbor Sekolah, Laporan Akademik.
    *   **KONFIGURASI SISTEM:** Pengaturan Platform, Log Aktivitas.
11. **Kalender Akademik Split-View Premium & Dropdown Selector:**
    *   Implementasi Dropdown Selector Interaktif untuk Bulan & Tahun secara real-time pada header kalender.
    *   Penyempurnaan Kosmetik UI: Transformasi list agenda menjadi desain kotak tegas (sharpened corners) berstandar korporat.
12. **Sinkronisasi Full-Stack & Arsitektur Backend (Go):**
    *   Sinkronisasi Full-Stack: Integrasi endpoint API `GET /api/admin/calendar-events` menggunakan query GORM cerdas dengan ekstraksi tanggal PostgreSQL (EXTRACT MONTH/YEAR) untuk menyaring data berdasarkan filter frontend.
    *   Penyelarasan endpoint data siswa dengan dukungan preloading objek kelas dan pengurutan (sorting) data yang stabil (`name ASC`).
    *   Implementasi Fitur UX Premium **Session Grace Period Re-Login (1 Menit)** dengan pemulihan sesi instan dan notifikasi SweetAlert2 toast di sudut kanan bawah.

---

### 🔑 Akun Uji Coba (Demo Accounts)

Anda dapat menggunakan akun-akun di bawah ini untuk menguji fungsionalitas multi-role pada ekosistem EduCentralHub:

| Peran (Role) | Email | Password | Fitur Dashboard yang Akan Muncul |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@educentral.com` | `admin123` | Kelola Kelas, Tambah/Hapus Kelas, & Enroll Siswa (Bulk Actions) |
| **Guru** | `guru@educentral.com` | `guru123` | Upload Materi & Buat Kuis |
| **Siswa** | `siswa@educentral.com` | `siswa123` | Lihat Materi, Kerjakan Kuis, Unduh Rapor |

---

*EduCentralHub - Smart Management for Modern Education.*
