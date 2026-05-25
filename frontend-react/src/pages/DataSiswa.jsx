import { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div className="w-full bg-[#F8FAFC] space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B254B]">
            Direktori Data Siswa
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Lihat, cari, dan kelola seluruh informasi kontak dan kelas siswa di platform EduCentralHub.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-[#1B254B] bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100/80 rounded-3xl shadow-xl shadow-slate-100/50 p-6 md:p-8 space-y-6">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE]/80 border border-slate-200/70 rounded-2xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/10 focus:border-[#4318FF] transition-all text-sm"
              placeholder="Cari siswa berdasarkan Nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs font-bold text-slate-400 shrink-0 bg-[#F4F7FE] px-4 py-2.5 rounded-xl border border-slate-100">
            Total Siswa: <span className="text-[#4318FF]">{filteredStudents.length}</span>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="animate-spin h-8 w-8 text-[#4318FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-400 text-sm font-semibold">Mengambil data direktori...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
            Tidak ada data siswa ditemukan yang cocok dengan kriteria pencarian Anda.
          </div>
        ) : (
          /* Modern Minimalist Table */
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">No. WhatsApp</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-[#F4F7FE]/40 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 text-slate-500 font-semibold font-mono text-xs">
                      {student.nis || '-'}
                    </td>
                    <td className="px-6 py-4 text-[#1B254B] font-semibold text-sm">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      {student.class ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#4318FF] bg-[#4318FF]/10 rounded-full border border-[#4318FF]/5">
                          {student.class.class_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-200/50">
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
                          className="text-[#1B254B] hover:text-[#4318FF] hover:underline flex items-center gap-1.5 font-medium transition-colors"
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
                          className="text-slate-500 hover:text-[#4318FF] hover:underline font-medium transition-colors"
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
