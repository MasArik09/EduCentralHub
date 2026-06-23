# 01 · Product Requirements Document (PRD)
# Nusantara Fantasy Learning System (NFLS)

> **Tujuan Dokumen:** Mendefinisikan *apa* yang dibangun, *untuk siapa*, dan *mengapa* — dari sudut pandang produk.
> Dokumen teknis (bagaimana caranya) ada di `02_SRS.md` dan seterusnya.
> Versi: 1.0 | Terakhir diperbarui: Juni 2026

---

## 1. Latar Belakang Produk

### 1.1 Masalah yang Diselesaikan

SMA Negeri Nusantara Fantasy (SMAN-NF) selama ini mengandalkan kombinasi alat digital yang tidak terintegrasi untuk kegiatan belajar-mengajar:

| Kebutuhan | Solusi Sementara (Sebelum NFLS) | Masalah |
|---|---|---|
| Distribusi materi | WhatsApp Group | Pesan tenggelam, tidak terarsip, tidak terstruktur |
| Pengumpulan tugas | Google Form / Email | Tidak ada sistem penilaian, sulit dilacak |
| Kuis & ujian | Google Form | Tidak ada timer, rawan kecurangan, manual grading |
| Komunikasi | Email personal guru | Tidak resmi, respon lambat, tidak terdokumentasi |
| Rekap nilai | Spreadsheet Excel lokal | Rawan human error, tidak real-time, tidak bisa diakses siswa |
| Laporan ke orang tua | Rapor fisik semester | Lambat, orang tua tidak bisa pantau progress harian |

Hasilnya: data akademik terfragmentasi, beban administratif guru tinggi, dan orang tua tidak memiliki visibilitas terhadap perkembangan anak secara berkala.

### 1.2 Solusi: NFLS

**Nusantara Fantasy Learning System (NFLS)** adalah platform LMS berbasis web yang menyatukan semua kebutuhan akademik SMAN-NF dalam satu ekosistem digital — dapat diakses dari perangkat apapun (desktop, tablet, smartphone) melalui browser.

### 1.3 Posisi Produk

NFLS bukan pengganti interaksi manusiawi di kelas — melainkan **infrastruktur digital** yang memperkuat dan mendokumentasikan proses pembelajaran yang sudah berjalan di SMAN-NF.

---

## 2. Tujuan Produk

| # | Tujuan | Indikator Keberhasilan |
|---|---|---|
| P1 | Menyatukan semua alat akademik dalam satu platform | Tidak ada lagi penggunaan WhatsApp/GForm untuk tugas akademik |
| P2 | Memusatkan data akademik seluruh siswa | Semua nilai, kehadiran, rapor tersimpan dan terakses di NFLS |
| P3 | Memberikan visibilitas real-time kepada orang tua | Orang tua dapat melihat nilai & kehadiran anak kapan saja |
| P4 | Mengurangi beban administratif guru | Guru tidak perlu rekap nilai manual di spreadsheet |
| P5 | Menjadi platform komunikasi resmi sekolah | Pengumuman sekolah tersebar melalui NFLS, bukan grup chat |

---

## 3. Pengguna & Kebutuhan

### 3.1 Siswa (~1.260 pengguna)

**Profil:** Siswa kelas X, XI, dan XII dari semua program studi (MIPA, IPS, Bahasa & Budaya, Kelas Olimpiade, Kelas Seni). Usia 15–18 tahun. Melek teknologi, terbiasa dengan smartphone dan media sosial.

**Pain Point Saat Ini:**
- Materi pelajaran tersebar di banyak grup WhatsApp berbeda tiap mata pelajaran
- Sering lupa deadline tugas karena tidak ada notifikasi terpusat
- Tidak bisa melihat nilai secara real-time, harus nunggu guru mengumumkan
- Tidak punya dokumentasi perjalanan akademik yang terstruktur

**Kebutuhan Utama:**

