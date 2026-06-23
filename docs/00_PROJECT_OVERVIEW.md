# 00 · Project Overview
# Nusantara Fantasy Learning System (NFLS)

> **Dokumen Index & Konteks Utama Project**
> Baca dokumen ini setiap kali memulai sesi kerja baru — terutama sebelum briefing AI.
> Versi: 1.0 | Terakhir diperbarui: Juni 2026

---

## 1. Elevator Pitch

**NFLS (Nusantara Fantasy Learning System)** adalah platform Learning Management System (LMS) berbasis web yang dibangun khusus untuk **SMA Negeri Nusantara Fantasy (SMAN-NF)**, Jakarta Pusat.

Platform ini menggantikan ekosistem digital yang terfragmentasi (WhatsApp, Google Form, email) dengan satu sistem terpadu yang menghubungkan **siswa, guru, orang tua, dan administrator** dalam satu ekosistem pembelajaran digital milik sekolah sendiri.

> *"Satu platform untuk semua kebutuhan akademik SMAN Nusantara Fantasy."*

---

## 2. Konteks & Latar Belakang

| Atribut | Detail |
|---|---|
| **Nama Sekolah** | SMA Negeri Nusantara Fantasy (SMAN-NF) |
| **Lokasi** | Jl. Gajah Mada No. 17, Gambir, Jakarta Pusat |
| **Total Siswa** | 1.260 siswa (36 rombel) |
| **Total Guru** | 87 guru |
| **Kurikulum** | Kurikulum Merdeka |
| **Program Studi** | MIPA, IPS, Bahasa & Budaya, Kelas Olimpiade, Kelas Seni |
| **Kepala Sekolah** | Drs. Arjuna Mahendra, M.Pd. |

### Mengapa NFLS Dibangun?

Saat pandemi 2020–2022, SMAN-NF terpaksa bergantung pada alat-alat yang tidak terintegrasi:
- Distribusi materi via WhatsApp Group
- Pengumpulan tugas via Google Form
- Komunikasi guru-siswa via email personal

Hasilnya: data tidak terpusat, sulit dipantau, dan tidak skalabel. NFLS lahir sebagai solusi permanen atas masalah ini.

---

## 3. Tujuan Project

| # | Tujuan |
|---|---|
| 1 | Menyediakan satu platform terpadu untuk kebutuhan akademik SMAN-NF |
| 2 | Memusatkan data akademik (nilai, kehadiran, rapor, progres belajar) |
| 3 | Menyediakan saluran komunikasi terstruktur antar warga sekolah |
| 4 | Membebaskan sekolah dari ketergantungan platform komersial pihak ketiga |
| 5 | Menjadi portofolio pengembangan LMS berbasis web yang lengkap dan terdokumentasi |

---

## 4. Pengguna Sistem (Actors)

| Role | Deskripsi | Estimasi Jumlah |
|---|---|---|
| **Siswa** | Mengakses materi, mengumpulkan tugas, mengikuti ujian, melihat nilai | ~1.260 orang |
| **Guru** | Mengelola kelas, mengunggah materi, membuat tugas & ujian, memberi nilai | ~87 orang |
| **Orang Tua** | Memantau nilai, kehadiran, dan rapor anak | ~1.260 akun |
| **Admin** | Mengelola sistem, user, konfigurasi tahun ajaran, laporan | ~5 orang (staf TU & IT) |

---

## 5. Scope MVP (Versi Pertama)

MVP NFLS mencakup **7 modul utama**:

| # | Modul | Deskripsi Singkat |
|---|---|---|
| 1 | **Manajemen Kelas & Materi** | Guru membuat kelas, mengunggah modul/PDF/video; siswa mengaksesnya |
| 2 | **Tugas & Pengumpulan** | Guru membuat tugas dengan deadline; siswa upload jawaban; guru menilai |
| 3 | **Ujian & Kuis Online** | Soal pilihan ganda, esai, benar/salah; timer otomatis; auto-grading PG |
| 4 | **Nilai & Rapor Digital** | Rekap nilai per komponen; rapor digital per semester; riwayat akademik |
| 5 | **Forum Diskusi** | Diskusi per kelas/mata pelajaran; thread & reply; moderasi guru |
| 6 | **Notifikasi & Pengumuman** | Pengumuman sekolah/kelas; notifikasi deadline tugas & nilai baru |
| 7 | **Absensi Digital** | Pencatatan kehadiran siswa per pertemuan; rekap kehadiran per semester |

