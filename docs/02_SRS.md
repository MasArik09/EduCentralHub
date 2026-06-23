# 02 · Software Requirements Specification (SRS)
# Nusantara Fantasy Learning System (NFLS)

> **Tujuan Dokumen:** Mendefinisikan *bagaimana* sistem harus berperilaku secara teknis —
> business rules, validasi, constraint, dan behavior yang harus diimplementasikan developer.
> PRD mendefinisikan *apa*; SRS mendefinisikan *bagaimana*.
> Versi: 1.0 | Terakhir diperbarui: Juni 2026

---

## 1. Ruang Lingkup Sistem

NFLS adalah aplikasi web fullstack berbasis **Next.js 14 (App Router)** dengan backend API Routes, database **PostgreSQL** via **Prisma ORM**, autentikasi **NextAuth.js v5**, dan UI **Shadcn/ui + Tailwind CSS**.

Sistem melayani 4 role pengguna: **Siswa**, **Guru**, **Orang Tua**, dan **Admin** — masing-masing dengan hak akses yang berbeda dan terisolasi satu sama lain.

Referensi fitur lengkap: `01_PRD.md`

---

## 2. Kebutuhan Fungsional

### FR-00: Autentikasi & Manajemen Akun

---

#### FR-00-01: Login

**Deskripsi:** Pengguna masuk ke sistem menggunakan email dan password.

**Aturan:**
- Email bersifat unik per akun dan tidak case-sensitive (disimpan lowercase)
- Password minimal 8 karakter, harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka
- Sistem menggunakan session berbasis JWT (via NextAuth.js)
- Setelah login, pengguna diarahkan ke dashboard sesuai role-nya
- Maksimal 5 percobaan login gagal dalam 15 menit → akun dikunci sementara 30 menit
- Session berlaku selama 8 jam; setelah itu pengguna harus login ulang

**Flow:**
```
User input email + password
  → Validasi format email & panjang password (client-side)
  → POST /api/auth/signin
  → Verifikasi kredensial di database
  → Jika valid: buat session JWT, redirect ke /dashboard
  → Jika tidak valid: tampilkan pesan "Email atau password salah" (tanpa spesifik mana yang salah)
  → Jika akun nonaktif: tampilkan "Akun Anda tidak aktif. Hubungi administrator."
```

---

#### FR-00-02: Lupa Password

**Deskripsi:** Pengguna mereset password melalui email.

**Aturan:**
- Token reset dikirim ke email terdaftar; berlaku 1 jam dan hanya bisa digunakan sekali
- Jika email tidak terdaftar, sistem tetap tampilkan pesan sukses (tidak bocorkan info akun)
- Password baru harus memenuhi aturan yang sama dengan FR-00-01
- Setelah reset berhasil, semua session aktif akun tersebut di-invalidate

---

#### FR-00-03: Manajemen Profil

**Deskripsi:** Pengguna mengedit informasi profil pribadi.

**Aturan:**
- Field yang bisa diedit: nama lengkap, foto profil, nomor telepon, password
- Field yang tidak bisa diedit sendiri: email, role, NIS/NIP (hanya admin yang bisa ubah)
- Foto profil: format JPG/PNG, ukuran maksimal 2MB, disimpan di `/uploads/avatars/`
- Perubahan password membutuhkan konfirmasi password lama

---

#### FR-00-04: Manajemen Pengguna (Admin)

**Deskripsi:** Admin mengelola seluruh akun pengguna sistem.

**Aturan:**
- Admin bisa membuat akun dengan role: Siswa, Guru, Orang Tua, Admin
- Satu email hanya bisa terdaftar untuk satu akun
- Admin tidak bisa menghapus akun (hanya nonaktifkan) — untuk menjaga integritas data historis
- Akun yang dinonaktifkan tidak bisa login; data tetap tersimpan
- Setiap akun Siswa harus memiliki field: NIS, nama lengkap, rombel, program studi, tahun masuk
- Setiap akun Guru harus memiliki field: NIP, nama lengkap, mata pelajaran yang diampu
- Satu akun Orang Tua hanya bisa terhubung ke satu akun Siswa

