# 03 · System Design
# Nusantara Fantasy Learning System (NFLS)

> **Tujuan Dokumen:** Mendefinisikan arsitektur sistem secara high-level —
> bagaimana komponen-komponen teknis terstruktur, berkomunikasi, dan bekerja bersama.
> Detail database ada di `04_DATABASE_DESIGN.md`, detail API ada di `05_API_SPEC.md`.
> Versi: 1.0 | Terakhir diperbarui: Juni 2026

---

## 1. Gambaran Arsitektur

NFLS menggunakan arsitektur **Fullstack Monolith** berbasis Next.js 14 App Router —
satu repository, satu deployment unit, dengan pemisahan logis antara layer UI, API, dan data.

Pilihan monolith dipilih secara sadar untuk konteks ini:
- Solo developer → kompleksitas microservices tidak sebanding manfaatnya
- AI-assisted development → satu codebase lebih mudah di-brief ke AI
- Mudah dimigrasikan ke arsitektur yang lebih kompleks di masa depan jika diperlukan

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                         │
│                                                                 │
│   React Components (Shadcn/ui + Tailwind)                       │
│   Client-side state: Zustand                                    │
│   Data fetching: SWR / fetch API                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS 14 SERVER                            │
│                                                                 │
│  ┌─────────────────────┐   ┌──────────────────────────────────┐ │
│  │   App Router        │   │   API Routes (/api/...)          │ │
│  │   (Server Components│   │   - Route Handlers               │ │
│  │    + Client Comp.)  │   │   - Middleware (auth check)      │ │
│  │                     │   │   - Input validation (Zod)       │ │
│  │   /app              │   │   - Business logic               │ │
│  │   ├── (auth)/       │   │   - Response formatting          │ │
│  │   ├── (dashboard)/  │   │                                  │ │
│  │   ├── (siswa)/      │   └──────────────┬───────────────────┘ │
│  │   ├── (guru)/       │                  │                     │
│  │   ├── (ortu)/       │   ┌──────────────▼───────────────────┐ │
│  │   └── (admin)/      │   │   Prisma ORM                     │ │
│  └─────────────────────┘   │   - Type-safe queries            │ │
│                            │   - Schema migrations            │ │
│  ┌─────────────────────┐   │   - Connection pooling           │ │
│  │   NextAuth.js v5    │   └──────────────┬───────────────────┘ │
│  │   - JWT sessions    │                  │                     │
│  │   - Role middleware │                  │                     │
│  └─────────────────────┘                  │                     │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
              ┌─────────────────────────────┼──────────────────┐
              │                             │                  │
┌─────────────▼──────────┐   ┌─────────────▼──────────────┐   │
│   PostgreSQL (lokal)   │   │   Local File Storage       │   │
│                        │   │                            │   │
│   Database utama       │   │   /uploads/                │   │
│   Port: 5432           │   │   ├── avatars/             │   │
│   DB: nfls_db          │   │   ├── materials/           │   │
│                        │   │   ├── submissions/         │   │
└────────────────────────┘   │   └── announcements/       │   │
                             └────────────────────────────┘   │
                                                              │
                             ┌────────────────────────────┐   │
                             │   Log Files                │   │
                             │   /logs/                   │   │
                             │   ├── error.log            │───┘
                             │   └── audit.log            │
                             └────────────────────────────┘
