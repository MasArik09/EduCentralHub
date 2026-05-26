import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw } from 'react-icons/fi';

export default function DataSiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err.response?.data?.error || err.message || 'Gagal memuat data siswa.');
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search term (NIS or Name)
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6 bg-transparent">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#202124]">
            Direktori Data Siswa
          </h2>
          <p className="text-[#5F6368] text-xs mt-1">
            Lihat, cari, dan kelola seluruh informasi kontak dan kelas siswa di platform EduCentralHub.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-[#202124] border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-none transition-colors duration-150"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 text-[#5F6368] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-6 shadow-none">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5F6368]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/10 focus:border-[#1A73E8] transition-colors text-sm"
              placeholder="Cari siswa berdasarkan Nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs font-semibold text-[#5F6368] shrink-0 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
            Total Siswa: <span className="text-[#1A73E8] font-bold">{filteredStudents.length}</span>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="animate-spin h-8 w-8 text-[#1A73E8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[#5F6368] text-sm font-semibold">Mengambil data direktori...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-[#5F6368] text-sm border border-dashed border-gray-200 rounded-lg">
            Tidak ada data siswa ditemukan yang cocok dengan kriteria pencarian Anda.
          </div>
        ) : (
          /* Modern Minimalist Table */
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider w-12 text-center">No.</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">No. WhatsApp</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 text-gray-400 font-medium text-center text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-[#5F6368] font-semibold font-mono text-xs">
                      {student.nis || '-'}
                    </td>
                    <td className="px-6 py-4 text-[#202124] font-semibold text-sm">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      {student.class ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#1A73E8] bg-blue-50/70 rounded-md border border-blue-200/50">
                          {student.class.class_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50/70 rounded-md border border-amber-200/50">
                          Belum Ada Kelas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.whatsapp ? (
                        <a 
                          href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#202124] hover:text-[#1A73E8] hover:underline flex items-center gap-1.5 font-medium transition-colors duration-150"
                        >
                          🟢 {student.whatsapp}
                        </a>
                      ) : (
                        <span className="italic text-slate-400 font-light">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.email ? (
                        <a 
                          href={`mailto:${student.email}`}
                          className="text-[#5F6368] hover:text-[#1A73E8] hover:underline font-medium transition-colors duration-150"
                        >
                          {student.email}
                        </a>
                      ) : (
                        <span className="italic text-slate-400 font-light">-</span>
                      )}
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
