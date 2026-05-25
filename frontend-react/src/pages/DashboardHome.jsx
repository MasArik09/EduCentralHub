import { useOutletContext, useNavigate } from 'react-router-dom';

export default function DashboardHome() {
  const { user, role } = useOutletContext();
  const navigate = useNavigate();

  const renderRoleContent = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-2">Kelola Kelas</h3>
              <p className="text-slate-500 text-sm mb-4">Buat kelas baru, tetapkan pengajar, atur kurikulum pembelajaran, dan kelola jadwal kelas harian.</p>
              <button 
                onClick={() => navigate('/dashboard/kelola-kelas')}
                className="px-4 py-2 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              >
                Mulai Mengelola
              </button>
            </div>
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#6B21A8] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-2">Enroll Siswa</h3>
              <p className="text-slate-500 text-sm mb-4">Tambahkan siswa baru ke dalam sistem, daftarkan siswa ke kelas tertentu, dan verifikasi status pendaftaran.</p>
              <button 
                onClick={() => navigate('/dashboard/enroll-siswa')}
                className="px-4 py-2 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              >
                Pendaftaran Siswa
              </button>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-2">Upload Materi</h3>
              <p className="text-slate-500 text-sm mb-4">Unggah dokumen materi ajar, video rekaman pembelajaran, e-book, atau referensi studi mahasiswa.</p>
              <button className="px-4 py-2 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer">Unggah Berkas</button>
            </div>
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#E2FBF0] text-[#0F766E] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1B254B] mb-2">Buat Kuis</h3>
              <p className="text-slate-500 text-sm mb-4">Buat latihan soal, kuis pilihan ganda, esai singkat, ujian tengah semester, dan kelola bobot nilai kuis.</p>
              <button className="px-4 py-2 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer">Buat Kuis Baru</button>
            </div>
          </div>
        );
      case 'student':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1B254B] mb-2">Lihat Materi</h3>
              <p className="text-slate-500 text-xs mb-4">Pelajari modul ajar aktif, tonton video pembelajaran mandiri, dan unduh slide presentasi mata kuliah.</p>
              <button className="px-3.5 py-1.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer">Buka Materi</button>
            </div>
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#FCE8F3] text-[#DB2777] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1B254B] mb-2">Kerjakan Kuis</h3>
              <p className="text-slate-500 text-xs mb-4">Selesaikan tugas mingguan yang sedang aktif, ikuti kuis latihan, dan tinjau riwayat pengerjaan Anda.</p>
              <button className="px-3.5 py-1.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer">Mulai Kuis</button>
            </div>
            <div className="p-6 bg-white border border-[#E9EDF7] rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] hover:border-[#4318FF]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#E2FBF0] text-[#0F766E] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1B254B] mb-2">Unduh Rapor</h3>
              <p className="text-slate-500 text-xs mb-4">Akses transkrip nilai akademik lengkap semester ini, cetak rapor digital, dan lihat grafik perkembangan IPK.</p>
              <button className="px-3.5 py-1.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer">Unduh PDF</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="p-8 bg-gradient-to-r from-[#4318FF]/10 via-[#4318FF]/5 to-transparent border border-[#E9EDF7] rounded-2xl relative overflow-hidden text-left">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-[#4318FF]/10 to-transparent pointer-events-none"></div>
        <div className="relative space-y-2 max-w-lg z-10">
          <span className="text-xs font-extrabold text-[#4318FF] uppercase tracking-widest">Workspace</span>
          <h2 className="text-3xl font-extrabold text-[#1B254B]">
            Halo, {user?.name || 'User'}!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Selamat datang kembali di dashboard utama EduCentralHub. Di sini Anda dapat memantau seluruh proses belajar-mengajar Anda. Menu di samping telah disesuaikan berdasarkan peran Anda sebagai <strong className="text-[#4318FF] capitalize">{role}</strong>.
          </p>
        </div>
      </div>

      {/* Dynamic Role-specific Action Panels */}
      <div className="text-left">
        <h3 className="text-lg font-bold text-[#1B254B] mb-4">Aksi Cepat ({role})</h3>
        {renderRoleContent()}
      </div>
    </div>
  );
}