| # | Kebutuhan | Prioritas |
|---|---|---|
| S1 | Mengakses semua materi pelajaran dalam satu tempat | Tinggi |
| S2 | Melihat dan mengumpulkan tugas sebelum deadline | Tinggi |
| S3 | Mengikuti ujian & kuis online | Tinggi |
| S4 | Melihat nilai tugas, kuis, UTS, UAS secara real-time | Tinggi |
| S5 | Melihat rapor digital per semester | Tinggi |
| S6 | Melihat rekap kehadiran diri sendiri | Sedang |
| S7 | Berpartisipasi dalam forum diskusi kelas | Sedang |
| S8 | Menerima notifikasi deadline & pengumuman | Sedang |
| S9 | Melihat jadwal pelajaran & kalender akademik | Rendah |

---

### 3.2 Guru (~87 pengguna)

**Profil:** Guru mata pelajaran, wali kelas, dan guru BK. Kemampuan digital bervariasi — dari guru muda yang terbiasa teknologi hingga guru senior yang membutuhkan antarmuka yang intuitif.

**Pain Point Saat Ini:**
- Mengelola banyak grup WhatsApp untuk distribusi materi (1 grup per kelas per mapel)
- Rekap nilai manual di spreadsheet Excel rentan error dan makan waktu
- Tidak ada sistem terpusat untuk memonitor siswa yang aktif vs pasif
- Komunikasi dengan orang tua hanya saat rapat semester atau jika ada masalah

**Kebutuhan Utama:**

| # | Kebutuhan | Prioritas |
|---|---|---|
| G1 | Membuat dan mengelola kelas mata pelajaran | Tinggi |
| G2 | Mengunggah materi (PDF, video, tautan, modul) | Tinggi |
| G3 | Membuat tugas dengan deadline dan deskripsi jelas | Tinggi |
| G4 | Menilai dan memberi feedback tugas siswa | Tinggi |
| G5 | Membuat soal ujian/kuis dengan berbagai tipe soal | Tinggi |
| G6 | Menginput dan mengelola nilai per komponen (tugas, kuis, UTS, UAS, proyek) | Tinggi |
| G7 | Mengisi rapor digital siswa per semester | Tinggi |
| G8 | Mencatat kehadiran siswa per pertemuan | Tinggi |
| G9 | Melihat statistik kemajuan dan partisipasi siswa | Sedang |
| G10 | Memandu forum diskusi kelas | Sedang |
| G11 | Mengirim pengumuman kepada kelas tertentu | Sedang |
| G12 | Berkomunikasi dengan orang tua siswa (sebagai wali kelas) | Sedang |

---

### 3.3 Orang Tua (~1.260 pengguna)

**Profil:** Orang tua atau wali sah dari siswa terdaftar. Kemampuan digital sangat bervariasi. Kebutuhan utama mereka adalah memantau perkembangan anak tanpa harus menghubungi guru secara langsung.

**Pain Point Saat Ini:**
- Hanya tahu nilai anak saat terima rapor (2x setahun)
- Tidak tahu apakah anak hadir atau absen di sekolah secara real-time
- Harus menghubungi wali kelas secara personal untuk tanya perkembangan anak
- Pengumuman sekolah sering tidak sampai karena via grup WhatsApp yang ramai

**Kebutuhan Utama:**

| # | Kebutuhan | Prioritas |
|---|---|---|
| OT1 | Melihat nilai tugas, kuis, UTS, UAS anak | Tinggi |
| OT2 | Mengakses rapor digital anak per semester | Tinggi |
| OT3 | Melihat rekap kehadiran anak | Tinggi |
| OT4 | Menerima notifikasi pengumuman sekolah | Sedang |
| OT5 | Berkomunikasi dengan wali kelas via pesan internal | Sedang |

---

### 3.4 Administrator (~5 pengguna)

**Profil:** Staf Tata Usaha (TU), operator sekolah, dan koordinator IT. Bertanggung jawab atas konfigurasi sistem dan manajemen data master.

**Kebutuhan Utama:**