```

---

## 2. Layer Arsitektur

### 2.1 Presentation Layer (Client)

**Teknologi:** React 18 + Next.js App Router + Shadcn/ui + Tailwind CSS

**Tanggung Jawab:**
- Merender UI sesuai role pengguna
- Validasi input sisi klien (Zod schema, sebelum dikirim ke API)
- Manajemen state lokal (Zustand untuk state global seperti notifikasi, user session)
- Data fetching dan caching (SWR untuk data yang sering berubah)

**Pola yang Digunakan:**
- **Server Components** untuk halaman yang bersifat statis atau membutuhkan data awal (tidak ada interaktivitas)
- **Client Components** (`'use client'`) untuk komponen yang membutuhkan interaktivitas, event listener, atau browser API
- **Route Groups** untuk mengelompokkan halaman per role tanpa memengaruhi URL

**Route Groups:**
```
/app
├── (auth)/          → Halaman publik: login, lupa password
├── (siswa)/         → Dashboard & fitur siswa
├── (guru)/          → Dashboard & fitur guru
├── (ortu)/          → Dashboard & fitur orang tua
└── (admin)/         → Dashboard & fitur admin
```

---

### 2.2 API Layer (Server)

**Teknologi:** Next.js Route Handlers (`/app/api/...`)

**Tanggung Jawab:**
- Menerima dan memvalidasi request dari client
- Memeriksa autentikasi dan otorisasi (via NextAuth session)
- Menjalankan business logic
- Memanggil Prisma untuk operasi database
- Mengembalikan response JSON terstandarisasi

**Struktur Response API (standar):**

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil"
}

// Error
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Anda tidak memiliki akses ke resource ini"
  }
}

// Pagination
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Middleware Stack (urutan eksekusi per request):**
```
Request masuk
  → 1. Next.js Middleware (auth check global, redirect jika tidak login)
  → 2. Route Handler dipanggil
  → 3. Validasi session (getServerSession)
  → 4. Validasi role (apakah role punya akses ke endpoint ini?)
  → 5. Validasi input (Zod schema parse)
  → 6. Business logic + Prisma query
  → 7. Response
```

---

### 2.3 Data Layer

**Teknologi:** Prisma ORM + PostgreSQL

**Tanggung Jawab:**
- Abstraksi query database dengan type safety penuh
- Manajemen schema via Prisma Migrations
- Relasi antar tabel didefinisikan di `schema.prisma`

**Konvensi Query:**
- Selalu gunakan `select` eksplisit — jangan `findMany()` tanpa filter field (hindari bocorkan field sensitif seperti password)
- Semua query yang melibatkan data user harus memfilter berdasarkan `userId` dari session
- Gunakan Prisma transactions untuk operasi yang harus atomic (misal: buat ujian + tambah soal sekaligus)
- Soft delete: tidak pernah gunakan `delete()` langsung, selalu `update({ data: { deletedAt: new Date() } })`

---

### 2.4 Storage Layer

**Teknologi:** Local Filesystem

**Struktur Direktori:**
```
/uploads/                          ← Root storage (di luar /public)
├── avatars/
│   └── {userId}.{ext}
├── materials/
│   └── {kelasId}/
│       └── {topikId}/
│           └── {timestamp}_{filename}
├── submissions/
│   └── {tugasId}/
│       └── {siswaId}/
│           └── {timestamp}_{filename}
└── announcements/
    └── {pengumumanId}/
        └── {timestamp}_{filename}
```

**Aturan Storage:**
- Direktori `/uploads/` **tidak** berada di dalam `/public/` — akses file harus melalui API endpoint, bukan URL langsung
- API endpoint `/api/files/[...path]` memvalidasi session dan otorisasi sebelum serve file
- Filename di-sanitasi: lowercase, spasi → underscore, karakter non-alphanumeric dihapus kecuali titik dan underscore
- File lama tidak dihapus saat file baru diupload (untuk audit trail); cleanup manual oleh admin jika diperlukan

---

## 3. Autentikasi & Otorisasi

### 3.1 Alur Autentikasi

```
Login Request (POST /api/auth/signin)
  │
  ├── Cek rate limit (maks 5x / 15 menit per IP)
  ├── Validasi format email & password
  ├── Query user by email (case-insensitive)
  ├── Cek status akun (aktif / nonaktif / terkunci)
  ├── Verifikasi password dengan bcrypt.compare()
  ├── Buat JWT session (NextAuth)
  │     Payload: { userId, email, role, nama }
  │     Expiry: 8 jam
  └── Redirect ke /dashboard/{role}
