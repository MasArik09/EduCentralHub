import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';

// Utility function to decode JWT safely
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // Default role fallback
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Navigation / View state
  const [currentView, setCurrentView] = useState('dashboard');

  // Form states for Manage Class
  const [classNameInput, setClassNameInput] = useState('');
  const [maxStudentsInput, setMaxStudentsInput] = useState(36);
  const [maxTeachersInput, setMaxTeachersInput] = useState(2);
  const [classLoading, setClassLoading] = useState(false);
  const [classSuccess, setClassSuccess] = useState('');
  const [classError, setClassError] = useState('');

  // Form states for Enroll Student
  const [selectedStudent, setSelectedStudent] = useState(null); // Initialized with null as requested
  const [classIdInput, setClassIdInput] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [enrollError, setEnrollError] = useState('');

  // States for dropdown list data
  const [studentsList, setStudentsList] = useState([]);
  const [classesList, setClassesList] = useState([]);

  // States for class details modal
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // States for bulk actions (WhatsApp-style multi-select)
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkMoveDestClassId, setBulkMoveDestClassId] = useState('');
  const [showBulkMoveDropdown, setShowBulkMoveDropdown] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Read and decode token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser({ name: 'Demo User', email: 'demo@educentral.hub' });
      return;
    }

    // Try parsing JWT first
    const decoded = decodeJWT(token);
    if (decoded) {
      setUser({
        name: decoded.name || decoded.username || 'User',
        email: decoded.email || 'user@educentral.hub',
      });
      if (decoded.role) {
        setRole(decoded.role.toLowerCase());
      }
    } else {
      // Fallback: If not JWT, check if it's stored as direct JSON object
      try {
        const parsed = JSON.parse(token);
        setUser({
          name: parsed.name || parsed.username || 'User',
          email: parsed.email || 'user@educentral.hub',
        });
        if (parsed.role) {
          setRole(parsed.role.toLowerCase());
        }
      } catch (e) {
        setUser({ name: 'Authenticated User', email: 'user@educentral.hub' });
      }
    }
  }, []);

  // Fetch student and class list data when Admin opens the Enroll page
  useEffect(() => {
    if (currentView === 'enroll-student' && role === 'admin') {
      const fetchData = async () => {
        setEnrollError('');
        setEnrollSuccess('');
        const token = localStorage.getItem('token');
        try {
          const [studentsRes, classesRes] = await Promise.all([
            axios.get('http://localhost:8080/api/admin/students', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:8080/api/admin/classes', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          
          const students = studentsRes.data || [];
          const classes = classesRes.data || [];
          
          setStudentsList(students);
          setClassesList(classes);

          // Keep selected student initialized as null (no pre-selection)
          setSelectedStudent(null);
          
          if (classes.length > 0) {
            setClassIdInput(classes[0].id.toString());
          } else {
            setClassIdInput('');
          }
        } catch (err) {
          console.error('Failed to fetch dropdown list data:', err);
          setEnrollError(err.response?.data?.error || err.message || 'Gagal memuat daftar siswa atau kelas.');
        }
      };
      fetchData();
    }
  }, [currentView, role]);

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

  // Fetch classes when manage-class is opened
  useEffect(() => {
    if (currentView === 'manage-class' && role === 'admin') {
      fetchClasses();
    }
  }, [currentView, role]);

  // Whenever role changes, reset view to dashboard to prevent view leakage
  useEffect(() => {
    setCurrentView('dashboard');
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
      confirmButtonColor: '#ef4444', // Red confirm button
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#1e202a',
      color: '#ffffff'
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
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
          });
          fetchClasses();
        } catch (err) {
          console.error('Failed to delete class:', err);
          Swal.fire({
            title: 'Gagal!',
            text: err.response?.data?.error || err.message || 'Gagal menghapus kelas.',
            icon: 'error',
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
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
      confirmButtonColor: '#ef4444', // Red confirm button
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Keluarkan!',
      cancelButtonText: 'Batal',
      background: '#1e202a',
      color: '#ffffff'
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
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
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
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
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
      confirmButtonColor: '#a855f7', // Purple confirm button
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Pindahkan!',
      cancelButtonText: 'Batal',
      background: '#1e202a',
      color: '#ffffff'
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
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
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
            background: '#1e202a',
            color: '#ffffff',
            confirmButtonColor: '#6366f1'
          });
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  // Submit Handler: Enroll Student
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setEnrollError('');
    setEnrollSuccess('');
    setEnrollLoading(true);

    if (!selectedStudent || !classIdInput) {
      setEnrollError('Silakan pilih Siswa dan Kelas terlebih dahulu.');
      setEnrollLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/admin/enroll', {
        student_id: parseInt(selectedStudent.value, 10), // read dynamic ID from selectedStudent.value
        class_id: parseInt(classIdInput, 10),            // aligned with Go GORM uint binding `class_id`
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEnrollSuccess('Siswa berhasil terdaftar di dalam kelas!');
      // Reset student selector back to null
      setSelectedStudent(null);
      if (classesList.length > 0) {
        setClassIdInput(classesList[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Gagal mendaftarkan siswa.';
      setEnrollError(errMsg);
      if (err.response?.status === 400) {
        Swal.fire({
          title: 'Gagal!',
          text: errMsg,
          icon: 'error',
          background: '#1e202a',
          color: '#ffffff',
          confirmButtonColor: '#6366f1'
        });
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  // Format student list for react-select usage
  const formattedStudents = studentsList.map((std) => ({
    value: std.id,
    label: `${std.nis || ''} - ${std.name} (${std.email})`
  }));

  // Premium, customized dark theme overrides for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(15, 23, 42, 0.5)', // bg-slate-900/50 equivalent
      borderColor: state.isFocused ? '#6366f1' : '#1e293b', // indigo-500 or slate-800
      borderRadius: '0.75rem',
      padding: '0.2rem',
      color: 'white',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#334155', // slate-700
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#0f172a', // slate-900 equivalent
      borderColor: '#1e293b',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#6366f1' // indigo-500
        : state.isFocused 
        ? '#1e293b' // slate-800
        : 'transparent',
      color: 'white',
      cursor: 'pointer',
      padding: '0.6rem 1rem',
      '&:active': {
        backgroundColor: '#4f46e5', // indigo-600
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#475569', // slate-600
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: '#94a3b8', // slate-400
    })
  };

  // Content rendering based on current role
  const renderRoleContent = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kelola Kelas</h3>
              <p className="text-slate-400 text-sm mb-4">Buat kelas baru, tetapkan pengajar, atur kurikulum pembelajaran, dan kelola jadwal kelas harian.</p>
              <button 
                onClick={() => setCurrentView('manage-class')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Mulai Mengelola
              </button>
            </div>
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enroll Siswa</h3>
              <p className="text-slate-400 text-sm mb-4">Tambahkan siswa baru ke dalam sistem, daftarkan siswa ke kelas tertentu, dan verifikasi status pendaftaran.</p>
              <button 
                onClick={() => setCurrentView('enroll-student')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Pendaftaran Siswa
              </button>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Materi</h3>
              <p className="text-slate-400 text-sm mb-4">Unggah dokumen materi ajar, video rekaman pembelajaran, e-book, atau referensi studi mahasiswa.</p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all">Unggah Berkas</button>
            </div>
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Buat Kuis</h3>
              <p className="text-slate-400 text-sm mb-4">Buat latihan soal, kuis pilihan ganda, esai singkat, ujian tengah semester, dan kelola bobot nilai kuis.</p>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all">Buat Kuis Baru</button>
            </div>
          </div>
        );
      case 'student':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lihat Materi</h3>
              <p className="text-slate-400 text-xs mb-4">Pelajari modul ajar aktif, tonton video pembelajaran mandiri, dan unduh slide presentasi mata kuliah.</p>
              <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all">Buka Materi</button>
            </div>
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kerjakan Kuis</h3>
              <p className="text-slate-400 text-xs mb-4">Selesaikan tugas mingguan yang sedang aktif, ikuti kuis latihan, dan tinjau riwayat pengerjaan Anda.</p>
              <button className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold transition-all">Mulai Kuis</button>
            </div>
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Unduh Rapor</h3>
              <p className="text-slate-400 text-xs mb-4">Akses transkrip nilai akademik lengkap semester ini, cetak rapor digital, dan lihat grafik perkembangan IPK.</p>
              <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all">Unduh PDF</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen h-screen overflow-hidden flex bg-slate-950 text-slate-100 font-sans relative">
      {/* Dynamic glow backdrops */}
      <div className="absolute top-[-20%] left-[-20%] w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50rem] h-[50rem] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sidebar navigation */}
      <aside className={`bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 w-64 h-full flex-shrink-0 flex flex-col transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              E
            </div>
            <span className="font-extrabold text-lg text-white tracking-wider">EduCentral</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Main Menu</div>
          
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-left border ${
              currentView === 'dashboard'
                ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard
          </button>

          {/* Conditional Role Based Navigation */}
          {role === 'admin' && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2">Admin Actions</div>
              
              <button
                onClick={() => setCurrentView('manage-class')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border ${
                  currentView === 'manage-class'
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-semibold'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Kelola Kelas
              </button>

              <button
                onClick={() => setCurrentView('enroll-student')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border ${
                  currentView === 'enroll-student'
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-semibold'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Enroll Siswa
              </button>
            </>
          )}

          {role === 'teacher' && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2">Teacher Actions</div>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Materi
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Buat Kuis
              </a>
            </>
          )}

          {role === 'student' && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2">Student Actions</div>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Lihat Materi
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Kerjakan Kuis
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Rapor
              </a>
            </>
          )}

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2">General</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </a>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 capitalize">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-xl text-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 max-w-full h-screen overflow-y-auto overflow-x-hidden relative flex flex-col">
        {/* Top Navbar */}
        <header className="h-20 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/80 px-6 flex justify-between items-center shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <span>Pages</span>
              <span>/</span>
              <span className="text-white font-semibold capitalize">Dashboard ({role})</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* DEV TOOL: Role switcher dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dev Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-xs font-semibold text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="student" className="bg-slate-900 text-white">Student</option>
                <option value="teacher" className="bg-slate-900 text-white">Teacher</option>
                <option value="admin" className="bg-slate-900 text-white">Admin</option>
              </select>
            </div>

            <div className="h-8 w-px bg-slate-800"></div>

            {/* Role Badge */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
              role === 'admin'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : role === 'teacher'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {role}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <>
              {/* Welcome Card */}
              <div className="p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-slate-800 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none"></div>
                <div className="relative space-y-2 max-w-lg z-10">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">Workspace</span>
                  <h2 className="text-3xl font-extrabold text-white">
                    Halo, {user?.name || 'User'}!
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Selamat datang kembali di dashboard utama EduCentralHub. Di sini Anda dapat memantau seluruh proses belajar-mengajar Anda. Menu di samping telah disesuaikan berdasarkan peran Anda sebagai <strong className="text-indigo-400 capitalize">{role}</strong>.
                  </p>
                </div>
              </div>

              {/* Dynamic Role-specific Action Panels */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Aksi Cepat ({role})</h3>
                {renderRoleContent()}
              </div>
            </>
          )}

          {/* Manage Class View (Admin Only) */}
          {currentView === 'manage-class' && role === 'admin' && (
            <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Pusat Manajemen Kelas
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Buat, tinjau, dan hapus kelas yang terdaftar dalam sistem EduCentralHub.</p>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl transition-all"
                >
                  Kembali ke Dashboard
                </button>
              </div>

              {classError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{classError}</span>
                </div>
              )}

              {classSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{classSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Column 1: Add Class Form (lg:span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Tambah Kelas Baru
                    </h3>
                    <form onSubmit={handleCreateClass} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Nama Kelas
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Contoh: Kelas 10-A IPA"
                          value={classNameInput}
                          onChange={(e) => setClassNameInput(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Kapasitas Siswa
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                            value={maxStudentsInput}
                            onChange={(e) => setMaxStudentsInput(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Kapasitas Guru
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                            value={maxTeachersInput}
                            onChange={(e) => setMaxTeachersInput(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={classLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
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
                  <div className="bg-slate-955/40 border border-slate-800/80 rounded-xl p-6">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      Daftar Kelas Terdaftar
                    </h3>

                    {classesList.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Belum ada data kelas terdaftar. Silakan tambahkan kelas baru di kolom sebelah kiri.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                              <th className="px-4 py-3 text-xs uppercase tracking-wider">ID</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wider">Nama Kelas</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {classesList.map((cls) => (
                              <tr key={cls.id} className="hover:bg-slate-900/30 transition-all">
                                <td className="px-4 py-3 text-slate-500 font-mono">{cls.id}</td>
                                <td className="px-4 py-3 text-white font-medium">{cls.class_name}</td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                  <button
                                    onClick={() => handleViewDetail(cls.id)}
                                    className="px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-all inline-flex items-center gap-1.5"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Lihat Detail
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg transition-all inline-flex items-center gap-1.5"
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
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Detail Kelas</span>
                        <h3 className="text-2xl font-extrabold text-white mt-1">
                          {selectedClassDetail.class.class_name}
                        </h3>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                            Kuota Siswa: {selectedClassDetail.students.length} / {selectedClassDetail.class.max_students}
                          </span>
                          <span className="text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
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
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-850 rounded-xl transition-all"
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
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Guru Pengajar
                        </h4>
                        
                        {!selectedClassDetail.teachers || selectedClassDetail.teachers.length === 0 ? (
                          <div className="p-4 bg-slate-950/20 border border-slate-800/50 rounded-xl text-slate-500 text-sm italic text-left">
                            Belum ada guru yang ditugaskan di kelas ini.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedClassDetail.teachers.map((teacher) => (
                              <div key={teacher.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                                  {teacher.name?.[0] || 'T'}
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-sm font-semibold text-white truncate">{teacher.name}</p>
                                  <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Daftar Siswa Terdaftar */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Daftar Siswa Terdaftar ({selectedClassDetail.students ? selectedClassDetail.students.length : 0})
                          </h4>
                        </div>

                        {/* WhatsApp-style Conditional Action Toolbar */}
                        {selectedUserIds.length > 0 && selectedClassDetail.students && selectedClassDetail.students.length > 0 && (
                          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-slide-down">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse"></span>
                              <span className="text-xs font-bold text-indigo-300">
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
                                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-xs font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all"
                                    >
                                      Eksekusi Pindah
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowBulkMoveDropdown(false);
                                        setBulkMoveDestClassId('');
                                      }}
                                      className="px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowBulkMoveDropdown(true)}
                                    disabled={bulkActionLoading}
                                    className="px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-all inline-flex items-center gap-1.5"
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
                                className="px-3 py-1.5 text-xs font-bold text-rose-450 hover:text-rose-350 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg transition-all inline-flex items-center gap-1.5"
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
                          <div className="p-4 bg-slate-955/20 border border-slate-800/50 rounded-xl text-slate-500 text-sm italic text-left">
                            Belum ada siswa yang terdaftar di kelas ini.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                                  <th className="px-4 py-2 text-xs uppercase tracking-wider w-10">
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedClassDetail.students.length > 0 &&
                                        selectedClassDetail.students.every((s) => selectedUserIds.includes(s.id))
                                      }
                                      onChange={() => handleToggleSelectAllStudents(selectedClassDetail.students)}
                                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                  </th>
                                  <th className="px-4 py-2 text-xs uppercase tracking-wider">NIS</th>
                                  <th className="px-4 py-2 text-xs uppercase tracking-wider">Nama</th>
                                  <th className="px-4 py-2 text-xs uppercase tracking-wider">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {selectedClassDetail.students.map((student) => (
                                  <tr key={student.id} className="hover:bg-slate-955/20 transition-all">
                                    <td className="px-4 py-2.5 w-10">
                                      <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(student.id)}
                                        onChange={() => handleToggleSelectUser(student.id)}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400 font-mono">{student.nis || '-'}</td>
                                    <td className="px-4 py-2.5 text-white font-medium">{student.name}</td>
                                    <td className="px-4 py-2.5 text-slate-400 truncate">{student.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/10">
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          setSelectedClassDetail(null);
                          setSelectedUserIds([]);
                        }}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl transition-all"
                      >
                        Tutup Detail
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enroll Student View (Admin Only) */}
          {currentView === 'enroll-student' && role === 'admin' && (
            <div className="w-full max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Pendaftaran Siswa (Enroll)
                </h2>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl transition-all"
                >
                  Kembali ke Dashboard
                </button>
              </div>

              {enrollError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{enrollError}</span>
                </div>
              )}

              {enrollSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{enrollSuccess}</span>
                </div>
              )}

              <form onSubmit={handleEnrollStudent} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Pilih Siswa (Searchable)
                  </label>
                  <Select
                    options={formattedStudents}
                    isSearchable={true}
                    placeholder="Ketik NIS, nama, atau email siswa..."
                    value={selectedStudent}
                    onChange={(selectedOption) => setSelectedStudent(selectedOption)}
                    styles={customSelectStyles}
                    noOptionsMessage={() => "Siswa tidak ditemukan"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Pilih Kelas
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-955/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer bg-slate-900"
                    value={classIdInput}
                    onChange={(e) => setClassIdInput(e.target.value)}
                  >
                    <option value="" disabled className="text-slate-500">-- Pilih Kelas --</option>
                    {classesList.map((cls) => (
                      <option key={cls.id} value={cls.id.toString()}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={enrollLoading || !selectedStudent || classesList.length === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {enrollLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mendaftarkan Siswa...</span>
                    </>
                  ) : (
                    <span>Submit Enrollment</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