| # | Kebutuhan | Prioritas |
|---|---|---|
| A1 | Mengelola data pengguna (tambah, edit, nonaktifkan akun) | Tinggi |
| A2 | Mengatur tahun ajaran dan semester aktif | Tinggi |
| A3 | Membuat dan mengonfigurasi struktur kelas & program studi | Tinggi |
| A4 | Mengelola kalender akademik (hari efektif, hari libur, jadwal ujian) | Tinggi |
| A5 | Melihat log aktivitas sistem | Sedang |
| A6 | Membuat laporan rekapitulasi akademik sekolah | Sedang |
| A7 | Mengelola pengumuman & berita resmi sekolah | Sedang |
| A8 | Melakukan import data massal (siswa baru, guru baru) | Sedang |

---

## 4. Fitur Produk (MVP)

MVP NFLS terdiri dari **7 modul** + **1 modul fondasi** (Auth & Manajemen User):

---

### Modul 0: Autentikasi & Manajemen Akun

Fondasi dari semua modul. Menangani identitas dan akses pengguna.

| Fitur | Deskripsi | Role |
|---|---|---|
| Login dengan email & password | Autentikasi standar berbasis email | Semua |
| Multi-role session | Satu akun bisa memiliki satu role (siswa/guru/ortu/admin) | Semua |
| Lupa password | Reset password via email | Semua |
| Manajemen profil | Edit nama, foto profil, ubah password | Semua |
| Manajemen akun (admin) | CRUD user, assign role, nonaktifkan akun | Admin |
| Import data massal | Upload CSV untuk onboarding siswa/guru baru | Admin |
| Satu siswa — satu akun orang tua | Akun orang tua terhubung ke akun siswa anaknya | Admin, Ortu |

---

### Modul 1: Manajemen Kelas & Materi

Guru mengelola kelas virtual dan mendistribusikan konten pembelajaran.

| Fitur | Deskripsi | Role |
|---|---|---|
| Buat kelas mata pelajaran | Guru membuat kelas dengan nama mapel, tahun ajaran, program studi, dan rombel | Guru |
| Enroll siswa ke kelas | Admin/guru mendaftarkan siswa ke kelas yang sesuai | Guru, Admin |
| Upload materi | Guru mengunggah PDF, dokumen, tautan video YouTube/eksternal | Guru |
| Organisasi materi per topik/bab | Materi dikelompokkan dalam folder/topik (misal: "Bab 1 - Kinematika") | Guru |
| Akses materi | Siswa membuka dan mengunduh materi yang diunggah guru | Siswa |
| Daftar kelas siswa | Siswa melihat semua kelas yang diikuti | Siswa |
| Arsip materi lama | Guru bisa mengarsip materi yang sudah tidak aktif tanpa menghapusnya | Guru |

**Tipe File yang Didukung:**
- Dokumen: PDF, DOCX, PPTX, XLSX
- Gambar: JPG, PNG
- Tautan eksternal: YouTube, Google Drive (embed link)
- Batas ukuran file: 50MB per file

---

### Modul 2: Tugas & Pengumpulan

Siklus penuh tugas dari pembuatan hingga penilaian.

| Fitur | Deskripsi | Role |
|---|---|---|
| Buat tugas | Guru membuat tugas dengan judul, deskripsi, instruksi, lampiran, dan deadline | Guru |
| Tipe pengumpulan | Siswa bisa submit: file upload, teks online, atau keduanya | Guru, Siswa |
| Notifikasi tugas baru | Siswa & orang tua mendapat notifikasi saat tugas baru dibuat | Siswa, Ortu |
| Pengumpulan tugas | Siswa upload file atau tulis teks sebelum deadline | Siswa |
| Indikator status | Siswa tahu apakah tugasnya: Belum Dikumpul / Sudah Dikumpul / Terlambat / Dinilai | Siswa |
| Pengumpulan terlambat | Sistem menerima tapi menandai tugas sebagai "Terlambat" | Siswa |
| Penilaian tugas | Guru memberi nilai (0–100) dan komentar/feedback per siswa | Guru |
| Notifikasi nilai | Siswa & orang tua mendapat notifikasi saat tugas selesai dinilai | Siswa, Ortu |
| Rekap pengumpulan | Guru melihat siapa yang sudah/belum mengumpulkan dalam satu tampilan | Guru |

**Tipe File Upload Siswa:**
- PDF, DOCX, JPG, PNG, ZIP
- Batas ukuran: 20MB per pengumpulan

---