```

### 3.2 Role-Based Access Control (RBAC)

Setiap role memiliki akses yang terdefinisi ketat. Validasi dilakukan di dua tempat:
1. **Next.js Middleware** — redirect jika role tidak sesuai dengan route group
2. **API Route Handler** — validasi ulang di server sebelum eksekusi query

**Matriks Akses (ringkasan):**

| Resource | Siswa | Guru | Orang Tua | Admin |
|---|---|---|---|---|
| Kelas (baca) | ✅ kelas sendiri | ✅ kelas milik | ✅ kelas anak | ✅ semua |
| Kelas (tulis) | ❌ | ✅ kelas milik | ❌ | ✅ semua |
| Materi (baca) | ✅ kelas sendiri | ✅ kelas milik | ❌ | ✅ semua |
| Materi (tulis) | ❌ | ✅ kelas milik | ❌ | ✅ semua |
| Tugas (baca) | ✅ tugas sendiri | ✅ kelas milik | ✅ tugas anak | ✅ semua |
| Tugas (submit) | ✅ tugas sendiri | ❌ | ❌ | ❌ |
| Tugas (nilai) | ❌ | ✅ kelas milik | ❌ | ✅ semua |
| Ujian (ikut) | ✅ kelas sendiri | ❌ | ❌ | ❌ |
| Ujian (kelola) | ❌ | ✅ kelas milik | ❌ | ✅ semua |
| Nilai (baca) | ✅ nilai sendiri | ✅ kelas milik | ✅ nilai anak | ✅ semua |
| Rapor (baca) | ✅ rapor sendiri | ✅ sebagai wali | ✅ rapor anak | ✅ semua |
| Absensi (catat) | ❌ | ✅ kelas milik | ❌ | ✅ semua |
| Absensi (baca) | ✅ sendiri | ✅ kelas milik | ✅ anak | ✅ semua |
| Forum (baca/tulis) | ✅ kelas sendiri | ✅ kelas milik | ❌ | ✅ semua |
| User (kelola) | ❌ | ❌ | ❌ | ✅ semua |
| Pengumuman sekolah | Baca | Baca | Baca | CRUD |
| Pengumuman kelas | Baca | CRUD kelas milik | Baca | CRUD |

---

### 3.3 Session & Token

```typescript
// Struktur JWT Session (NextAuth)
interface Session {
  user: {
    id: string          // UUID user dari database
    email: string
    nama: string
    role: 'SISWA' | 'GURU' | 'ORANG_TUA' | 'ADMIN'
    avatarUrl?: string
  }
  expires: string       // ISO timestamp expiry (8 jam dari login)
}
```

---

## 4. Alur Data Utama

### 4.1 Upload File Materi

```
Guru pilih file di UI
  → Client validasi ukuran & ekstensi (Zod)
  → POST /api/kelas/{kelasId}/materi (multipart/form-data)
  → Server: validasi session + role GURU + kepemilikan kelas
  → Server: validasi MIME type di server (tidak hanya ekstensi)
  → Server: sanitasi filename
  → Server: simpan file ke /uploads/materials/{kelasId}/{topikId}/
  → Server: simpan record ke tabel `Materi` di database
  → Response: { success: true, data: { materiId, filename, url } }
  → Client: update UI (tampilkan materi baru tanpa reload halaman)
```

### 4.2 Alur Pengerjaan Ujian

```
Siswa buka halaman ujian
  → GET /api/ujian/{ujianId}/sesi
  → Server: cek apakah ujian dalam jendela waktu aktif
  → Server: cek apakah siswa sudah pernah submit (prevent double submission)
  → Jika belum ada sesi: buat record SesiUjian di database (catat waktu mulai)
  → Jika sudah ada sesi aktif: kembalikan sesi yang ada (resume)
  → Client: tampilkan soal + timer (waktu sisa = durasi - (now - waktu_mulai))

Siswa jawab soal
  → PATCH /api/ujian/{ujianId}/sesi/{sesiId}/jawaban (setiap 30 detik autosave)
  → Server: simpan jawaban ke tabel `JawabanUjian`