### Yang Tidak Termasuk MVP (Future Release)
- Video conference / live class
- Integrasi dengan sistem keuangan sekolah
- Aplikasi mobile native (iOS/Android)
- Laporan analytics lanjutan

---

## 6. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Fullstack dalam satu repo, AI-friendly, file-based routing |
| **Language** | TypeScript | Type safety, lebih mudah di-maintain dan di-debug |
| **Database** | PostgreSQL (lokal) | Full control, no storage limit, cocok untuk self-host |
| **ORM** | Prisma | Schema-first, type-safe queries, migration yang terstruktur |
| **Authentication** | NextAuth.js v5 | Multi-role auth, session management, mudah dikustomisasi |
| **UI Components** | Shadcn/ui + Tailwind CSS | Komponen siap pakai, konsisten, sangat AI-friendly |
| **File Storage** | Local filesystem (server) | Simpel untuk development; mudah dimigrasikan ke cloud storage saat hosting |
| **Validasi** | Zod | Schema validation untuk form dan API, terintegrasi dengan TypeScript |
| **State Management** | Zustand | Ringan, simpel, cukup untuk kebutuhan LMS ini |
| **Testing** | Jest + React Testing Library | Unit dan integration testing |

### Catatan Stack
- Stack ini dirancang **AI-friendly** — Claude, Cursor, dan GitHub Copilot sangat familiar dengan kombinasi Next.js + Prisma + Shadcn/ui
- PostgreSQL lokal menghilangkan batasan storage (tidak ada Supabase free tier limit)
- Saat project siap dihosting, PostgreSQL lokal dapat dimigrasikan ke Railway, Neon, atau VPS sekolah tanpa mengubah kode

---

## 7. Arsitektur Singkat

```
┌─────────────────────────────────────────────┐
│              Next.js 14 (App Router)         │
│                                             │
│  ┌──────────────┐    ┌────────────────────┐ │
│  │  Frontend    │    │   API Routes       │ │
│  │  (React +    │◄──►│   (/api/...)       │ │
│  │  Shadcn/ui)  │    │                    │ │
│  └──────────────┘    └────────────────────┘ │
│                              │               │
│                    ┌─────────▼──────────┐    │
│                    │      Prisma ORM    │    │
│                    └─────────┬──────────┘    │
└──────────────────────────────┼──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   PostgreSQL (lokal) │
                    └─────────────────────┘
                               +
                    ┌──────────────────────┐
                    │  Local File Storage  │
                    │  (/uploads/...)      │
                    └──────────────────────┘
```

---

## 8. Status Project & Milestone

| Fase | Milestone | Status |
|---|---|---|
| **Fase 0** | Dokumentasi lengkap (semua 17 dokumen) | 🔄 In Progress |
| **Fase 1** | Setup project, auth system, manajemen user | ⏳ Pending |
| **Fase 2** | Manajemen kelas & materi | ⏳ Pending |
| **Fase 3** | Tugas & pengumpulan | ⏳ Pending |
| **Fase 4** | Ujian & kuis online | ⏳ Pending |
| **Fase 5** | Nilai & rapor digital | ⏳ Pending |
| **Fase 6** | Forum diskusi & notifikasi | ⏳ Pending |
| **Fase 7** | Testing, polish, dan dokumentasi final | ⏳ Pending |

---

## 9. Developer & Workflow

