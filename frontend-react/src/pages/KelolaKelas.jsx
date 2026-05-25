import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function KelolaKelas() {
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
  const [maxTeachersInput, setMaxTeachersInput] = useState(2);
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
      setClassesList(classes);
      return classes;
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

  // Submit Handler: Kelola Kelas (Create Class)
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setClassError('');
    setClassSuccess('');
    setClassLoading(true);

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/admin/class', {
        class_name: classNameInput,
        max_students: parseInt(maxStudentsInput, 10),
        max_teachers: parseInt(maxTeachersInput, 10),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setClassSuccess(`Kelas "${classNameInput}" berhasil disimpan!`);
      setClassNameInput('');
      setMaxStudentsInput(36);
      setMaxTeachersInput(2);
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
    setSelectedUserIds([]); // Reset selections on view load
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

  // Toggle single user checkbox selection
  const handleToggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle select all student checkboxes
  const handleToggleSelectAllStudents = (students) => {
    const studentIds = students.map((s) => s.id);
    const allSelected = studentIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      // Remove all of these student IDs
      setSelectedUserIds((prev) => prev.filter((id) => !studentIds.includes(id)));
    } else {
      // Add all missing student IDs
      setSelectedUserIds((prev) => {
        const union = new Set([...prev, ...studentIds]);
        return Array.from(union);
      });
    }
  };

  // Bulk Remove selected students
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
      cancelButtonText: 'Batal',
      background: '#FFFFFF',
      color: '#1B254B'
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
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });

          // Refresh detail data
          const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedClassDetail(detailRes.data);
          fetchClasses();
        } catch (err) {
          console.error('Failed to bulk remove students:', err);
          Swal.fire({
            title: 'Gagal!',
            text: err.response?.data?.error || err.message || 'Gagal menghapus siswa secara massal.',
            icon: 'error',
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  // Bulk Move selected students to another class
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
      cancelButtonText: 'Batal',
      background: '#FFFFFF',
      color: '#1B254B'
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
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
          
          // Refresh detail data
          const detailRes = await axios.get(`http://localhost:8080/api/admin/class/${fromClassId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedClassDetail(detailRes.data);
          fetchClasses();
        } catch (err) {
          console.error('Failed to bulk move students:', err);
          Swal.fire({
            title: 'Gagal!',
            text: err.response?.data?.error || err.message || 'Gagal memindahkan siswa secara massal.',
            icon: 'error',
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
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
    <div className="w-full bg-white rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.08)] border border-[#E9EDF7] p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-[#E9EDF7] pb-4 text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B254B]">
            Pusat Manajemen Kelas
          </h2>
          <p className="text-slate-500 text-xs mt-1">Buat, tinjau, dan hapus kelas yang terdaftar dalam sistem EduCentralHub.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-[#1B254B] border border-[#E0E5F2] hover:bg-[#F4F7FE] bg-white rounded-xl transition-all cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {classError && (
        <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#FDE8E8] text-[#E31A1A] text-sm flex items-center gap-3 text-left">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{classError}</span>
        </div>
      )}

      {classSuccess && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-sm flex items-center gap-3 text-left">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{classSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Column 1: Add Class Form (lg:span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E9EDF7] rounded-2xl p-6">
            <h3 className="text-md font-bold text-[#1B254B] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4318FF]"></span>
              Tambah Kelas Baru
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:border-[#4318FF] transition-all duration-200"
                  placeholder="Contoh: Kelas 10-A IPA"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Kapasitas Siswa
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:border-[#4318FF] transition-all duration-200"
                    value={maxStudentsInput}
                    onChange={(e) => setMaxStudentsInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Kapasitas Guru
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:border-[#4318FF] transition-all duration-200"
                    value={maxTeachersInput}
                    onChange={(e) => setMaxTeachersInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={classLoading}
                className="w-full py-3 px-4 bg-[#4318FF] text-white hover:bg-[#3311CC] transition-all duration-200 rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(67,24,255,0.3)] cursor-pointer"
              >
                {classLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menyimpan Kelas...</span>
                  </>
                ) : (
                  <span>Simpan Kelas</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: List / Table of Classes (lg:span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E9EDF7] rounded-2xl p-6">
            <h3 className="text-md font-bold text-[#1B254B] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Daftar Kelas Terdaftar
            </h3>

            {classesList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Belum ada data kelas terdaftar. Silakan tambahkan kelas baru di kolom sebelah kiri.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E9EDF7]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F4F7FE] text-[#1B254B] font-semibold border-b border-[#E9EDF7]">
                      <th className="px-4 py-3 text-xs uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-xs uppercase tracking-wider">Nama Kelas</th>
                      <th className="px-4 py-3 text-xs uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDF7]">
                    {classesList.map((cls) => (
                      <tr key={cls.id} className="hover:bg-[#F4F7FE]/50 transition-all">
                        <td className="px-4 py-3 text-[#A3AED0] font-mono">{cls.id}</td>
                        <td className="px-4 py-3 text-[#1B254B] font-medium">{cls.class_name}</td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(cls.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#4318FF] hover:text-[#3311CC] bg-[#F4F7FE] hover:bg-[#E9EDF7] border border-[#E0E5F2] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Detail
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#FFF5F5] text-[#E31A1A] hover:bg-[#FEDDCB] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
      </div>

      {/* Modal Class Detail (Popup) */}
      {showDetailModal && selectedClassDetail && (
        <div className="fixed inset-0 bg-[#1B254B]/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-[#E9EDF7] w-full max-w-3xl rounded-2xl shadow-[0_4px_20px_0_rgba(112,144,176,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#E9EDF7] flex justify-between items-center bg-[#F8FAFC]">
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#4318FF] uppercase tracking-widest">Detail Kelas</span>
                <h3 className="text-2xl font-extrabold text-[#1B254B] mt-1">
                  {selectedClassDetail.class.class_name}
                </h3>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-[#4318FF] font-semibold bg-[#F4F7FE] border border-[#E0E5F2] px-2.5 py-1 rounded-lg">
                    Kuota Siswa: {selectedClassDetail.students.length} / {selectedClassDetail.class.max_students}
                  </span>
                  <span className="text-[#8A3FFC] font-semibold bg-[#F4F7FE] border border-[#E0E5F2] px-2.5 py-1 rounded-lg">
                    Kuota Guru: {selectedClassDetail.teachers.length} / {selectedClassDetail.class.max_teachers}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClassDetail(null);
                  setSelectedUserIds([]);
                }}
                className="p-2 text-slate-500 hover:text-[#1B254B] bg-[#F4F7FE] hover:bg-[#E9EDF7] rounded-xl transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body (Scrollable if too long) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              {/* Section 1: Guru Pengajar */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B254B] uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4318FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Guru Pengajar
                </h4>
                
                {!selectedClassDetail.teachers || selectedClassDetail.teachers.length === 0 ? (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E9EDF7] text-slate-500 text-sm italic text-left">
                    Belum ada guru yang ditugaskan di kelas ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {selectedClassDetail.teachers.map((teacher) => (
                      <div key={teacher.id} className="p-4 bg-[#F8FAFC] border border-[#E9EDF7] rounded-xl flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center font-bold shrink-0">
                          {teacher.name?.[0] || 'T'}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-semibold text-[#1B254B] truncate">{teacher.name}</p>
                          <p className="text-xs text-slate-500 truncate">{teacher.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Daftar Siswa Terdaftar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#1B254B] uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#DB2777]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Daftar Siswa Terdaftar ({selectedClassDetail.students ? selectedClassDetail.students.length : 0})
                  </h4>
                </div>

                {/* WhatsApp-style Conditional Action Toolbar */}
                {selectedUserIds.length > 0 && selectedClassDetail.students && selectedClassDetail.students.length > 0 && (
                  <div className="p-4 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl flex flex-wrap items-center justify-between gap-4 animate-slide-down">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#4318FF] rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-[#4318FF]">
                        {selectedUserIds.length} Siswa Terpilih (Aksi Massal)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Bulk Move action */}
                      <div className="relative inline-flex items-center gap-2">
                        {showBulkMoveDropdown ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={bulkMoveDestClassId}
                              onChange={(e) => setBulkMoveDestClassId(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-[#E0E5F2] text-xs font-semibold text-[#1B254B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4318FF] focus:border-[#4318FF]"
                            >
                              <option value="" disabled>-- Pilih Kelas Tujuan --</option>
                              {classesList
                                .filter((cls) => cls.id !== selectedClassDetail.class.id)
                                .map((cls) => (
                                  <option key={cls.id} value={cls.id.toString()}>
                                    {cls.class_name}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleBulkMove(selectedClassDetail.class.id)}
                              disabled={bulkActionLoading || !bulkMoveDestClassId}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311CC] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all cursor-pointer"
                            >
                              Eksekusi Pindah
                            </button>
                            <button
                              onClick={() => {
                                setShowBulkMoveDropdown(false);
                                setBulkMoveDestClassId('');
                              }}
                              className="px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#1B254B] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowBulkMoveDropdown(true)}
                            disabled={bulkActionLoading}
                            className="px-3 py-1.5 text-xs font-bold text-[#4318FF] hover:text-[#3311CC] bg-[#F4F7FE] hover:bg-[#E9EDF7] border border-[#E0E5F2] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Pindahkan Kelas
                          </button>
                        )}
                      </div>

                      {/* Bulk Remove action */}
                      <button
                        onClick={() => handleBulkRemove(selectedClassDetail.class.id)}
                        disabled={bulkActionLoading}
                        className="px-3 py-1.5 text-xs font-bold bg-[#FFF5F5] text-[#E31A1A] hover:bg-[#FEDDCB] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Terpilih
                      </button>
                    </div>
                  </div>
                )}

                {!selectedClassDetail.students || selectedClassDetail.students.length === 0 ? (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E9EDF7] rounded-xl text-slate-500 text-sm italic text-left">
                    Belum ada siswa yang terdaftar di kelas ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#E9EDF7]">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#F4F7FE] text-[#1B254B] font-semibold border-b border-[#E9EDF7]">
                          <th className="px-4 py-2 text-xs uppercase tracking-wider w-10">
                            <input
                              type="checkbox"
                              checked={
                                selectedClassDetail.students.length > 0 &&
                                selectedClassDetail.students.every((s) => selectedUserIds.includes(s.id))
                              }
                              onChange={() => handleToggleSelectAllStudents(selectedClassDetail.students)}
                              className="w-4 h-4 rounded border-[#E0E5F2] bg-white text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-2 text-xs uppercase tracking-wider">NIS</th>
                          <th className="px-4 py-2 text-xs uppercase tracking-wider">Nama</th>
                          <th className="px-4 py-2 text-xs uppercase tracking-wider">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9EDF7]">
                        {selectedClassDetail.students.map((student) => (
                          <tr key={student.id} className="hover:bg-[#F4F7FE]/50 transition-all">
                            <td className="px-4 py-2.5 w-10">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(student.id)}
                                onChange={() => handleToggleSelectUser(student.id)}
                                className="w-4 h-4 rounded border-[#E0E5F2] bg-white text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-mono">{student.nis || '-'}</td>
                            <td className="px-4 py-2.5 text-[#1B254B] font-medium">{student.name}</td>
                            <td className="px-4 py-2.5 text-slate-500 truncate">{student.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E9EDF7] flex justify-end bg-[#F8FAFC]">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClassDetail(null);
                  setSelectedUserIds([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-[#1B254B] border border-[#E0E5F2] hover:bg-[#F4F7FE] bg-white rounded-xl transition-all cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
