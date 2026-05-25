import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiUpload, FiPlus } from 'react-icons/fi';

export default function ImporMassal() {
  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [classIdInput, setClassIdInput] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classIdInput) {
      fetchAvailableStudents(classIdInput);
    } else {
      setStudentsList([]);
    }
    setSelectedStudentIds([]);
    setLastSelectedIndex(null);
  }, [classIdInput]);

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

  const filteredStudents = studentsList.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCheckboxToggle = (studentId, currentIndex, e) => {
    if (e && e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeIds = filteredStudents.slice(start, end + 1).map(s => s.id);
      
      setSelectedStudentIds(prev => {
        const wasSelected = prev.includes(studentId);
        if (wasSelected) {
          return prev.filter(id => !rangeIds.includes(id));
        } else {
          return Array.from(new Set([...prev, ...rangeIds]));
        }
      });
    } else {
      setSelectedStudentIds(prev => 
        prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
      );
      setLastSelectedIndex(currentIndex);
    }
  };

  const handleSelectAllToggle = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    const allFilteredSelected = filteredIds.every(id => selectedStudentIds.includes(id));

    if (allFilteredSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => [...prev, ...filteredIds.filter(id => !prev.includes(id))]);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedStudentIds.length === 0 || !classIdInput) return;
    setSubmitLoading(true);
    const token = localStorage.getItem('token');
    try {
      const selectedClass = classesList.find(c => c.id.toString() === classIdInput);
      const className = selectedClass ? selectedClass.class_name : 'kelas target';
      await axios.post('http://localhost:8080/api/admin/enroll-bulk', {
        class_id: parseInt(classIdInput, 10),
        student_ids: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedStudentIds([]);
      setSearchTerm('');
      
      Swal.fire({
        title: 'Berhasil!',
        text: `Berhasil mendaftarkan siswa ke ${className}.`,
        icon: 'success',
        confirmButtonColor: '#4318FF'
      });
      fetchAvailableStudents(classIdInput);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal!',
        text: err.response?.data?.error || 'Gagal mendaftarkan siswa secara massal.',
        icon: 'error',
        confirmButtonColor: '#4318FF'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Impor Massal (Bulk Enroll)
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Daftarkan banyak siswa sekaligus ke dalam kelas tertentu dengan cepat dalam satu transaksi terintegrasi.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
            <h3 className="text-md font-extrabold text-[#1B254B]">Target Kelas</h3>
            <div className="space-y-2">
              <select
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200 rounded-xl text-[#1B254B] font-semibold cursor-pointer"
                value={classIdInput}
                onChange={(e) => setClassIdInput(e.target.value)}
              >
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id.toString()}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-[#4318FF]/5 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Jumlah Siswa Terpilih</div>
              <div className="text-2xl font-black text-[#4318FF]">{selectedStudentIds.length} Siswa</div>
            </div>
            <button
              onClick={handleBulkEnroll}
              disabled={selectedStudentIds.length === 0 || !classIdInput || submitLoading}
              className="w-full bg-[#4318FF] hover:bg-[#3311CC] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              Impor Sekarang
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full px-4 py-3 bg-[#F4F7FE]/80 border border-slate-200 rounded-2xl text-[#1B254B]"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Memuat...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Tidak ada data siswa ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                    <th className="px-4 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && filteredStudents.map(s => s.id).every(id => selectedStudentIds.includes(id))}
                        onChange={handleSelectAllToggle}
                        className="cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-4">NIS</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, index) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <tr 
                        key={student.id}
                        onClick={(e) => handleCheckboxToggle(student.id, index, e)}
                        className={`hover:bg-[#F4F7FE]/40 transition-colors cursor-pointer ${isSelected ? 'bg-[#4318FF]/5' : ''}`}
                      >
                        <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleCheckboxToggle(student.id, index, e)}
                            className="cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs">{student.nis || '-'}</td>
                        <td className="px-6 py-3.5 font-semibold">{student.name}</td>
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
  );
}
