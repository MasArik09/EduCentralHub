import { useEffect, useRef } from 'react';
import { FiTrendingUp, FiActivity, FiBriefcase, FiUsers, FiTrendingDown, FiBarChart2 } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function DasborSekolah() {
  // ── Attendance Bar Chart Data ──
  const attendanceData = {
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    datasets: [
      {
        label: 'Kehadiran (%)',
        data: [97.2, 96.5, 98.1, 95.8, 96.4],
        backgroundColor: [
          'rgba(99, 102, 241, 0.55)',
          'rgba(99, 102, 241, 0.55)',
          'rgba(99, 102, 241, 0.55)',
          'rgba(99, 102, 241, 0.55)',
          'rgba(99, 102, 241, 0.55)',
        ],
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      },
    ],
  };

  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1B254B',
        bodyColor: '#5F6368',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: 'bold', size: 11 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}% hadir`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, weight: '600' },
        },
        border: { display: false },
      },
      y: {
        min: 90,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, weight: '600' },
          callback: (v) => `${v}%`,
          stepSize: 2,
        },
        border: { display: false },
      },
    },
  };

  // ── Quiz Score Line Chart Data ──
  const quizData = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5', 'Minggu 6'],
    datasets: [
      {
        label: 'Rata-rata Nilai',
        data: [78.2, 80.5, 81.0, 83.6, 82.1, 82.4],
        borderColor: 'rgba(16, 185, 129, 0.85)',
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
          return gradient;
        },
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: 'rgba(16, 185, 129, 0.85)',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const quizOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1B254B',
        bodyColor: '#5F6368',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: 'bold', size: 11 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx) => `Nilai: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, weight: '600' },
        },
        border: { display: false },
      },
      y: {
        min: 70,
        max: 90,
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, weight: '600' },
          stepSize: 5,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left pb-12">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">
          Analitik & Dasbor Sekolah
        </h2>
        <p className="text-[#5F6368] text-xs mt-1">
          Dapatkan ringkasan metrik analitis kehadiran, performa belajar, dan pertumbuhan partisipasi siswa.
        </p>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#5F6368]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Persentase Kehadiran</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg">
              <FiActivity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#202124]">96.8%</div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <FiTrendingUp /> +1.2% Bulan ini
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#5F6368]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pertumbuhan Siswa</span>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#202124]">+342</div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <FiTrendingUp /> +8.4% Tahun ini
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#5F6368]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Jumlah Pengajar</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 flex items-center justify-center rounded-lg">
              <FiBriefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#202124]">48 Guru</div>
          <div className="text-[10px] text-[#5F6368] font-bold flex items-center gap-1">
            Stabil / Kuota Terpenuhi
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[#5F6368]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Nilai Rata-rata Kuis</span>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <FiBarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#202124]">82.4 / 100</div>
          <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
            <FiTrendingDown /> -0.3% Minggu ini
          </div>
        </div>
      </div>

      {/* ═══ DUAL-COLUMN CHART SECTION ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Attendance Bar Chart */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">Tren Kehadiran Siswa Mingguan</h3>
              <p className="text-[10px] text-[#5F6368] font-medium mt-0.5">
                Persentase kehadiran rata-rata per hari kerja minggu ini
              </p>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 font-bold shrink-0">
              Bar Chart
            </span>
          </div>
          <div className="h-[220px] w-full">
            <Bar data={attendanceData} options={attendanceOptions} />
          </div>
        </div>

        {/* Right: Quiz Score Line Chart */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">Perkembangan Rata-Rata Nilai Kuis</h3>
              <p className="text-[10px] text-[#5F6368] font-medium mt-0.5">
                Tren nilai kuis siswa dalam 6 minggu terakhir
              </p>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold shrink-0">
              Line Chart
            </span>
          </div>
          <div className="h-[220px] w-full">
            <Line data={quizData} options={quizOptions} />
          </div>
        </div>
      </div>

      {/* Activity Tracker Section */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#202124]">Aktivitas Pembelajaran Terkini</h3>
          <p className="text-[10px] text-[#5F6368] font-medium mt-0.5">
            Informasi log aktivitas real-time yang dicatat dari platform EduCentralHub.
          </p>
        </div>
        <div className="space-y-3 pt-1">
          <div className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg flex justify-between items-center text-xs hover:bg-white/70 transition-colors">
            <span className="font-bold text-[#202124]">Ujian Fisika Kelas 10 IPA-A telah dipublikasikan oleh Guru</span>
            <span className="text-[#5F6368] font-semibold text-[10px] shrink-0 ml-4">2 menit yang lalu</span>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg flex justify-between items-center text-xs hover:bg-white/70 transition-colors">
            <span className="font-bold text-[#202124]">Pendaftaran 12 siswa baru ke Kelas 10 IPA-B sukses dilakukan</span>
            <span className="text-[#5F6368] font-semibold text-[10px] shrink-0 ml-4">15 menit yang lalu</span>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg flex justify-between items-center text-xs hover:bg-white/70 transition-colors">
            <span className="font-bold text-[#202124]">Materi "Pengenalan Database" diunggah untuk Kelas 11 RPL</span>
            <span className="text-[#5F6368] font-semibold text-[10px] shrink-0 ml-4">1 jam yang lalu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
