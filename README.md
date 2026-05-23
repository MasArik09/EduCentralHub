# EduCentralHub 🎓

> [!IMPORTANT]
> **STATUS PROYEK:** Masih dalam Tahap Pengerjaan (Work In Progress 🛠️).

---

## 🤝 Kredit Kolaborasi
Proyek **EduCentralHub** ini dikembangkan secara dinamis oleh **Arthur** dengan asistensi penuh dari **Antigravity AI** (Coding Assistant premium rancangan tim Google DeepMind).

---

## 💻 Tech Stack & Syarat Versi Minimal

Untuk menjalankan dan mengembangkan proyek ini, pastikan lingkungan lokal Anda memenuhi persyaratan versi minimal berikut:

*   **Backend:**
    *   **Go (Golang) v1.21+**
    *   Framework: **Gin Gonic** (routing HTTP super cepat) & **GORM** (ORM elegan untuk integrasi database)
*   **Frontend:**
    *   **React.js v18+** (di-build dengan bundler secepat kilat **Vite**)
    *   Styling: **Tailwind CSS v3+**
*   **Database:**
    *   **PostgreSQL v15+**
*   **Library Tambahan (Premium Libraries):**
    *   `react-select` (untuk *Searchable* NIS autocomplete dropdown)
    *   `SweetAlert2` (untuk UI notifikasi & modal konfirmasi premium)
    *   `Axios` (untuk manajemen request HTTP client-side)
    *   `Bcrypt` & `JWT` (untuk enkripsi password & proteksi otentikasi berbasis token)

---

## ✨ Fitur yang Sudah Selesai (Completed Features)

Sistem telah dilengkapi dengan fitur-fitur berstandar industri berikut:

1.  **Arsitektur Dual-Backend Service:** Arsitektur modular yang kokoh dan efisien, terintegrasi langsung dengan database PostgreSQL.
2.  **Sistem Otentikasi (Authentication System):**
    *   Pendaftaran akun (*Register*) baru.
    *   Masuk sistem (*Login*) berbasis *multi-role* (Admin, Guru, Siswa).
    *   Proteksi keamanan rute backend menggunakan **JWT (JSON Web Token)**.
3.  **Dashboard Admin Modern:** Antarmuka premium bertema **Light Minimalist Modern** yang bersih, responsif, dan kaya estetika modern (dilengkapi transisi halus & tata letak dinamis).
4.  **Pusat Manajemen Kelas (Manage Class):**
    *   CRUD (Create, Read, Update, Delete) kelas.
    *   Sistem pembatasan kapasitas (*quota constraint*) maksimum siswa dan pengajar secara dinamis.
5.  **Detail Anggota Kelas:** Tampilan modal mendetail untuk melihat daftar pengajar dan siswa yang terdaftar di dalam setiap kelas secara terpisah.
6.  **Pendaftaran Siswa Instan (Enroll Student):** Fitur pendaftaran mahasiswa ke kelas menggunakan **Searchable Select Dropdown** dengan teknologi autocomplete cerdas berdasarkan Nama, NIS, atau Email siswa ala Google Search.
7.  **Aksi Massal Anggota Kelas (WhatsApp-Style Bulk Action):**
    *   *Multi-select checkbox* untuk memilih beberapa siswa sekaligus di dalam kelas.
    *   Memindahkan siswa terpilih ke kelas lain secara massal (*Bulk Move*).
    *   Mengeluarkan siswa terpilih secara massal (*Bulk Remove*).
    *   Seluruh eksekusi diamankan dengan konfirmasi SweetAlert2 bertema light mode yang modern.

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