Siswa submit / timer habis
  → POST /api/ujian/{ujianId}/sesi/{sesiId}/submit
  → Server: tandai SesiUjian sebagai SELESAI
  → Server: auto-grade PG dan B/S
  → Server: hitung nilai total (soal esai pending, nilai sementara tanpa esai)
  → Response: { nilaiSementara, adaEsai: true/false }
```

### 4.3 Alur Notifikasi Asinkron

Sesuai BR-07 (SRS), notifikasi tidak memblokir response API utama:

```
Event terjadi (misal: guru publish tugas)
  → API handler selesai simpan data tugas ke DB
  → API handler return response 200 ke client (CEPAT)
  → [Background] Trigger fungsi notifikasi asinkron:
      → Query: siapa saja siswa di kelas ini?
      → Query: siapa saja orang tua dari siswa tersebut?
      → Batch insert ke tabel `Notifikasi`
      → [Opsional fase berikutnya] Kirim email notifikasi
```

**Implementasi di MVP:** Notifikasi in-app (database) saja. Email notifikasi adalah future enhancement.

**Mekanisme async di Next.js:**
Gunakan pattern `Promise.resolve().then(() => kirimNotifikasi(...))` setelah response dikirim,
atau gunakan background job sederhana via `setImmediate()` untuk memastikan notifikasi tidak memperlambat response.

---

## 5. Struktur Direktori Project

> Detail lengkap ada di `09_FOLDER_STRUCTURE.md`. Berikut gambaran high-level.

```
nfls/
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← Route group: halaman publik
│   ├── (siswa)/                  ← Route group: fitur siswa
│   ├── (guru)/                   ← Route group: fitur guru
│   ├── (ortu)/                   ← Route group: fitur orang tua
│   ├── (admin)/                  ← Route group: fitur admin
│   └── api/                      ← API Route Handlers
│       ├── auth/                 ← NextAuth endpoints
│       ├── users/
│       ├── kelas/
│       ├── materi/
│       ├── tugas/
│       ├── ujian/
│       ├── nilai/
│       ├── rapor/
│       ├── absensi/
│       ├── forum/
│       ├── notifikasi/
│       ├── pengumuman/
│       └── files/                ← Serve protected files
├── components/                   ← Shared React components
│   ├── ui/                       ← Shadcn/ui components
│   └── shared/                   ← Custom shared components
├── lib/                          ← Utility & helper functions
│   ├── auth.ts                   ← NextAuth config
│   ├── prisma.ts                 ← Prisma client singleton
│   ├── validations/              ← Zod schemas
│   └── utils/                    ← Helper functions
├── prisma/
│   ├── schema.prisma             ← Database schema
│   └── migrations/               ← Prisma migrations
├── uploads/                      ← File storage (gitignored)
├── logs/                         ← Log files (gitignored)
├── public/                       ← Static assets (logo, favicon)
└── middleware.ts                 ← Global Next.js middleware (auth guard)
```

---

## 6. Desain Modul & Dependensi

Urutan dependensi antar modul (modul di atas harus selesai sebelum modul di bawahnya):

```
Modul 0: Auth & User Management
    │
    └── Modul 1: Kelas & Materi
            │
            ├── Modul 2: Tugas & Pengumpulan
            │       └── Modul 4: Nilai & Rapor (komponen Tugas)
            │
            ├── Modul 3: Ujian & Kuis
            │       └── Modul 4: Nilai & Rapor (komponen Ujian)
            │
            ├── Modul 5: Forum Diskusi
            │
            ├── Modul 7: Absensi Digital
            │       └── Modul 4: Nilai & Rapor (data kehadiran)
            │
            └── Modul 6: Notifikasi & Pengumuman
                    (dikonsumsi oleh semua modul di atas)
