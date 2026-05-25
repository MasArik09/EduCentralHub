import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiUser } from 'react-icons/fi';

export default function KelolaUser() {
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

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6 bg-transparent text-left">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B254B]">
            Kelola User & Direktori Siswa
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Lihat, cari, dan kelola seluruh informasi kontak dan kelas siswa di platform EduCentralHub.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-[#1B254B] border border-[#E0E5F2] hover:bg-gray-50/80 px-4 py-2.5 rounded-xl text-xs font-bold shadow-[0_2px_12px_0_rgba(112,144,176,0.06)] transition-all duration-200 cursor-pointer"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
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
          <div className="text-center py-20 text-slate-400">Mengambil data direktori...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Tidak ada data siswa ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">NIS</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">No. WhatsApp</th>
                  <th className="px-6 py-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 text-slate-500 font-semibold font-mono text-xs">{student.nis || '-'}</td>
                    <td className="px-6 py-4 text-[#1B254B] font-semibold text-sm">{student.name}</td>
                    <td className="px-6 py-4">
                      {student.class ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#4318FF] bg-[#4318FF]/10 rounded-full">
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
                        <a href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#1B254B] hover:text-[#4318FF] hover:underline font-medium">
                          🟢 {student.whatsapp}
                        </a>
                      ) : (
                        <span className="italic text-slate-400 font-light">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.email ? (
                        <a href={`mailto:${student.email}`} className="text-slate-500 hover:text-[#4318FF] hover:underline font-medium">
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
