import { FiTrendingUp, FiActivity, FiBriefcase, FiUsers, FiTrendingDown } from 'react-icons/fi';

export default function DasborSekolah() {
  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Analitik & Dasbor Sekolah
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Dapatkan ringkasan metrik analitis kehadiran, performa belajar, dan pertumbuhan partisipasi siswa.
        </p>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Persentase Kehadiran</span>
            <FiActivity className="text-emerald-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-[#1B254B]">96.8%</div>
          <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <FiTrendingUp /> +1.2% Bulan ini
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pertumbuhan Siswa</span>
            <FiUsers className="text-[#4318FF] w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-[#1B254B]">+342</div>
          <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <FiTrendingUp /> +8.4% Tahun ini
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Jumlah Pengajar</span>
            <FiBriefcase className="text-amber-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-[#1B254B]">48 Guru</div>
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
            Stabil / Kuota Terpenuhi
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Nilai Rata-rata Kuis</span>
            <FiTrendingUp className="text-indigo-500 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-[#1B254B]">82.4 / 100</div>
          <div className="text-xs text-rose-500 font-bold flex items-center gap-1">
            <FiTrendingDown /> -0.3% Minggu ini
          </div>
        </div>
      </div>

      {/* Activity Tracker Section */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B]">Aktivitas Pembelajaran Terkini</h3>
        <p className="text-slate-500 text-xs">Informasi log aktivitas real-time yang dicatat dari platform EduCentralHub.</p>
        <div className="space-y-3 pt-2">
          <div className="p-4 bg-[#F8FAFC] border border-slate-50 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-[#1B254B]">Ujian Fisika Kelas 10 IPA-A telah dipublikasikan oleh Guru</span>
            <span className="text-slate-400 font-semibold">2 menit yang lalu</span>
          </div>
          <div className="p-4 bg-[#F8FAFC] border border-slate-50 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-[#1B254B]">Pendaftaran 12 siswa baru ke Kelas 10 IPA-B sukses dilakukan</span>
            <span className="text-slate-400 font-semibold">15 menit yang lalu</span>
          </div>
          <div className="p-4 bg-[#F8FAFC] border border-slate-50 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-[#1B254B]">Materi "Pengenalan Database" diunggah untuk Kelas 11 RPL</span>
            <span className="text-slate-400 font-semibold">1 jam yang lalu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
