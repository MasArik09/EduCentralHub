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
      confirmButtonColor: '#4318FF'
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
        confirmButtonColor: '#4318FF'
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
      confirmButtonColor: '#4318FF'
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
        <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiBook className="text-[#4318FF] w-5 h-5" />
            Buat Kelas Baru
          </h3>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Kelas & Rombel</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Matematika VII-A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mata Pelajaran / Topik</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Aljabar Linier"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jadwal Kelas</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Senin, 08:00 - 09:30"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <FiPlus /> Buat Kelas
            </button>
          </form>
        </div>

        {/* Enroll Student Form */}
        <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiUsers className="text-emerald-500 w-5 h-5" />
            Tambah Siswa via Kode Kelas
          </h3>
          <form onSubmit={handleEnrollStudent} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Ahmad Rafli"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email / Username Siswa</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: siswa@educentral.hub"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Kelas Target</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
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
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <FiPlus /> Daftarkan Siswa
            </button>
          </form>
        </div>
      </div>

      {/* Class List Table */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B]">Daftar Kelas Aktif Saya</h3>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Belum ada kelas aktif. Buat kelas baru di atas.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Kode Kelas</th>
                  <th className="px-6 py-4">Nama Kelas & Rombel</th>
                  <th className="px-6 py-4">Mata Pelajaran</th>
                  <th className="px-6 py-4 flex items-center gap-1.5"><FiCalendar /> Jadwal Kelas</th>
                  <th className="px-6 py-4 text-center">Siswa Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-[#4318FF]">{cls.code}</td>
                    <td className="px-6 py-4 font-semibold text-[#1B254B]">{cls.name}</td>
                    <td className="px-6 py-4 text-slate-500">{cls.subject}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{cls.schedule}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">
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
