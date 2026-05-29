import { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiSearch } from 'react-icons/fi';
import axios from 'axios';

export default function LaporanAkademik() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/admin/academic-reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) {
        setReports(res.data);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch academic reports:", err);
      setIsLoading(false);
    });
  }, []);

  // Filter reports by search query
  const filteredReports = reports.filter(report => {
    const nameMatch = report.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const nisMatch = report.nis?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const classMatch = report.class?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return nameMatch || nisMatch || classMatch;
  });

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Laporan Akademik Siswa
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Pantau status penerbitan rapor, kumpulkan transkrip nilai semesteran, dan unduh laporan akhir siswa secara massal.
        </p>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiFileText className="text-[#4318FF] w-5 h-5" />
            Status Penerbitan Rapor Digital
          </h3>
          <div className="flex items-center gap-2 bg-[#F4F7FE] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Cari nama atau NIS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none" 
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400 font-semibold">
            Memuat data laporan akademik...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">NIS & Nama</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Status Rapor</th>
                  <th className="px-6 py-4 text-center">Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => (
                    <tr key={report.id || index} className="hover:bg-[#F4F7FE]/40 transition-colors">
                      <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1B254B]">{report.name}</div>
                        <div className="text-xs text-slate-400 font-mono">NIS: {report.nis || '-'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-xs text-[#4318FF]">{report.class || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold text-xs">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                          report.status === 'Rapor Selesai'
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                            : 'text-amber-600 bg-amber-50 border-amber-200'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center gap-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer">
                          <FiDownload /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      Tidak ada data laporan akademik yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