| Atribut | Detail |
|---|---|
| **Developer** | Solo developer |
| **AI Partner** | Claude (Anthropic) sebagai coding assistant |
| **Metode** | AI-assisted development — developer mengarahkan, AI membantu implementasi |
| **Version Control** | Git + GitHub (repository utama) |
| **Deployment** | Lokal (development) → GitHub repo → hosting TBD |
| **Project Management** | Dokumen `13_TASK_BREAKDOWN.md` sebagai panduan urutan kerja |

### Workflow per Sesi Coding
Setiap memulai sesi baru dengan AI, berikan konteks minimal ini:
1. `00_PROJECT_OVERVIEW.md` — konteks umum project
2. `08_ARCHITECTURE_RULES.md` — aturan arsitektur yang harus diikuti
3. `09_CODING_RULES.md` — konvensi kode
4. `10_GLOSSARY.md` — definisi istilah domain
5. Task spesifik dari `13_TASK_BREAKDOWN.md`

---

## 10. Nama & Identitas Sistem

| Atribut | Detail |
|---|---|
| **Nama Resmi Platform** | Nusantara Fantasy Learning System |
| **Nama Singkat** | NFLS |
| **Tagline** | *"Satu Platform, Satu Ekosistem, Satu SMAN-NF"* |
| **Warna Utama** | Biru Langit Nusantara `#1D6FA4` |
| **Warna Aksen** | Emas Kejayaan `#F5A623` |
| **Warna Netral** | Putih Integritas `#FFFFFF` |
| **Tipografi** | Inter (UI) + Merriweather (konten panjang) |

---

## 11. Dokumen Index

| No | Dokumen | Status | Deskripsi |
|---|---|---|---|
| 00 | `00_PROJECT_OVERVIEW.md` | ✅ Done | Dokumen ini — index & konteks utama |
| 01 | `01_PRD.md` | ⏳ Pending | Product Requirements Document |
| 02 | `02_SRS.md` | ⏳ Pending | Software Requirements Specification |
| 03 | `03_SYSTEM_DESIGN.md` | ⏳ Pending | Arsitektur sistem high-level |
| 04 | `04_DATABASE_DESIGN.md` | ⏳ Pending | Schema database & ERD |
| 05 | `05_API_SPEC.md` | ⏳ Pending | Spesifikasi endpoint API |
| 06 | `06_UX_DESIGN.md` | ⏳ Pending | User flow & wireframe reference |
| 07 | `07_ARCHITECTURE_RULES.md` | ⏳ Pending | Aturan arsitektur & pattern |
| 08 | `08_CODING_RULES.md` | ⏳ Pending | Konvensi kode & standar |
| 09 | `09_FOLDER_STRUCTURE.md` | ⏳ Pending | Struktur folder project |
| 10 | `10_GLOSSARY.md` | ⏳ Pending | Kamus istilah domain sekolah |
| 11 | `11_USER_STORIES_AND_AC.md` | ⏳ Pending | User stories & acceptance criteria |
| 12 | `12_TASK_BREAKDOWN.md` | ⏳ Pending | Breakdown task per fase |
| 13 | `13_TEST_PLAN.md` | ⏳ Pending | Rencana pengujian sistem |
| 14 | `14_SECURITY.md` | ⏳ Pending | Keamanan sistem & data |
| 15 | `15_DEPLOYMENT.md` | ⏳ Pending | Panduan deployment |
| 16 | `16_ENVIRONMENT_CONFIG.md` | ⏳ Pending | Konfigurasi environment |
| 17 | `17_CHANGELOG.md` | ⏳ Pending | Log perubahan keputusan design |

---

## 12. Referensi Dokumen Sekolah

Dokumen-dokumen berikut digunakan sebagai acuan konteks saat membangun NFLS:

- `SCHOOL_PROFILE.md` — Profil, struktur organisasi, dan data sekolah
- `SCHOOL_LORE.md` — Latar belakang, tradisi, dan filosofi SMAN-NF
- `CURRICULUM.md` — Struktur kurikulum, mata pelajaran, dan sistem penilaian

---

*Dokumen ini terakhir diperbarui: Juni 2026 | Versi: 1.0*
*Project: Nusantara Fantasy Learning System (NFLS) | SMAN Nusantara Fantasy*