---

#### FR-00-05: Import Data Massal (Admin)

**Deskripsi:** Admin mengimpor data pengguna dari file CSV.

**Format CSV Siswa:**
```
nis,nama_lengkap,email,rombel,program_studi,tahun_masuk
2024001,Budi Santoso,budi@sman-nf.sch.id,X MIPA 1,MIPA,2024
```

**Format CSV Guru:**
```
nip,nama_lengkap,email,mata_pelajaran
198501012010011001,Ibu Sari,sari@sman-nf.sch.id,Matematika
```

**Aturan:**
- Sistem memvalidasi semua baris sebelum mengimpor; jika ada error, tidak ada yang diimpor (all-or-nothing)
- Sistem menampilkan laporan: baris berhasil, baris gagal + alasannya
- Email yang sudah terdaftar → baris dilewati + dicatat sebagai warning (bukan error fatal)
- Password default: `SMAN-NF@{NIS/NIP}` — pengguna wajib ganti saat pertama login

---

### FR-01: Manajemen Kelas & Materi

---

#### FR-01-01: Pembuatan Kelas

**Deskripsi:** Guru membuat kelas virtual mata pelajaran.

**Field Wajib:**
- Nama mata pelajaran (pilih dari daftar mapel sesuai `CURRICULUM.md`)
- Tahun ajaran (format: `2024/2025`)
- Semester (Ganjil / Genap)
- Rombel (pilih dari daftar rombel yang ada)
- Kode kelas (auto-generate, format: `[KODE_MAPEL]-[TAHUN]-[ROMBEL]`, contoh: `MPA01-2024-XMIPA1`)

**Aturan:**
- Satu guru bisa memiliki banyak kelas
- Kombinasi mapel + tahun ajaran + semester + rombel harus unik (tidak boleh duplikat)
- Guru hanya bisa mengelola kelas yang dia buat (kecuali admin)
- Admin bisa membuat kelas dan assign guru ke kelas tersebut

---

#### FR-01-02: Enroll Siswa

**Deskripsi:** Mendaftarkan siswa ke kelas tertentu.

**Aturan:**
- Admin bisa enroll massal siswa satu rombel ke kelas sekaligus
- Guru bisa enroll siswa secara individual ke kelasnya
- Satu siswa bisa terdaftar di banyak kelas (sesuai mapel yang diambil)
- Siswa tidak bisa enroll sendiri — harus melalui guru atau admin
- Jika siswa di-unenroll, data tugas & nilai yang sudah ada tetap tersimpan (tidak terhapus)

---

#### FR-01-03: Manajemen Materi

**Deskripsi:** Guru mengunggah dan mengorganisasi konten pembelajaran.

**Tipe Konten yang Didukung:**

| Tipe | Format | Maks Ukuran |
|---|---|---|
| Dokumen | PDF, DOCX, PPTX, XLSX | 50 MB |
| Gambar | JPG, PNG | 10 MB |
| Tautan eksternal | URL YouTube, Google Drive, website | — |

**Aturan:**
- Materi diorganisasi dalam **Topik** (folder virtual); guru bisa membuat, mengedit, menghapus topik
- Urutan topik dan materi di dalam topik bisa diatur manual (drag & drop di UI)
- File disimpan di server lokal pada path: `/uploads/materials/{kelas_id}/{topik_id}/{filename}`
- Filename disanitasi sebelum disimpan (hapus karakter spesial, spasi → underscore)
- Materi yang diarsip tidak tampil di halaman siswa tapi tetap bisa diakses guru
- Siswa hanya bisa mengunduh materi, tidak bisa mengunggah ke halaman materi kelas

---

### FR-02: Tugas & Pengumpulan

---

#### FR-02-01: Pembuatan Tugas

**Deskripsi:** Guru membuat tugas untuk siswa di kelasnya.

