import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EnrollSiswa() {
  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [classIdInput, setClassIdInput] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initial load: fetch classes list
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch available students when class ID selection changes
  useEffect(() => {
    if (classIdInput) {
      fetchAvailableStudents(classIdInput);
    } else {
      setStudentsList([]);
    }
    // Clear selection when class changes
    setSelectedStudentIds([]);
    setLastSelectedIndex(null);
  }, [classIdInput]);

  // Reset range selection anchor when search term changes
  useEffect(() => {
    setLastSelectedIndex(null);
  }, [searchTerm]);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classes = res.data || [];
      setClassesList(classes);
      
      if (classes.length > 0) {
        setClassIdInput(classes[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Gagal memuat daftar kelas.');
    }
  };

  const fetchAvailableStudents = async (classId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/available-students?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentsList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch available students:', err);
      setError('Gagal memuat daftar siswa yang belum terdaftar.');
      setStudentsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term (name or NIS)
  const filteredStudents = studentsList.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle checkbox selection (supports Shift-Click Range Selection)
  const handleCheckboxToggle = (studentId, currentIndex, e) => {
    if (e && e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const rangeIds = filteredStudents.slice(start, end + 1).map(s => s.id);
      
      setSelectedStudentIds(prev => {
        const wasSelected = prev.includes(studentId);
        if (wasSelected) {
          // Unselect all in range
          return prev.filter(id => !rangeIds.includes(id));
        } else {
          // Select all in range (union)
          return Array.from(new Set([...prev, ...rangeIds]));
        }
      });
    } else {
      // Normal single toggle
      setSelectedStudentIds(prev => 
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
      // Record this index as the last selected index anchor
      setLastSelectedIndex(currentIndex);
    }
  };

  // Toggle Master Select All checkbox (only affects currently filtered students)
  const handleSelectAllToggle = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    const allFilteredSelected = filteredIds.every(id => selectedStudentIds.includes(id));

    if (allFilteredSelected) {
      // Unselect all currently filtered
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all currently filtered (add missing ones)
      setSelectedStudentIds(prev => {
        const toAdd = filteredIds.filter(id => !prev.includes(id));
        return [...prev, ...toAdd];
      });
    }
  };

  // Submit Handler: Bulk Enroll
  const handleBulkEnroll = async () => {
    if (selectedStudentIds.length === 0 || !classIdInput) return;

    setSubmitLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');

    try {
      const selectedClass = classesList.find(c => c.id.toString() === classIdInput);
      const className = selectedClass ? selectedClass.class_name : 'kelas target';

      const response = await axios.post('http://localhost:8080/api/admin/enroll-bulk', {
        class_id: parseInt(classIdInput, 10),
        student_ids: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear selection array
      const enrolledCount = selectedStudentIds.length;
      setSelectedStudentIds([]);
      setSearchTerm('');

      // Show high premium light themed SweetAlert2 success message
      Swal.fire({
        title: 'Berhasil!',
        text: response.data?.message || `Berhasil mendaftarkan ${enrolledCount} siswa ke dalam ${className}.`,
        icon: 'success',
        background: '#FFFFFF',
        color: '#1B254B',
        confirmButtonColor: '#4318FF',
        confirmButtonText: 'Mantap',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md'
        }
      });

      // Refresh available students list
      fetchAvailableStudents(classIdInput);
    } catch (err) {
      console.error('Failed bulk enrollment:', err);
      const errMsg = err.response?.data?.error || err.message || 'Gagal melakukan pendaftaran massal.';
      setError(errMsg);
      
      Swal.fire({
        title: 'Gagal!',
        text: errMsg,
        icon: 'error',
        background: '#FFFFFF',
        color: '#1B254B',
        confirmButtonColor: '#4318FF',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md'
        }
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] space-y-6">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5 text-left">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Pendaftaran Siswa Massal (Bulk Enroll)
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Daftarkan banyak siswa sekaligus ke dalam kelas tertentu dengan cepat dalam satu transaksi terintegrasi.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Class Target & Action (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 space-y-6 text-left">
            <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4318FF]"></span>
              Konfigurasi Kelas
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kelas Target
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] font-semibold focus:outline-none focus:border-[#4318FF] transition-all duration-200 cursor-pointer bg-white"
                value={classIdInput}
                onChange={(e) => setClassIdInput(e.target.value)}
              >
                <option value="" disabled>-- Pilih Kelas --</option>
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id.toString()}>
                    {cls.class_name} (Siswa: {cls.max_students})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Count Indicator */}
            <div className="bg-[#4318FF]/5 border border-[#4318FF]/10 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Jumlah Siswa Terpilih</div>
              <div className="text-2xl font-black text-[#4318FF]">{selectedStudentIds.length} Siswa</div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Pastikan kapasitas kelas mencukupi sebelum memproses pendaftaran massal ini.
              </p>
            </div>

            <button
              onClick={handleBulkEnroll}
              disabled={selectedStudentIds.length === 0 || !classIdInput || submitLoading}
              className="w-full bg-[#4318FF] hover:bg-[#3311CC] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#4318FF]/15 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Masukkan {selectedStudentIds.length} Siswa ke Kelas</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Student List & Checkboxes (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 md:p-8 space-y-6 text-left">
            <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Siswa yang Tersedia
            </h3>

            {/* Live Search Bar */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                disabled={classesList.length === 0 || !classIdInput}
                className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE]/80 border border-slate-200/70 rounded-2xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/10 focus:border-[#4318FF] transition-all text-sm disabled:opacity-50"
                placeholder="Cari siswa berdasarkan Nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* List / Table of Available Students */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <svg className="animate-spin h-8 w-8 text-[#4318FF]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-slate-400 text-sm font-semibold">Memuat siswa yang tersedia...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                {!classIdInput 
                  ? "Pilih kelas target di panel kiri terlebih dahulu." 
                  : "Semua siswa telah terdaftar atau tidak ada siswa yang cocok."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                      <th className="px-4 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                          checked={
                            filteredStudents.length > 0 && 
                            filteredStudents.map(s => s.id).every(id => selectedStudentIds.includes(id))
                          }
                          onChange={handleSelectAllToggle}
                        />
                      </th>
                      <th className="px-4 py-4 text-xs uppercase tracking-wider">NIS</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider">Nama Lengkap</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <tr 
                          key={student.id}
                          onClick={(e) => handleCheckboxToggle(student.id, index, e)}
                          className={`hover:bg-[#F4F7FE]/40 transition-colors duration-150 cursor-pointer ${
                            isSelected ? 'bg-[#4318FF]/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                              checked={isSelected}
                              onChange={(e) => handleCheckboxToggle(student.id, index, e)}
                            />
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 font-semibold font-mono text-xs">
                            {student.nis || '-'}
                          </td>
                          <td className="px-6 py-3.5 text-[#1B254B] font-semibold text-sm">
                            {student.name}
                          </td>
                          <td className="px-6 py-3.5 text-slate-400 text-xs font-medium">
                            {student.email || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