### Modul 3: Ujian & Kuis Online

Sistem asesmen digital dengan berbagai tipe soal dan manajemen sesi ujian.

| Fitur | Deskripsi | Role |
|---|---|---|
| Buat bank soal | Guru membuat dan menyimpan soal dalam bank soal per mata pelajaran | Guru |
| Tipe soal | Pilihan Ganda (PG), Benar/Salah, Esai | Guru |
| Buat ujian/kuis | Guru merakit ujian dari bank soal atau buat langsung, atur durasi & jadwal buka-tutup | Guru |
| Acak soal & pilihan | Opsi untuk mengacak urutan soal dan pilihan jawaban antar siswa | Guru |
| Sesi ujian terkontrol | Siswa hanya bisa mengakses ujian dalam jendela waktu yang ditentukan guru | Siswa |
| Timer otomatis | Countdown timer terlihat selama ujian; submit otomatis saat waktu habis | Siswa |
| Auto-grading PG & B/S | Penilaian otomatis untuk soal Pilihan Ganda dan Benar/Salah | Sistem |
| Penilaian manual esai | Guru menilai jawaban esai secara manual dengan form nilai + feedback | Guru |
| Hasil ujian | Siswa melihat nilai akhir setelah guru merilis hasil | Siswa |
| Review jawaban | Guru bisa mengizinkan siswa melihat jawaban benar setelah ujian selesai | Guru |
| Rekap hasil ujian | Guru melihat distribusi nilai, rata-rata, dan statistik per soal | Guru |

**Catatan Keamanan Ujian:**
- Tidak ada fitur anti-cheat kompleks di MVP (tidak ada lockdown browser)
- Soal tidak ditampilkan semua sekaligus — navigasi per soal
- Log waktu submit dicatat sistem

---

### Modul 4: Nilai & Rapor Digital

Sistem penilaian mengacu pada komponen Kurikulum Merdeka yang berlaku di SMAN-NF.

#### 4.1 Komponen Nilai (sesuai CURRICULUM.md)

| Komponen | Bobot |
|---|---|
| Tugas Harian | 20% |
| Kuis | 15% |
| UTS (Ujian Tengah Semester) | 25% |
| UAS (Ujian Akhir Semester) | 30% |
| Proyek / Portofolio | 10% |

#### 4.2 Fitur Nilai

| Fitur | Deskripsi | Role |
|---|---|---|
| Input nilai manual | Guru menginput nilai komponen yang tidak dari sistem (misal: nilai proyek, nilai presentasi) | Guru |
| Rekap nilai otomatis | Sistem merekap nilai dari tugas & ujian yang dinilai via NFLS | Sistem |
| Kalkulasi nilai akhir | Sistem menghitung nilai akhir berdasarkan bobot komponen | Sistem |
| Predikat otomatis | Sistem memberi predikat A/B/C/D/E berdasarkan rentang nilai di CURRICULUM.md | Sistem |
| Lihat nilai per mapel | Siswa melihat nilai tiap komponen per mata pelajaran | Siswa |
| Lihat nilai anak | Orang tua melihat nilai komponen anak per mata pelajaran | Ortu |

#### 4.3 Skala Nilai & Predikat (sesuai CURRICULUM.md)

| Rentang | Predikat | Keterangan |
|---|---|---|
| 90–100 | A (Sangat Baik) | Melampaui ekspektasi |
| 80–89 | B (Baik) | Memenuhi dan sedikit melampaui ekspektasi |
| 70–79 | C (Cukup) | Memenuhi ekspektasi minimum |
| 60–69 | D (Perlu Bimbingan) | Belum memenuhi ekspektasi, perlu remediasi |
| < 60 | E (Tidak Lulus) | Wajib ikut program remediasi intensif |

#### 4.4 Rapor Digital

| Fitur | Deskripsi | Role |
|---|---|---|
| Generate rapor | Wali kelas/admin membuat rapor digital per siswa per semester | Guru, Admin |
| Isi deskripsi rapor | Guru mengisi narasi perkembangan siswa (sesuai Kurikulum Merdeka) | Guru |
| Lihat rapor digital | Siswa dan orang tua mengakses rapor dalam format yang rapi di platform | Siswa, Ortu |
| Unduh rapor PDF | Siswa dan orang tua bisa unduh rapor sebagai file PDF | Siswa, Ortu |
| Riwayat rapor | Semua rapor semester tersimpan dan bisa diakses kapan saja | Siswa, Ortu |