**Field Tugas:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Judul | Teks | ✅ | Maks 200 karakter |
| Deskripsi / Instruksi | Rich text | ✅ | Mendukung bold, italic, bullet, gambar |
| Deadline | Datetime | ✅ | Minimal 1 jam dari sekarang |
| Tipe pengumpulan | Enum | ✅ | `FILE`, `TEXT`, `BOTH` |
| Lampiran guru | File | ❌ | Format sama dengan materi, maks 50MB |
| Izinkan terlambat | Boolean | ❌ | Default: true |
| Bobot nilai | Angka 0–100 | ❌ | Default: 100 |

**Aturan:**
- Tugas yang sudah dipublish dan ada yang mengumpulkan tidak bisa dihapus, hanya bisa diedit (kecuali deadline)
- Deadline tidak bisa diubah mundur jika sudah lewat
- Guru bisa membuat draft tugas (belum dipublish ke siswa)

---

#### FR-02-02: Pengumpulan Tugas (Siswa)

**Deskripsi:** Siswa mengumpulkan jawaban tugas.

**Aturan:**
- Siswa bisa mengumpulkan sebelum atau sesudah deadline (jika `izinkan_terlambat = true`)
- Pengumpulan setelah deadline otomatis ditandai status `TERLAMBAT`
- Siswa bisa menimpa pengumpulan sebelumnya selama belum dinilai guru
- Setelah guru menilai, siswa tidak bisa mengganti pengumpulan
- Format file upload siswa: PDF, DOCX, JPG, PNG, ZIP; maks 20MB per pengumpulan
- File disimpan di: `/uploads/submissions/{tugas_id}/{siswa_id}/{filename}`

**Status Pengumpulan:**
```
BELUM_DIKUMPUL → DIKUMPUL → DINILAI
                ↘ TERLAMBAT → DINILAI
```

---

#### FR-02-03: Penilaian Tugas (Guru)

**Deskripsi:** Guru menilai tugas yang sudah dikumpulkan siswa.

**Aturan:**
- Nilai berupa angka 0–100
- Guru wajib memberi nilai sebelum bisa submit penilaian; komentar/feedback bersifat opsional
- Setelah dinilai, notifikasi dikirim ke siswa dan orang tua
- Guru bisa mengedit nilai yang sudah diberikan; sistem mencatat riwayat perubahan nilai
- Guru bisa mengunduh semua pengumpulan dalam satu kelas sebagai ZIP

---

### FR-03: Ujian & Kuis Online

---

#### FR-03-01: Bank Soal

**Deskripsi:** Guru membuat dan menyimpan soal dalam bank soal per mata pelajaran.

**Tipe Soal:**

| Tipe | Format Jawaban | Auto-grade |
|---|---|---|
| Pilihan Ganda (PG) | 4 opsi (A/B/C/D), 1 jawaban benar | ✅ Ya |
| Benar / Salah (B/S) | 2 opsi (Benar/Salah) | ✅ Ya |
| Esai | Teks bebas | ❌ Manual |

**Aturan:**
- Soal bisa diberi tag topik untuk memudahkan filtering
- Soal yang sudah digunakan dalam ujian yang sudah selesai tidak bisa dihapus, hanya bisa diarsip
- Soal bisa digunakan kembali di ujian lain

---

#### FR-03-02: Pembuatan Ujian / Kuis

**Deskripsi:** Guru merakit ujian dari bank soal dan mengonfigurasi aturannya.

**Field Ujian:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Judul | Teks | ✅ | Maks 200 karakter |
| Tipe | Enum | ✅ | `KUIS` / `UTS` / `UAS` / `LATIHAN` |
| Daftar soal | Soal dari bank soal | ✅ | Minimal 1 soal |
| Durasi | Menit | ✅ | Minimal 5 menit |
| Waktu mulai | Datetime | ✅ | — |
| Waktu selesai | Datetime | ✅ | Harus setelah waktu mulai |
| Acak soal | Boolean | ❌ | Default: false |
| Acak pilihan | Boolean | ❌ | Default: false (hanya berlaku untuk PG) |
| Tampilkan hasil | Boolean | ❌ | Default: false — guru yang memutuskan kapan hasil dirilis |

**Aturan:**
- Siswa hanya bisa memulai ujian dalam jendela waktu mulai–selesai
- Jika siswa membuka ujian di luar jendela waktu, sistem menampilkan pesan "Ujian belum/sudah berakhir"
- Ujian yang sudah ada jawaban masuk tidak bisa dihapus, hanya bisa diarsip

