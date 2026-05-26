import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const DUMMY_TEACHERS = [
  { id: 1, name: 'Budi Santoso, S.Pd.' },
  { id: 2, name: 'Siti Rahma, M.Pd.' },
  { id: 3, name: 'Ahmad Fauzi, S.Si.' },
  { id: 4, name: 'Dewi Lestari, M.Si.' },
  { id: 5, name: 'Rian Hidayat, S.Kom.' }
];

const getWaliKelas = (teacherId) => {
  const teacher = DUMMY_TEACHERS.find((t) => t.id === teacherId);
  return teacher ? teacher.name : 'Belum Ditentukan';
};

export default function KelolaKelasRombel() {
  const { role } = useOutletContext();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  // Form states for Manage Class
  const [classNameInput, setClassNameInput] = useState('');
  const [maxStudentsInput, setMaxStudentsInput] = useState(36);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [classLoading, setClassLoading] = useState(false);
  const [classSuccess, setClassSuccess] = useState('');
  const [classError, setClassError] = useState('');

  // States for dropdown list data
  const [classesList, setClassesList] = useState([]);

  // States for class details modal
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // States for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkMoveDestClassId, setBulkMoveDestClassId] = useState('');
  const [showBulkMoveDropdown, setShowBulkMoveDropdown] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const classesRes = await axios.get('http://localhost:8080/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classes = classesRes.data || [];

      // Fetch details in parallel to get student occupancy dynamically
      const enrichedClasses = await Promise.all(
        classes.map(async (cls) => {
          try {
            const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${cls.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return {
              ...cls,
              studentCount: detailRes.data?.students ? detailRes.data.students.length : 0,
              students: detailRes.data?.students || []
            };
          } catch (e) {
            console.error(`Failed to fetch detail for class ${cls.id}:`, e);
            return { ...cls, studentCount: 0, students: [] };
          }
        })
      );

      setClassesList(enrichedClasses);
      return enrichedClasses;
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      return [];
    }
  };

  // Fetch classes on mount
  useEffect(() => {
    if (role === 'admin') {
      fetchClasses();
    }
  }, [role]);

  // Submit Handler: Create Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setClassError('');
    setClassSuccess('');
    setClassLoading(true);

    if (!homeroomTeacherId) {
      setClassError('Silakan pilih Wali Kelas terlebih dahulu.');
      setClassLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/admin/class', {
        class_name: classNameInput,
        max_students: parseInt(maxStudentsInput, 10),
        max_teachers: parseInt(homeroomTeacherId, 10),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setClassSuccess(`Kelas "${classNameInput}" berhasil disimpan!`);
      setClassNameInput('');
      setMaxStudentsInput(36);
      setHomeroomTeacherId('');
      fetchClasses();
    } catch (err) {
      console.error(err);
      setClassError(err.response?.data?.error || err.message || 'Gagal menyimpan kelas.');
    } finally {
      setClassLoading(false);
    }
  };

  // Delete Handler: Delete Class
  const handleDeleteClass = async (classId) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Kelas yang dihapus tidak dapat dipulihkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4318FF',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#FFFFFF',
      color: '#1B254B'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setClassError('');
        setClassSuccess('');
        const token = localStorage.getItem('token');
        try {
          await axios.delete(`http://localhost:8080/api/admin/class/${classId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          Swal.fire({
            title: 'Berhasil!',
            text: 'Kelas berhasil dihapus.',
            icon: 'success',
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
          fetchClasses();
        } catch (err) {
          console.error('Failed to delete class:', err);
          Swal.fire({
            title: 'Gagal!',
            text: err.response?.data?.error || err.message || 'Gagal menghapus kelas.',
            icon: 'error',
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
        }
      }
    });
  };

  // View Detail Handler: Fetch Class Detail including Students & Teachers
  const handleViewDetail = async (classId) => {
    setClassError('');
    setClassSuccess('');
    setSelectedUserIds([]); 
    setShowBulkMoveDropdown(false);
    setBulkMoveDestClassId('');
    
    const token = localStorage.getItem('token');
    try {
      const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedClassDetail(detailRes.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch class detail:', err);
      setClassError(err.response?.data?.error || err.message || 'Gagal mengambil detail kelas.');
    }
  };

  const handleToggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAllStudents = (students) => {
    const studentIds = students.map((s) => s.id);
    const allSelected = studentIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !studentIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...studentIds])));
    }
  };

  const handleBulkRemove = async (classId) => {
    if (selectedUserIds.length === 0) return;
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Ingin mengeluarkan ${selectedUserIds.length} siswa terpilih dari kelas ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4318FF',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Keluarkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setBulkActionLoading(true);
        const token = localStorage.getItem('token');
        try {
          await axios.post('http://localhost:8080/api/admin/class/bulk-remove', {
            user_ids: selectedUserIds,
            class_id: parseInt(classId, 10)
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedUserIds([]);
          setShowBulkMoveDropdown(false);
          Swal.fire({
            title: 'Berhasil!',
            text: 'Siswa terpilih berhasil dikeluarkan dari kelas.',
            icon: 'success',
            confirmButtonColor: '#4318FF'
          });
          const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedClassDetail(detailRes.data);
          fetchClasses();
        } catch (err) {
          console.error(err);
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  const handleBulkMove = async (fromClassId) => {
    if (selectedUserIds.length === 0 || !bulkMoveDestClassId) return;
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Ingin memindahkan ${selectedUserIds.length} siswa terpilih ke kelas baru?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4318FF',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Pindahkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setBulkActionLoading(true);
        const token = localStorage.getItem('token');
        try {
          await axios.post('http://localhost:8080/api/admin/class/bulk-move', {
            user_ids: selectedUserIds,
            from_class_id: parseInt(fromClassId, 10),
            to_class_id: parseInt(bulkMoveDestClassId, 10)
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedUserIds([]);
          setBulkMoveDestClassId('');
          setShowBulkMoveDropdown(false);
          Swal.fire({
            title: 'Berhasil!',
            text: 'Siswa berhasil dipindahkan.',
            icon: 'success',
            confirmButtonColor: '#4318FF'
          });
          const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${fromClassId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedClassDetail(detailRes.data);
          fetchClasses();
        } catch (err) {
          console.error(err);
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-[#E9EDF7] pb-4 text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B254B]">
            Pusat Manajemen Kelas & Rombel
          </h2>
          <p className="text-slate-500 text-xs mt-1">Buat, tinjau, dan hapus kelas yang terdaftar dalam sistem EduCentralHub.</p>
        </div>
      </div>

      {classError && (
        <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#FDE8E8] text-[#E31A1A] text-sm text-left">
          <span>⚠️ {classError}</span>
        </div>
      )}

      {classSuccess && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-sm text-left">
          <span>✅ {classSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E9EDF7] rounded-2xl p-6">
            <h3 className="text-md font-bold text-[#1B254B] mb-4">Tambah Kelas Baru</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kelas</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B]"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kapasitas Siswa</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B]"
                    value={maxStudentsInput}
                    onChange={(e) => setMaxStudentsInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Wali Kelas</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B]"
                    value={homeroomTeacherId}
                    onChange={(e) => setHomeroomTeacherId(e.target.value)}
                  >
                    <option value="">Pilih Wali Kelas</option>
                    {DUMMY_TEACHERS.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={classLoading}
                className="w-full py-3 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold cursor-pointer"
              >
                {classLoading ? 'Menyimpan...' : 'Simpan Kelas'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#F8FAFC] border border-[#E9EDF7] rounded-2xl p-6">
          <h3 className="text-md font-bold text-[#1B254B] mb-4">Daftar Kelas Terdaftar</h3>
          {classesList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Belum ada data kelas.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E9EDF7]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F4F7FE] text-[#1B254B] font-semibold border-b border-[#E9EDF7]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nama Kelas</th>
                    <th className="px-4 py-3">Wali Kelas</th>
                    <th className="px-4 py-3">Okupansi Siswa</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF7]">
                  {classesList.map((cls) => (
                    <tr key={cls.id} className="hover:bg-[#F4F7FE]/50 transition-all">
                      <td className="px-4 py-3 text-[#A3AED0] font-mono">{cls.id}</td>
                      <td className="px-4 py-3 text-[#1B254B] font-medium">{cls.class_name}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{getWaliKelas(cls.max_teachers)}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        <span className="font-semibold text-[#1B254B]">{cls.studentCount || 0}</span> / {cls.max_students} Siswa
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(cls.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#4318FF] bg-[#F4F7FE] hover:bg-[#E9EDF7] rounded-lg transition-all cursor-pointer border-none"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#FFF5F5] text-[#E31A1A] hover:bg-[#FEDDCB] rounded-lg transition-all cursor-pointer border-none"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedClassDetail && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[3px] flex items-center justify-center z-50 p-4 animate-fade-in">
          {/* Outer click-to-close overlay */}
          <div 
            onClick={() => {
              setShowDetailModal(false);
              setSelectedClassDetail(null);
              setSelectedUserIds([]);
            }}
            className="absolute inset-0 cursor-pointer"
          ></div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 text-left">
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/30">
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#4318FF] uppercase tracking-widest">Detail Roster Rombel</span>
                <h3 className="text-2xl font-extrabold text-[#1B254B] mt-1">{selectedClassDetail.class.class_name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClassDetail(null);
                  setSelectedUserIds([]);
                }}
                className="p-2 text-slate-500 hover:text-[#1B254B] bg-slate-100/50 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer border-none"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1B254B] uppercase tracking-wider">Siswa Terdaftar ({selectedClassDetail.students ? selectedClassDetail.students.length : 0})</h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Wali Kelas: <span className="text-[#4318FF] font-bold">{getWaliKelas(selectedClassDetail.class.max_teachers)}</span>
                  </span>
                </div>

                {selectedUserIds.length > 0 && (
                  <div className="p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                    <span className="text-xs font-bold text-[#4318FF]">{selectedUserIds.length} Siswa Terpilih</span>
                    <button
                      onClick={() => handleBulkRemove(selectedClassDetail.class.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#FFF5F5] text-[#E31A1A] hover:bg-[#FEDDCB] rounded-lg transition-all cursor-pointer border-none"
                    >
                      Keluarkan Dari Kelas
                    </button>
                  </div>
                )}
                {!selectedClassDetail.students || selectedClassDetail.students.length === 0 ? (
                  <div className="p-4 bg-white/30 rounded-xl text-slate-500 text-sm italic border border-white/20 text-center">Belum ada siswa yang terdaftar dalam rombel ini.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/20">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-white/40 font-semibold border-b border-white/20 text-[#1B254B]">
                          <th className="px-4 py-2 w-10">
                            <input
                              type="checkbox"
                              checked={selectedClassDetail.students.length > 0 && selectedClassDetail.students.every((s) => selectedUserIds.includes(s.id))}
                              onChange={() => handleToggleSelectAllStudents(selectedClassDetail.students)}
                              className="cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-2 w-12 text-center">No.</th>
                          <th className="px-4 py-2">NIS</th>
                          <th className="px-4 py-2">Nama Lengkap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {selectedClassDetail.students.map((student, idx) => (
                          <tr key={student.id} className="hover:bg-white/40 transition-colors">
                            <td className="px-4 py-2.5">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(student.id)}
                                onChange={() => handleToggleSelectUser(student.id)}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2.5 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{student.nis || '-'}</td>
                            <td className="px-4 py-2.5 text-[#1B254B] font-medium">{student.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
