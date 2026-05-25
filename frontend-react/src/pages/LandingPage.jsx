import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1B254B] font-sans overflow-x-hidden">
      {/* Premium Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#4318FF] to-[#3010C8] bg-clip-text text-transparent">
              EduCentralHub
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="bg-[#4318FF] hover:bg-[#3010C8] text-white rounded-xl px-6 py-2.5 font-semibold text-sm shadow-lg shadow-[#4318FF]/20 hover:shadow-[#4318FF]/30 active:scale-[0.98] transition-all duration-200"
            >
              Masuk Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-6 overflow-hidden">
        {/* Soft Background Accent Blobs */}
        <div className="absolute top-[10%] left-[-10%] w-[35rem] h-[35rem] bg-[#4318FF]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4318FF]/5 rounded-full text-sm font-semibold text-[#4318FF] mb-8 animate-fade-in shadow-sm border border-[#4318FF]/10">
            <span className="w-2 h-2 rounded-full bg-[#4318FF] animate-pulse"></span>
            Edu-Tech Ecosystem Modern & Terintegrasi
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1B254B] leading-tight mb-8">
            Transformasi Ekosistem <br />
            <span className="bg-gradient-to-r from-[#4318FF] to-indigo-600 bg-clip-text text-transparent">
              Pendidikan Digital
            </span> Masa Kini
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            EduCentralHub adalah platform all-in-one yang menghubungkan Admin, Guru, dan Siswa secara dinamis. Kelola kelas, bagikan materi interaktif, dan lacak progres akademik dalam satu dasbor premium yang bersih.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-[#4318FF] hover:bg-[#3010C8] text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#4318FF]/20 hover:shadow-[#4318FF]/35 transition-all duration-200 active:scale-[0.98]"
            >
              Mulai Eksplorasi
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl shadow-sm border border-slate-200/80 transition-all duration-200 active:scale-[0.98] text-center"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="fitur" className="py-24 bg-white border-t border-slate-100/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B254B] mb-4">
              Tiga Pilar Utama Ekosistem Kami
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Platform modern yang dirancang khusus untuk memenuhi seluruh kebutuhan operasional dan pembelajaran di institusi Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Portal Admin */}
            <div className="group bg-[#F8FAFC] border border-slate-100 hover:border-indigo-100 hover:bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center rounded-2xl text-2xl font-bold mb-8 group-hover:scale-110 transition-transform duration-300">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-4">Portal Admin</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Kendali penuh manajemen institusi. CRUD kelas secara instan, kelola kuota pengajar dan siswa, serta eksekusi perpindahan anggota kelas secara massal ala WhatsApp-Style.
              </p>
            </div>

            {/* Card 2: Ruang Guru */}
            <div className="group bg-[#F8FAFC] border border-slate-100 hover:border-indigo-100 hover:bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center rounded-2xl text-2xl font-bold mb-8 group-hover:scale-110 transition-transform duration-300">
                📚
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-4">Ruang Guru</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Pusat pengajaran interaktif. Unggah dokumen materi belajar secara dinamis ke kelas bimbingan Anda, buat kuis evaluasi berkualitas, serta pantau jawaban siswa secara langsung.
              </p>
            </div>

            {/* Card 3: Dasbor Siswa */}
            <div className="group bg-[#F8FAFC] border border-slate-100 hover:border-indigo-100 hover:bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center rounded-2xl text-2xl font-bold mb-8 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-4">Dasbor Siswa</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Pintu masuk pembelajaran mandiri. Unduh materi pelajaran terlampir, kerjakan kuis evaluasi dengan integrasi skor instan, serta pantau rapor pencapaian akademik secara berkala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] border-t border-slate-100 py-12 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="font-extrabold text-sm text-[#1B254B]">EduCentralHub</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} EduCentralHub. All rights reserved. Developed under Antigravity AI supervision.
          </p>
        </div>
      </footer>
    </div>
  );
}