---

#### FR-03-03: Sesi Ujian (Siswa)

**Deskripsi:** Siswa mengerjakan ujian dalam sesi terkontrol.

**Aturan:**
- Timer dimulai saat siswa klik "Mulai Ujian"; timer terus berjalan meski tab/browser ditutup
- Siswa hanya bisa mengerjakan satu sesi ujian dalam satu waktu
- Jawaban di-autosave setiap 30 detik ke server (bukan hanya localStorage)
- Saat waktu habis (timer = 0), jawaban otomatis di-submit
- Siswa tidak bisa kembali ke ujian yang sudah di-submit
- Jika koneksi terputus saat ujian berlangsung, jawaban yang sudah tersimpan di server aman; siswa bisa reconnect dan melanjutkan selama waktu masih ada

---

#### FR-03-04: Penilaian & Hasil

**Aturan:**
- PG dan B/S dinilai otomatis saat submit
- Nilai esai di-input manual oleh guru per siswa
- Nilai akhir ujian = rata-rata tertimbang semua soal (tiap soal punya bobot poin yang sama kecuali diatur manual)
- Guru merilis hasil ujian secara manual (toggle "Tampilkan hasil ke siswa")
- Setelah dirilis, siswa bisa melihat nilai total; review jawaban per soal hanya jika guru mengaktifkan opsi tersebut

---

### FR-04: Nilai & Rapor Digital

---

#### FR-04-01: Kalkulasi Nilai

**Deskripsi:** Sistem menghitung nilai akhir per mata pelajaran per semester.

**Formula (sesuai CURRICULUM.md):**
```
Nilai Akhir = (Tugas × 20%) + (Kuis × 15%) + (UTS × 25%) + (UAS × 30%) + (Proyek × 10%)
```

**Aturan:**
- Komponen yang belum ada nilainya tidak dimasukkan dalam kalkulasi (tidak dianggap nol)
- Jika semua komponen sudah ada, nilai akhir dihitung otomatis
- Guru bisa override nilai akhir secara manual dengan menyertakan alasan
- Nilai ditampilkan dengan 2 desimal (contoh: 87.50)
- Sistem menampilkan predikat otomatis berdasarkan tabel predikat di `01_PRD.md` Section 4.3

---

#### FR-04-02: Input Nilai Manual

**Deskripsi:** Guru menginput nilai untuk komponen yang tidak melalui sistem (nilai proyek, nilai presentasi, dll).

**Aturan:**
- Nilai berupa angka 0–100
- Guru bisa menginput nilai komponen satu per satu atau via tabel (bulk input)
- Setiap perubahan nilai manual dicatat: siapa yang ubah, kapan, nilai lama, nilai baru
- Nilai yang diinput manual bisa dikoreksi oleh guru yang sama atau admin

---

#### FR-04-03: Remediasi

**Aturan (sesuai CURRICULUM.md):**
- Siswa dengan nilai akhir < 70 secara otomatis ditandai "Perlu Remediasi" di sistem
- Guru menginput nilai remediasi setelah program remediasi selesai
- Nilai yang tersimpan di rapor setelah remediasi = `MIN(nilai_remediasi, 75)` — batas atas 75
- Sistem mencatat nilai asli sebelum remediasi untuk keperluan historis (tidak ditimpa)
- Remediasi berlaku per mata pelajaran, per semester

---

#### FR-04-04: Rapor Digital

**Deskripsi:** Sistem menghasilkan rapor digital per siswa per semester.

**Aturan:**
- Rapor hanya bisa di-generate setelah semua nilai komponen wajib (Tugas, Kuis, UTS, UAS) sudah diinput untuk semua mata pelajaran
- Wali kelas mengisi bagian narasi perkembangan siswa (teks bebas, sesuai Kurikulum Merdeka)
- Rapor memiliki status: `DRAFT` → `FINAL`; hanya rapor berstatus `FINAL` yang bisa diunduh siswa/orang tua
- Rapor yang sudah `FINAL` tidak bisa diedit kecuali oleh admin (dengan mencatat alasan)
- Format unduhan: PDF yang di-generate server (bukan print dari browser)
- Rapor PDF menyertakan: nama siswa, NIS, rombel, program studi, tabel nilai semua mapel, predikat, narasi wali kelas, tanda tangan digital kepala sekolah, dan cap sekolah