#### 4.5 Remediasi (sesuai CURRICULUM.md)

| Kondisi | Tindakan Sistem |
|---|---|
| Nilai < 70 | Sistem menandai siswa sebagai "Perlu Remediasi" pada mata pelajaran tersebut |
| Setelah remediasi | Guru menginput nilai remediasi; sistem menyimpan catatan remediasi |
| Nilai akhir remediasi | Nilai yang tercatat di rapor maksimal 75 (sesuai kebijakan sekolah) |

---

### Modul 5: Forum Diskusi

Ruang diskusi akademik terstruktur per kelas/mata pelajaran.

| Fitur | Deskripsi | Role |
|---|---|---|
| Forum per kelas | Setiap kelas mata pelajaran memiliki forum diskusinya sendiri | Guru, Siswa |
| Buat thread diskusi | Guru atau siswa membuat topik diskusi baru | Guru, Siswa |
| Balas thread | Semua anggota kelas bisa membalas thread | Guru, Siswa |
| Pin thread penting | Guru bisa pin thread agar selalu di atas | Guru |
| Tandai jawaban terbaik | Guru bisa menandai balasan sebagai "Jawaban Terbaik" | Guru |
| Moderasi konten | Guru bisa menghapus thread/balasan yang tidak sesuai | Guru |
| Notifikasi balasan | Pengguna mendapat notifikasi saat thread yang mereka ikuti dibalas | Guru, Siswa |

---

### Modul 6: Notifikasi & Pengumuman

Sistem komunikasi resmi satu arah (pengumuman) dan notifikasi otomatis sistem.

#### 6.1 Pengumuman

| Fitur | Deskripsi | Role |
|---|---|---|
| Pengumuman sekolah | Admin membuat pengumuman untuk seluruh warga sekolah | Admin |
| Pengumuman kelas | Guru membuat pengumuman untuk kelas tertentu | Guru |
| Arsip pengumuman | Semua pengumuman tersimpan dan bisa dicari | Semua |

#### 6.2 Notifikasi Otomatis Sistem

| Trigger | Penerima |
|---|---|
| Tugas baru dibuat | Siswa di kelas tersebut + orang tua |
| H-1 deadline tugas | Siswa yang belum mengumpulkan + orang tua |
| Tugas selesai dinilai | Siswa yang bersangkutan + orang tua |
| Ujian baru dibuat | Siswa di kelas tersebut |
| H-1 jadwal ujian | Siswa di kelas tersebut |
| Nilai rapor dirilis | Siswa + orang tua |
| Pengumuman baru | Sesuai target pengumuman |

---

### Modul 7: Absensi Digital

Pencatatan kehadiran siswa per pertemuan oleh guru.

| Fitur | Deskripsi | Role |
|---|---|---|
| Catat kehadiran | Guru mencatat status kehadiran tiap siswa per pertemuan: Hadir / Izin / Sakit / Alpa | Guru |
| Edit kehadiran | Guru bisa mengedit kehadiran yang sudah dicatat (jika ada koreksi) | Guru |
| Rekap kehadiran siswa | Siswa melihat rekap kehadiran diri sendiri per mata pelajaran | Siswa |
| Rekap kehadiran anak | Orang tua melihat rekap kehadiran anak | Ortu |
| Rekap per kelas | Guru melihat statistik kehadiran seluruh siswa di kelasnya | Guru |
| Notifikasi absen | Orang tua mendapat notifikasi jika anak tidak hadir (status Alpa) | Ortu |
| Laporan kehadiran | Admin dapat mengunduh laporan kehadiran per kelas/periode | Admin |

**Aturan Kehadiran (sesuai CURRICULUM.md):**
- Kehadiran minimal untuk naik kelas: **80% dari total hari efektif**
- Sistem menampilkan persentase kehadiran real-time

---

