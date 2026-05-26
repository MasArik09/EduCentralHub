import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FiUsers, FiAward, FiLayers, FiActivity, FiShield, FiFileText, FiGrid, FiCalendar, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';

export default function DashboardHome() {
  const { user, role } = useOutletContext();
  const navigate = useNavigate();

  // Dashboard Realy-time Data States
  const [stats, setStats] = useState({
    total_students: 1248,
    total_teachers: 84,
    total_classes: 36,
    attendance_today: 96.4
  });
  const [attendanceChartData, setAttendanceChartData] = useState([95.2, 96.8, 94.5, 97.1, 96.4, 95.8]);
  const [activityLogs, setActivityLogs] = useState([
    { user: 'admin@educentral.com', action: 'Mengimpor 45 siswa baru via CSV', time: '2 menit yang lalu' },
    { user: 'guru@educentral.com', action: 'Mengunggah modul ajar aljabar', time: '15 menit yang lalu' },
    { user: 'admin@educentral.com', action: 'Mengubah kapasitas kelas VII-A', time: '1 jam yang lalu' },
    { user: 'siswa@educentral.com', action: 'Menyelesaikan Kuis Aljabar Dasar', time: '2 jam yang lalu' }
  ]);

  // Chart States
  const chartRef = useRef(null);
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  const chartInstance = useRef(null);

  // Fetch Dashboard Stats from Go Backend
  useEffect(() => {
    if (role !== 'admin') return;

    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) {
        setStats({
          total_students: res.data.total_students,
          total_teachers: res.data.total_teachers,
          total_classes: res.data.total_classes,
          attendance_today: res.data.attendance_today
        });
        if (res.data.attendance_chart) {
          setAttendanceChartData(res.data.attendance_chart);
        }
        if (res.data.activity_logs) {
          setActivityLogs(res.data.activity_logs);
        }
      }
    })
    .catch(err => {
      console.error("Failed to fetch dashboard stats from backend Go:", err);
    });
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') return;

    // Load Chart.js CDN dynamically to be robust under React 19
    if (window.Chart) {
      setChartJsLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      script.onload = () => setChartJsLoaded(true);
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'admin' || !chartJsLoaded || !window.Chart || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        datasets: [
          {
            label: 'Persentase Presensi (%)',
            data: attendanceChartData,
            borderColor: '#1A73E8',
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#1A73E8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 12,
            backgroundColor: '#202124',
            titleFont: { size: 11, weight: 'bold' },
            bodyFont: { size: 11 },
            cornerRadius: 6,
          }
        },
        scales: {
          y: {
            min: 85,
            max: 100,
            grid: { color: '#E5E7EB' },
            ticks: { color: '#5F6368', font: { weight: 'bold', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#5F6368', font: { weight: 'bold', size: 10 } }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartJsLoaded, role, attendanceChartData]);

  const renderRoleContent = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="space-y-6 text-left">
            {/* 1. TOP STATS CARDS GRID (4 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white/70 backdrop-blur-md p-5 border border-white/20 rounded-lg flex items-center gap-4 shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">
                  <FiUsers />
                </div>
                <div>
                  <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Total Siswa</span>
                  <span className="text-xl font-bold text-[#202124]">{stats.total_students.toLocaleString()} Siswa</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 border border-white/20 rounded-lg flex items-center gap-4 shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
                  <FiAward />
                </div>
                <div>
                  <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Total Guru</span>
                  <span className="text-xl font-bold text-[#202124]">{stats.total_teachers} Guru</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 border border-white/20 rounded-lg flex items-center gap-4 shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
                  <FiLayers />
                </div>
                <div>
                  <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Total Kelas</span>
                  <span className="text-xl font-bold text-[#202124]">{stats.total_classes} Rombel</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-5 border border-white/20 rounded-lg flex items-center gap-4 shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
                <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold shrink-0">
                  <FiActivity />
                </div>
                <div>
                  <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Kehadiran Hari Ini</span>
                  <span className="text-xl font-bold text-[#202124]">{stats.attendance_today}%</span>
                </div>
              </div>
            </div>

            {/* 2. DUAL-COLUMN GRAPH & LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (2/3 width): Kehadiran Chart */}
              <div className="bg-white/70 backdrop-blur-md p-6 border border-white/20 rounded-lg shadow-sm lg:col-span-8 space-y-4">
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
                  <FiActivity className="text-[#1A73E8]" /> Tren Kehadiran & Partisipasi Belajar (Minggu Ini)
                </h3>
                <div className="h-64 relative flex items-center justify-center bg-[#F8F9FA]/40 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  {!chartJsLoaded ? (
                    <span className="text-xs text-[#5F6368]">Memuat Chart Engine...</span>
                  ) : (
                    <canvas ref={chartRef} />
                  )}
                </div>
              </div>

              {/* Right Column (1/3 width): Audit Logs */}
              <div className="bg-white/70 backdrop-blur-md p-6 border border-white/20 rounded-lg shadow-sm lg:col-span-4 space-y-4 flex flex-col h-full">
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
                  <FiShield className="text-emerald-600" /> Log Aktivitas Terbaru
                </h3>
                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-64 lg:max-h-[250px] pr-1 scrollbar-thin">
                  {activityLogs.map((log, idx) => (
                    <div key={idx} className="text-xs border-b border-gray-100 pb-2.5 last:border-none">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-semibold text-[#202124] truncate">{log.user}</span>
                        <span className="text-[10px] text-[#5F6368] shrink-0">{log.time}</span>
                      </div>
                      <p className="text-[#5F6368] mt-0.5 line-clamp-1">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. QUICK ACTIONS SECTION */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">Aksi Cepat Dasbor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/dashboard/admin/impor-massal')}
                  className="px-4 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg font-semibold shadow-none cursor-pointer text-sm flex items-center justify-between border-none transition-colors duration-150"
                >
                  <span className="flex items-center gap-2"><FiFileText /> Impor Massal User (CSV)</span>
                  <FiArrowRight />
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/kurikulum')}
                  className="px-4 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg font-semibold shadow-none cursor-pointer text-sm flex items-center justify-between border-none transition-colors duration-150"
                >
                  <span className="flex items-center gap-2"><FiGrid /> Atur Kurikulum & Mapel</span>
                  <FiArrowRight />
                </button>
                <button
                  onClick={() => navigate('/dashboard/admin/kalender')}
                  className="px-4 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg font-semibold shadow-none cursor-pointer text-sm flex items-center justify-between border-none transition-colors duration-150"
                >
                  <span className="flex items-center gap-2"><FiCalendar /> Buka Kalender Akademik</span>
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
              <div className="w-12 h-12 rounded-lg bg-gray-50 text-[#1A73E8] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#202124] mb-2">Upload Materi</h3>
              <p className="text-[#5F6368] text-sm mb-4">Unggah dokumen materi ajar, video rekaman pembelajaran, e-book, atau referensi studi mahasiswa.</p>
              <button 
                onClick={() => navigate('/dashboard/teacher/content?tab=materi')}
                className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer border-none"
              >
                Unggah Berkas
              </button>
            </div>
            <div className="p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#202124] mb-2">Buat Kuis</h3>
              <p className="text-[#5F6368] text-sm mb-4">Buat latihan soal, kuis pilihan ganda, esai singkat, ujian tengah semester, dan kelola bobot nilai kuis.</p>
              <button 
                onClick={() => navigate('/dashboard/teacher/content?tab=kuis')}
                className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer border-none"
              >
                Buat Kuis Baru
              </button>
            </div>
          </div>
        );
      case 'student':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
              <div className="w-12 h-12 rounded-lg bg-gray-50 text-[#1A73E8] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#202124] mb-2">Lihat Materi</h3>
              <p className="text-[#5F6368] text-xs mb-4">Pelajari modul ajar aktif, tonton video pembelajaran mandiri, dan unduh slide presentasi mata kuliah.</p>
              <button className="px-3.5 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer border-none">Buka Materi</button>
            </div>
            <div className="p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
              <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#202124] mb-2">Kerjakan Kuis</h3>
              <p className="text-[#5F6368] text-xs mb-4">Selesaikan tugas mingguan yang sedang aktif, ikuti kuis latihan, dan tinjau riwayat pengerjaan Anda.</p>
              <button className="px-3.5 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer border-none">Mulai Kuis</button>
            </div>
            <div className="p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg shadow-sm hover:bg-white/90 hover:border-white/30 transition-all duration-150">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#202124] mb-2">Unduh Rapor</h3>
              <p className="text-[#5F6368] text-xs mb-4">Akses transkrip nilai akademik lengkap semester ini, cetak rapor digital, dan lihat grafik perkembangan IPK.</p>
              <button className="px-3.5 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer border-none">Unduh PDF</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="p-8 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg relative overflow-hidden text-left shadow-sm">
        <div className="relative space-y-2 max-w-lg z-10">
          <span className="text-xs font-bold text-[#1A73E8] uppercase tracking-widest">Workspace</span>
          <h2 className="text-3xl font-extrabold text-[#202124]">
            Halo, {user?.name || 'User'}!
          </h2>
          <p className="text-[#5F6368] text-sm leading-relaxed">
            Selamat datang kembali di dashboard utama EduCentralHub. Di sini Anda dapat memantau seluruh proses belajar-mengajar Anda. Menu di samping telah disesuaikan berdasarkan peran Anda sebagai <strong className="text-[#1A73E8] capitalize">{role}</strong>.
          </p>
        </div>
      </div>

      {/* Dynamic Role-specific Action Panels */}
      <div className="text-left">
        <h3 className="text-lg font-bold text-[#202124] mb-4">Dasbor Utama</h3>
        {renderRoleContent()}
      </div>
    </div>
  );
}