---

### FR-05: Forum Diskusi

---

#### FR-05-01: Thread & Reply

**Aturan:**
- Setiap kelas virtual otomatis memiliki forum; tidak perlu diaktifkan manual
- Thread bisa dibuat oleh guru atau siswa yang terdaftar di kelas tersebut
- Judul thread: maks 300 karakter; isi thread: rich text, mendukung upload gambar (maks 5MB)
- Reply: teks biasa, mendukung upload gambar
- Tidak ada nested reply (reply hanya satu level — flat thread)
- Guru bisa menghapus thread/reply milik siapapun di kelasnya
- Siswa hanya bisa menghapus thread/reply milik sendiri, dan hanya jika belum ada yang membalas

---

#### FR-05-02: Moderasi

**Aturan:**
- Thread yang dihapus tidak benar-benar hilang dari database — status berubah menjadi `DELETED` dan konten diganti dengan "[Konten telah dihapus oleh moderator]"
- Guru bisa lock thread (tidak bisa dibalas lagi) tanpa menghapusnya
- Thread yang di-pin oleh guru selalu muncul di bagian paling atas forum

---

### FR-06: Notifikasi & Pengumuman

---

#### FR-06-01: Notifikasi In-App

**Deskripsi:** Notifikasi muncul di dalam aplikasi (bell icon di navbar).

**Aturan:**
- Notifikasi disimpan di database dan ditampilkan saat pengguna login
- Notifikasi punya status: `UNREAD` / `READ`
- Pengguna bisa tandai semua notifikasi sebagai sudah dibaca sekaligus
- Notifikasi tidak dihapus otomatis; pengguna bisa hapus manual
- Maksimal 100 notifikasi ditampilkan; yang lebih lama diarsip (tidak ditampilkan di UI tapi tetap di database)

**Trigger & Penerima (sesuai `01_PRD.md` Section 4, Modul 6):**

| Event | Penerima | Isi Notifikasi |
|---|---|---|
| Tugas baru dipublish | Siswa kelas + orang tua | "Tugas baru: [judul] di [nama kelas]. Deadline: [tanggal]" |
| H-1 deadline tugas | Siswa belum kumpul + orang tua | "Pengingat: Tugas [judul] berakhir besok [tanggal]" |
| Tugas dinilai | Siswa + orang tua | "Tugas [judul] telah dinilai. Nilai: [nilai]" |
| Ujian baru dijadwalkan | Siswa kelas | "Ujian baru: [judul] pada [tanggal]" |
| H-1 jadwal ujian | Siswa kelas | "Pengingat: Ujian [judul] besok [tanggal]" |
| Rapor dirilis | Siswa + orang tua | "Rapor semester [semester] telah tersedia" |
| Siswa Alpa | Orang tua | "Informasi kehadiran: [nama anak] tidak hadir tanpa keterangan pada [tanggal] di [mapel]" |
| Thread dibalas | Pembuat thread + peserta aktif | "[nama] membalas di thread: [judul]" |
| Pengumuman baru | Sesuai target | "Pengumuman: [judul pengumuman]" |

---

#### FR-06-02: Pengumuman

**Aturan:**
- Pengumuman sekolah: dibuat admin, target semua pengguna aktif
- Pengumuman kelas: dibuat guru, target siswa + orang tua di kelas tersebut
- Pengumuman mendukung rich text dan lampiran (maks 10MB)
- Pengumuman bisa dijadwalkan (publish di waktu tertentu di masa depan)
- Pengumuman yang sudah dipublish bisa diedit; sistem mencatat versi sebelumnya
- Pengumuman tidak bisa dihapus, hanya bisa diarsip

---

### FR-07: Absensi Digital

---

#### FR-07-01: Pencatatan Kehadiran