## 5. Kebutuhan Non-Fungsional (Ringkasan)

> Detail lengkap ada di `02_SRS.md`. Berikut poin utama dari perspektif produk.

| Aspek | Target |
|---|---|
| **Aksesibilitas** | Dapat diakses dari browser desktop dan mobile tanpa install aplikasi |
| **Performa** | Halaman utama load < 3 detik pada koneksi WiFi sekolah |
| **Kemudahan Penggunaan** | Guru senior (non-tech) dapat menggunakan fitur utama tanpa pelatihan intensif |
| **Keamanan Data** | Data nilai dan rapor siswa hanya bisa diakses oleh yang berhak |
| **Ketersediaan** | Sistem tersedia selama jam sekolah (07.00–17.00 WIB) tanpa downtime terjadwal |

---

## 6. Batasan Produk (Scope Boundary)

### Yang Ada di MVP
✅ Semua fitur di Modul 0–7 yang terdefinisi di atas

### Yang Tidak Ada di MVP (Future Release)
| Fitur | Alasan Ditunda |
|---|---|
| Video conference / live class | Kompleksitas tinggi, butuh infrastruktur streaming |
| Integrasi sistem keuangan | Di luar scope akademik MVP |
| Aplikasi mobile native | Web responsive sudah cukup untuk MVP |
| Laporan analytics lanjutan | Butuh data historis yang cukup dulu |
| Integrasi CCTV / absensi fingerprint | Hardware integration, bukan scope software MVP |
| AI tutor / chatbot | Future enhancement |

---

## 7. Asumsi & Dependensi

### Asumsi
- Setiap siswa, guru, dan orang tua memiliki akses ke perangkat (laptop/smartphone) dan koneksi internet
- Sekolah menyediakan WiFi yang mencakup seluruh area (sesuai SCHOOL_PROFILE.md: sudah ada)
- Admin sekolah bertanggung jawab atas onboarding awal (input data siswa & guru)
- Satu siswa hanya memiliki satu akun orang tua yang terdaftar di sistem

### Dependensi
- Data kurikulum dan mata pelajaran mengacu pada `CURRICULUM.md`
- Struktur organisasi mengacu pada `SCHOOL_PROFILE.md`
- Komponen nilai dan sistem penilaian mengacu pada `CURRICULUM.md` Section 4
- Kalender akademik mengacu pada `CURRICULUM.md` Section 5

---

## 8. Glosarium Singkat

> Glosarium lengkap ada di `10_GLOSSARY.md`

| Istilah | Definisi dalam Konteks NFLS |
|---|---|
| **Rombel** | Rombongan Belajar — unit kelas (contoh: X MIPA 1, XI IPS 3) |
| **Mapel** | Mata Pelajaran |
| **Kelas** | Dalam konteks NFLS = kelas virtual per mata pelajaran (bukan rombel fisik) |
| **UTS** | Ujian Tengah Semester |
| **UAS** | Ujian Akhir Semester |
| **P5** | Projek Penguatan Profil Pelajar Pancasila |
| **Wali Kelas** | Guru yang bertanggung jawab atas satu rombel tertentu |
| **Alpa** | Status kehadiran: tidak hadir tanpa keterangan |
| **Remediasi** | Program perbaikan nilai untuk siswa dengan nilai < 70 |
| **Rapor** | Dokumen resmi rekap nilai akhir per semester |

---

## 9. Referensi

| Dokumen | Relevansi |
|---|---|
| `00_PROJECT_OVERVIEW.md` | Konteks umum, tech stack, milestone |
| `02_SRS.md` | Spesifikasi teknis dari kebutuhan di dokumen ini |
| `SCHOOL_PROFILE.md` | Profil sekolah, jumlah siswa/guru, struktur organisasi |
| `CURRICULUM.md` | Kurikulum, mata pelajaran, komponen nilai, kalender akademik |
| `SCHOOL_LORE.md` | Latar belakang dan filosofi SMAN-NF |

---

*Dokumen ini terakhir diperbarui: Juni 2026 | Versi: 1.0*
*Project: Nusantara Fantasy Learning System (NFLS) | SMAN Nusantara Fantasy*
