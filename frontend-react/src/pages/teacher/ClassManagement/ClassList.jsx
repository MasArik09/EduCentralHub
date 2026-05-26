import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiPlus, FiUsers, FiCalendar, FiBook } from 'react-icons/fi';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Class Form State
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [targetClassCode, setTargetClassCode] = useState('');

  useEffect(() => {
    // Load initial mock or saved data from localStorage
    const savedClasses = localStorage.getItem('teacher_classes');
    const savedStudents = localStorage.getItem('teacher_students');

    const defaultClasses = [
      { id: 1, code: 'MAT-7A', name: 'Matematika VII-A', subject: 'Aljabar & Aritmatika', schedule: 'Senin, 08:00 - 09:30', studentCount: 5 },
      { id: 2, code: 'FIS-8B', name: 'Fisika VIII-B', subject: 'Termodinamika & Gerak', schedule: 'Rabu, 10:00 - 11:30', studentCount: 3 }
    ];

    const defaultStudents = [
      { id: 1, name: 'Ahmad Rafli', email: 'rafli@educentral.hub', classCode: 'MAT-7A' },
      { id: 2, name: 'Budi Santoso', email: 'budi@educentral.hub', classCode: 'MAT-7A' },
      { id: 3, name: 'Citra Kirana', email: 'citra@educentral.hub', classCode: 'MAT-7A' },
      { id: 4, name: 'Dewi Lestari', email: 'dewi@educentral.hub', classCode: 'MAT-7A' },
      { id: 5, name: 'Eko Wijaya', email: 'eko@educentral.hub', classCode: 'MAT-7A' },
      { id: 6, name: 'Fajar Pratama', email: 'fajar@educentral.hub', classCode: 'FIS-8B' },
      { id: 7, name: 'Gita Gutawa', email: 'gita@educentral.hub', classCode: 'FIS-8B' },
      { id: 8, name: 'Hadi Wibowo', email: 'hadi@educentral.hub', classCode: 'FIS-8B' }
    ];

    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      localStorage.setItem('teacher_classes', JSON.stringify(defaultClasses));
      setClasses(defaultClasses);
    }

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      localStorage.setItem('teacher_students', JSON.stringify(defaultStudents));
      setStudents(defaultStudents);
    }
  }, []);

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!className || !subject || !schedule) return;

    // Generate unique code based on subject/class
    const codePrefix = subject.substring(0, 3).toUpperCase();
    const codeSuffix = className.replace(/[^0-9A-Z]/gi, '').toUpperCase().slice(-3);
    const code = `${codePrefix}-${codeSuffix || 'GEN'}`;

    const newClass = {
      id: Date.now(),
      code,
      name: className,
      subject,
      schedule,
      studentCount: 0
    };

    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    localStorage.setItem('teacher_classes', JSON.stringify(updatedClasses));

    Swal.fire({
      title: 'Kelas Dibuat!',
      text: `Kelas ${className} berhasil dibuat dengan kode: ${code}`,
      icon: 'success',
      confirmButtonColor: '#1A73E8'
    });

    setClassName('');
    setSubject('');
    setSchedule('');
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !targetClassCode) return;

    const classExists = classes.find(c => c.code === targetClassCode);
    if (!classExists) {
      Swal.fire({
        title: 'Kode Salah!',
        text: 'Kelas dengan kode tersebut tidak ditemukan.',
        icon: 'error',
        confirmButtonColor: '#1A73E8'
      });
      return;
    }

    const newStudent = {
      id: Date.now(),
      name: studentName,
      email: studentEmail,
      classCode: targetClassCode
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));

    // Update student count in classes list
    const updatedClasses = classes.map(c => {
      if (c.code === targetClassCode) {
        return { ...c, studentCount: c.studentCount + 1 };
      }
      return c;
    });
    setClasses(updatedClasses);
    localStorage.setItem('teacher_classes', JSON.stringify(updatedClasses));

    Swal.fire({
      title: 'Siswa Ditambahkan!',
      text: `${studentName} berhasil ditambahkan ke kelas ${classExists.name}.`,
      icon: 'success',
      confirmButtonColor: '#1A73E8'
    });

    setStudentName('');
    setStudentEmail('');
    setTargetClassCode('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Class Form */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
          <h3 className="text-md font-bold text-[#202124] flex items-center gap-2">
            <FiBook className="text-[#1A73E8] w-5 h-5" />
            Buat Kelas Baru
          </h3>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Nama Kelas & Rombel</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: Matematika VII-A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Mata Pelajaran / Topik</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: Aljabar Linier"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Jadwal Kelas</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: Senin, 08:00 - 09:30"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg font-semibold transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4 border-none"
            >
              <FiPlus /> Buat Kelas
            </button>
          </form>
        </div>

        {/* Enroll Student Form */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
          <h3 className="text-md font-bold text-[#202124] flex items-center gap-2">
            <FiUsers className="text-emerald-600 w-5 h-5" />
            Tambah Siswa via Kode Kelas
          </h3>
          <form onSubmit={handleEnrollStudent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: Ahmad Rafli"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Email / Username Siswa</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: siswa@educentral.hub"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Kode Kelas Target</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-[#1A73E8] text-sm cursor-pointer"
                value={targetClassCode}
                onChange={(e) => setTargetClassCode(e.target.value)}
              >
                <option value="">-- Pilih Kode Kelas --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.code} ({c.name})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4 border-none"
            >
              <FiPlus /> Daftarkan Siswa
            </button>
          </form>
        </div>
      </div>

      {/* Class List Table */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
        <h3 className="text-md font-bold text-[#202124]">Daftar Kelas Aktif Saya</h3>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-[#5F6368] border border-dashed border-gray-200 rounded-lg">
            Belum ada kelas aktif. Buat kelas baru di atas.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Kode Kelas</th>
                  <th className="px-6 py-4">Nama Kelas & Rombel</th>
                  <th className="px-6 py-4">Mata Pelajaran</th>
                  <th className="px-6 py-4 flex items-center gap-1.5"><FiCalendar /> Jadwal Kelas</th>
                  <th className="px-6 py-4 text-center">Siswa Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-[#1A73E8]">{cls.code}</td>
                    <td className="px-6 py-4 font-semibold text-[#202124]">{cls.name}</td>
                    <td className="px-6 py-4 text-[#5F6368]">{cls.subject}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{cls.schedule}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md">
                        <FiUsers className="w-3.5 h-3.5" />
                        {cls.studentCount} Siswa
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