**Deskripsi:** Guru mencatat kehadiran siswa per pertemuan.

**Status Kehadiran:**
- `HADIR` — siswa hadir
- `IZIN` — tidak hadir dengan surat izin resmi
- `SAKIT` — tidak hadir karena sakit (dengan/tanpa surat dokter)
- `ALPA` — tidak hadir tanpa keterangan

**Aturan:**
- Guru mencatat kehadiran per kelas per pertemuan (1 pertemuan = 1 sesi absensi)
- Tanggal pertemuan tidak bisa di masa depan
- Guru bisa mengedit kehadiran yang sudah dicatat dalam batas 7 hari setelah pertemuan; setelah itu hanya admin yang bisa mengedit
- Jika guru tidak mencatat kehadiran untuk suatu pertemuan, pertemuan itu tidak masuk hitungan total hari (tidak dianggap semua alpa)
- Sistem otomatis mengirim notifikasi ke orang tua jika status siswa = `ALPA`

---

#### FR-07-02: Rekap & Laporan Kehadiran

**Aturan:**
- Persentase kehadiran = `(jumlah HADIR / total pertemuan tercatat) × 100%`
- IZIN dan SAKIT **tidak** dihitung sebagai ketidakhadiran dalam kalkulasi persentase kehadiran untuk kriteria kenaikan kelas
- Sistem menampilkan peringatan visual jika persentase kehadiran siswa mendekati batas minimum 80% (warning pada ≤85%, danger pada ≤80%)
- Admin bisa mengunduh laporan kehadiran dalam format CSV per kelas per periode

---

## 3. Kebutuhan Non-Fungsional

### NFR-01: Performa

| Metrik | Target |
|---|---|
| Time to First Byte (TTFB) | < 500ms untuk halaman utama |
| Waktu load halaman (LCP) | < 3 detik pada koneksi WiFi 10 Mbps |
| Response API | < 1 detik untuk operasi baca biasa |
| Response API upload | < 10 detik untuk file 50MB |
| Concurrent users | Mampu melayani 200 pengguna aktif bersamaan tanpa degradasi signifikan |

---

### NFR-02: Keamanan

| Aspek | Implementasi |
|---|---|
| Autentikasi | JWT via NextAuth.js; token di-rotate setiap 4 jam |
| Autorisasi | Role-based access control (RBAC) divalidasi di setiap API route |
| Password | Hash menggunakan bcrypt dengan salt rounds = 12 |
| CSRF | Proteksi bawaan Next.js + validasi origin header |
| SQL Injection | Terlindungi via Prisma parameterized queries |
| XSS | Input disanitasi sebelum disimpan; output di-escape oleh React |
| File upload | Validasi MIME type dan ekstensi di server; file disimpan di luar direktori publik web |
| Data isolation | Setiap query memfilter berdasarkan `userId` atau `kelasId` yang terhubung ke session — pengguna tidak bisa mengakses data milik pengguna lain |
| Rate limiting | API endpoint sensitif (login, reset password) dibatasi 10 request/menit per IP |

---

### NFR-03: Ketersediaan & Reliabilitas

| Aspek | Target |
|---|---|
| Uptime target | 99% selama jam sekolah (07.00–17.00 WIB, hari kerja) |
| Backup database | Otomatis setiap hari pukul 23.00 WIB ke folder backup lokal |
| Recovery | Data bisa dipulihkan dari backup terakhir dalam < 2 jam |
| Error logging | Semua error server (status 500) dicatat di log file dengan timestamp |

---

### NFR-04: Usability

| Aspek | Target |
|---|---|
| Responsivitas | UI berfungsi penuh di viewport 375px (mobile) hingga 1440px (desktop) |
| Browser support | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| Aksesibilitas | Memenuhi WCAG 2.1 Level AA untuk komponen utama |
| Onboarding | Guru bisa membuat kelas dan upload materi pertama dalam < 10 menit tanpa bantuan |
| Bahasa | Seluruh UI dalam Bahasa Indonesia |

---

### NFR-05: Maintainability