```

**Implikasi untuk urutan development:**
Modul 0 → 1 → 2 & 3 & 7 (paralel bisa, tapi serial lebih aman untuk solo dev) → 4 → 5 → 6

---

## 7. Strategi Error Handling

### 7.1 Di API Layer

```typescript
// Semua route handler dibungkus try-catch
export async function GET(request: Request) {
  try {
    // ... logic
  } catch (error) {
    // Log ke file
    logger.error({ error, path: request.url, timestamp: new Date() })

    // Response ke client (jangan bocorkan detail error internal)
    if (error instanceof ZodError) {
      return Response.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input tidak valid', details: error.errors }
      }, { status: 400 })
    }

    return Response.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan. Silakan coba lagi.' }
    }, { status: 500 })
  }
}
```

### 7.2 Error Codes Standar

| Code | HTTP Status | Keterangan |
|---|---|---|
| `UNAUTHORIZED` | 401 | Belum login |
| `FORBIDDEN` | 403 | Login tapi tidak punya akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `CONFLICT` | 409 | Data sudah ada (duplikat) |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `INTERNAL_ERROR` | 500 | Error server |

### 7.3 Di Client Layer

- Setiap fetch ke API dibungkus dengan error boundary atau try-catch
- Error yang bisa di-handle (validasi, tidak ditemukan) → tampilkan pesan yang ramah pengguna
- Error yang tidak terduga → tampilkan toast "Terjadi kesalahan. Silakan coba lagi."
- Network error → tampilkan "Koneksi bermasalah. Periksa internet Anda."

---

## 8. Strategi Logging

### 8.1 Jenis Log

| Jenis | File | Isi |
|---|---|---|
| Error log | `/logs/error.log` | Semua error 500, stack trace, timestamp, path |
| Audit log | `/logs/audit.log` | Perubahan data akademik (nilai, kehadiran, rapor FINAL) |
| Access log | Tidak diimplementasi di MVP | — |

### 8.2 Format Log

```
[2024-07-15T10:30:00.000Z] [ERROR] POST /api/ujian/abc123/submit
  userId: user_xyz
  message: "Cannot read properties of undefined"
  stack: "Error: ..."

[2024-07-15T10:30:00.000Z] [AUDIT] NILAI_UPDATED
  by: user_guru_123
  target: nilai_id_456
  sebelum: 75
  sesudah: 80
  alasan: "Koreksi kesalahan input"
```

---

## 9. Keputusan Arsitektur & Alasannya

| Keputusan | Alternatif yang Dipertimbangkan | Alasan Dipilih |
|---|---|---|
| Next.js Monolith | Separate React + Express | Satu repo lebih mudah untuk solo dev & AI-assisted workflow |
| PostgreSQL lokal | Supabase, MySQL | No storage limit, full control, cocok untuk self-host sekolah |
| Prisma ORM | Drizzle, TypeORM, raw SQL | Type-safe, schema-first, migrasi terstruktur, sangat AI-friendly |
| NextAuth.js v5 | Custom JWT, Auth.js, Lucia | Terintegrasi sempurna dengan Next.js, multi-provider ready |
| Local file storage | Supabase Storage, S3 | Konsisten dengan pilihan no-cloud; mudah dimigrasikan nanti |
| Soft delete global | Hard delete | Integritas data historis (nilai, kehadiran tidak boleh hilang) |
| Notifikasi async | Sync (blocking) | Tidak memperlambat response API utama (BR-07) |
| Route groups per role | Satu route + conditional render | Lebih jelas, lebih mudah di-maintain, middleware lebih sederhana |

---

## 10. Referensi

| Dokumen | Relevansi |
|---|---|
| `00_PROJECT_OVERVIEW.md` | Tech stack & justifikasi |
| `02_SRS.md` | Business rules & NFR yang diimplementasikan di sini |
| `04_DATABASE_DESIGN.md` | Detail schema dari data layer |
| `05_API_SPEC.md` | Detail endpoint dari API layer |
| `07_ARCHITECTURE_RULES.md` | Aturan & konvensi yang wajib diikuti saat coding |
| `09_FOLDER_STRUCTURE.md` | Detail struktur direktori project |

---

*Dokumen ini terakhir diperbarui: Juni 2026 | Versi: 1.0*
*Project: Nusantara Fantasy Learning System (NFLS) | SMAN Nusantara Fantasy*
