import { useState, useEffect, useRef } from 'react';
import { FiTrendingUp, FiAward, FiPieChart, FiActivity } from 'react-icons/fi';

export default function ReportAnalytics() {
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  const [averagesData, setAveragesData] = useState([]);
  
  // Active chart instances to destroy on re-render/cleanup
  const activeCharts = useRef({ bar: null, line: null });

  useEffect(() => {
    // 1. Fetch scores data from localStorage
    const savedAverage = localStorage.getItem('class_grades_average');
    const defaultAverage = [
      { classCode: 'MAT-7A', task: 'Kuis Aljabar Dasar', avgScore: 82, count: 5 },
      { classCode: 'MAT-7A', task: 'Ujian Tengah Semester', avgScore: 78, count: 5 },
      { classCode: 'FIS-8B', task: 'Tugas Termodinamika', avgScore: 88, count: 3 },
      { classCode: 'FIS-8B', task: 'Kuis Suhu & Kalor', avgScore: 85, count: 3 }
    ];

    let dataToUse = defaultAverage;
    if (savedAverage) {
      dataToUse = JSON.parse(savedAverage);
    } else {
      localStorage.setItem('class_grades_average', JSON.stringify(defaultAverage));
    }
    setAveragesData(dataToUse);

    // 2. Dynamically load Chart.js CDN to be bulletproof in React 19
    if (window.Chart) {
      setChartJsLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      script.onload = () => setChartJsLoaded(true);
      document.body.appendChild(script);

      return () => {
        // Cleanup script if component unmounts before loading
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!chartJsLoaded || averagesData.length === 0 || !window.Chart) return;

    // Destroy existing charts to prevent canvas reuse errors
    if (activeCharts.current.bar) activeCharts.current.bar.destroy();
    if (activeCharts.current.line) activeCharts.current.line.destroy();

    // Prepare chart datasets
    const classes = [...new Set(averagesData.map(d => d.classCode))];
    const averagesByClass = classes.map(c => {
      const classEntries = averagesData.filter(d => d.classCode === c);
      const sum = classEntries.reduce((acc, curr) => acc + curr.avgScore, 0);
      return Math.round(sum / classEntries.length);
    });

    const tasks = averagesData.map(d => `${d.classCode} - ${d.task.substring(0, 15)}...`);
    const scores = averagesData.map(d => d.avgScore);

    const ChartClass = window.Chart;

    // 1. Render Bar Chart: Class Performance Averages
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      activeCharts.current.bar = new ChartClass(ctx, {
        type: 'bar',
        data: {
          labels: classes,
          datasets: [{
            label: 'Rata-Rata Nilai Kelas',
            data: averagesByClass,
            backgroundColor: 'rgba(26, 115, 232, 0.85)',
            borderColor: '#1A73E8',
            borderWidth: 1.5,
            borderRadius: 6,
            barThickness: 24,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              backgroundColor: '#202124',
              titleFont: { size: 12, weight: 'bold' },
              bodyFont: { size: 12 },
              cornerRadius: 6,
            }
          },
          scales: {
            y: {
              min: 0,
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
    }

    // 2. Render Line Chart: Task Average Distribution
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext('2d');
      activeCharts.current.line = new ChartClass(ctx, {
        type: 'line',
        data: {
          labels: tasks,
          datasets: [{
            label: 'Rata-Rata Skor',
            data: scores,
            fill: true,
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
            borderColor: '#1A73E8',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: '#1A73E8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              backgroundColor: '#202124',
              cornerRadius: 6,
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: '#E5E7EB' },
              ticks: { color: '#5F6368', font: { weight: 'bold', size: 10 } }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#5F6368', font: { weight: 'bold', size: 8 } }
            }
          }
        }
      });
    }

    return () => {
      if (activeCharts.current.bar) activeCharts.current.bar.destroy();
      if (activeCharts.current.line) activeCharts.current.line.destroy();
    };
  }, [chartJsLoaded, averagesData]);

  // General Statistics Computation
  const overallAvg = averagesData.length > 0 
    ? Math.round(averagesData.reduce((acc, curr) => acc + curr.avgScore, 0) / averagesData.length)
    : 0;

  const highestScore = averagesData.length > 0
    ? Math.max(...averagesData.map(d => d.avgScore))
    : 0;

  return (
    <div className="space-y-6 text-left pb-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">
            <FiTrendingUp />
          </div>
          <div>
            <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Rata-Rata Nilai</span>
            <span className="text-2xl font-bold text-[#202124]">{overallAvg} / 100</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
            <FiAward />
          </div>
          <div>
            <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Nilai Rata-Rata Tertinggi</span>
            <span className="text-2xl font-bold text-[#202124]">{highestScore} / 100</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold shrink-0">
            <FiPieChart />
          </div>
          <div>
            <span className="text-xs text-[#5F6368] block font-semibold uppercase tracking-wider">Persentase Ketuntasan</span>
            <span className="text-2xl font-bold text-[#202124]">92%</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Averages Bar Chart */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
            <FiActivity className="text-[#1A73E8]" /> Rata-Rata Performa Nilai per Kelas
          </h3>
          
          <div className="h-64 relative flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4">
            {!chartJsLoaded ? (
              <span className="text-xs text-[#5F6368]">Memuat Chart.js Engine...</span>
            ) : (
              <canvas ref={barChartRef} />
            )}
          </div>
        </div>

        {/* Quiz Distribution Line Chart */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
            <FiActivity className="text-emerald-600" /> Distribusi Nilai per Topik Tugas
          </h3>
          
          <div className="h-64 relative flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4">
            {!chartJsLoaded ? (
              <span className="text-xs text-[#5F6368]">Memuat Chart.js Engine...</span>
            ) : (
              <canvas ref={lineChartRef} />
            )}
          </div>
        </div>
      </div>

      {/* Grades Summary Table */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
        <h3 className="text-md font-bold text-[#202124]">Ringkasan Statistik Penilaian Tugas</h3>
        
        {averagesData.length === 0 ? (
          <p className="text-xs text-[#5F6368]">Belum ada data evaluasi yang terdaftar.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Nama Kelas</th>
                  <th className="px-6 py-4">Topik Evaluasi</th>
                  <th className="px-6 py-4 text-center">Jumlah Penilai</th>
                  <th className="px-6 py-4 text-center">Rata-Rata Nilai</th>
                  <th className="px-6 py-4 text-center">Status Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {averagesData.map((d, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-[#202124]">{d.classCode}</td>
                    <td className="px-6 py-4 font-semibold text-[#5F6368]">{d.task}</td>
                    <td className="px-6 py-4 text-center text-[#5F6368]">{d.count} Siswa</td>
                    <td className="px-6 py-4 text-center font-semibold text-[#1A73E8]">{d.avgScore} / 100</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-md ${
                        d.avgScore >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {d.avgScore >= 75 ? 'TUNTAS' : 'REMEDIAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