| Aspek | Target |
|---|---|
| Codebase | TypeScript strict mode aktif; tidak ada `any` type yang tidak terdokumentasi |
| Linting | ESLint + Prettier wajib pass sebelum commit |
| Testing | Coverage minimal 60% untuk fungsi utility & API routes |
| Dokumentasi | Setiap API route dan fungsi utama memiliki komentar JSDoc |
| Migrasi DB | Semua perubahan schema via Prisma Migrations (tidak ada manual SQL) |

---

## 4. Aturan Bisnis Global

Aturan yang berlaku lintas modul dan harus dipatuhi di seluruh sistem:

| Kode | Aturan |
|---|---|
| BR-01 | Pengguna hanya bisa mengakses data yang sesuai dengan role dan relasi mereka (siswa hanya data di kelas yang diikuti, guru hanya data di kelas yang diajar, orang tua hanya data anak yang terdaftar) |
| BR-02 | Tidak ada data yang benar-benar dihapus dari database — semua menggunakan soft delete dengan field `deletedAt` |
| BR-03 | Semua operasi yang mengubah data akademik (nilai, kehadiran) mencatat audit trail: `userId`, `timestamp`, `nilai_lama`, `nilai_baru` |
| BR-04 | Tahun ajaran dan semester aktif dikonfigurasi oleh admin; fitur akademik (buat tugas, ujian, absensi) hanya bisa dilakukan untuk tahun ajaran & semester yang aktif |
| BR-05 | Satu rombel (misal: X MIPA 1) bisa memiliki banyak kelas virtual (1 per mata pelajaran yang diambil) |
| BR-06 | Data nilai yang sudah masuk ke rapor berstatus `FINAL` tidak bisa diubah kecuali oleh admin dengan alasan tercatat |
| BR-07 | Notifikasi dikirim secara asinkron (tidak memblokir response API utama) |
| BR-08 | Semua timestamp disimpan dalam UTC; konversi ke WIB (UTC+7) dilakukan di sisi client |
| BR-09 | File upload yang gagal di tengah jalan tidak boleh menyisakan file parsial di server |
| BR-10 | Kode kelas bersifat unik dan immutable setelah dibuat |

---

## 5. Constraint Sistem

| Constraint | Nilai | Keterangan |
|---|---|---|
| Maks ukuran file materi | 50 MB | Per file |
| Maks ukuran file tugas siswa | 20 MB | Per pengumpulan |
| Maks ukuran foto profil | 2 MB | — |
| Maks ukuran lampiran forum | 5 MB | Per gambar |
| Maks ukuran lampiran pengumuman | 10 MB | — |
| Maks soal per ujian | 100 soal | — |
| Durasi ujian minimum | 5 menit | — |
| Durasi ujian maksimum | 180 menit | — |
| Maks notifikasi ditampilkan | 100 | Yang lebih lama diarsip |
| Session timeout | 8 jam | Sejak login terakhir |
| Lock login gagal | 5x percobaan / 15 menit | Kunci 30 menit |
| Edit kehadiran oleh guru | Maks 7 hari setelah pertemuan | Setelah itu hanya admin |
| Token reset password | Berlaku 1 jam | Sekali pakai |

---

## 6. Referensi

| Dokumen | Relevansi |
|---|---|
| `00_PROJECT_OVERVIEW.md` | Tech stack, scope, milestone |
| `01_PRD.md` | Fitur lengkap per modul, kebutuhan pengguna |
| `03_SYSTEM_DESIGN.md` | Arsitektur sistem dan komponen teknis |
| `04_DATABASE_DESIGN.md` | Schema database yang mengimplementasikan FR di dokumen ini |
| `05_API_SPEC.md` | Spesifikasi endpoint API yang mengimplementasikan FR di dokumen ini |
| `14_SECURITY.md` | Detail implementasi keamanan dari NFR-02 |
| `CURRICULUM.md` | Sumber kebenaran untuk aturan nilai, predikat, dan kehadiran |

---

*Dokumen ini terakhir diperbarui: Juni 2026 | Versi: 1.0*
*Project: Nusantara Fantasy Learning System (NFLS) | SMAN Nusantara Fantasy*
