import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiCheckSquare, FiCalendar, FiSave, FiAward } from 'react-icons/fi';

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassCode, setSelectedClassCode] = useState('');
  
  // Attendance records state: studentId -> status ('Hadir' | 'Izin' | 'Sakit' | 'Alpa')
  const [attendance, setAttendance] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fetch classes and students from localStorage
    const savedClasses = localStorage.getItem('teacher_classes');
    const savedStudents = localStorage.getItem('teacher_students');

    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
  }, []);

  // Filter students based on class selection
  const activeStudents = students.filter(s => s.classCode === selectedClassCode);

  // Initialize attendance records when class changes or date changes
  useEffect(() => {
    if (!selectedClassCode) return;

    // Try to load saved attendance for this class and date
    const attendanceKey = `attendance_${selectedClassCode}_${attendanceDate}`;
    const savedAttendance = localStorage.getItem(attendanceKey);

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    } else {
      // Default to 'Hadir' for all students
      const defaultAttendance = {};
      activeStudents.forEach(student => {
        defaultAttendance[student.id] = 'Hadir';
      });
      setAttendance(defaultAttendance);
    }
  }, [selectedClassCode, attendanceDate, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClassCode) return;

    const attendanceKey = `attendance_${selectedClassCode}_${attendanceDate}`;
    localStorage.setItem(attendanceKey, JSON.stringify(attendance));

    Swal.fire({
      title: 'Absensi Disimpan!',
      text: `Data absensi tanggal ${attendanceDate} berhasil disimpan.`,
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });
  };

  return (
    <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiCheckSquare className="text-[#4318FF] w-5 h-5" />
          Absensi Siswa Online
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas:</span>
            <select
              className="px-3 py-2 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] text-xs font-semibold focus:outline-none cursor-pointer"
              value={selectedClassCode}
              onChange={(e) => setSelectedClassCode(e.target.value)}
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(c => (
                <option key={c.id} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><FiCalendar /> Tanggal:</span>
            <input
              type="date"
              className="px-3 py-1.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] text-xs font-semibold focus:outline-none"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!selectedClassCode ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          Silakan pilih kelas terlebih dahulu untuk melakukan absensi.
        </div>
      ) : activeStudents.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          Belum ada siswa terdaftar di kelas ini. Daftarkan siswa di tab "Kelola Kelas".
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-[#1B254B]">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((status) => {
                          const isSelected = attendance[student.id] === status;
                          let btnStyle = 'bg-slate-50 text-slate-400 hover:bg-slate-100';
                          
                          if (isSelected) {
                            if (status === 'Hadir') btnStyle = 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20';
                            if (status === 'Izin') btnStyle = 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20';
                            if (status === 'Sakit') btnStyle = 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20';
                            if (status === 'Alpa') btnStyle = 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20';
                          }

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border-none transition-all duration-200 ${btnStyle}`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-[#F4F7FE] p-4 rounded-2xl">
            <span className="text-xs text-[#1B254B] font-semibold flex items-center gap-1.5">
              <FiAward className="text-[#4318FF]" /> Total: {activeStudents.length} Siswa | Hadir:{' '}
              {Object.values(attendance).filter(v => v === 'Hadir').length}
            </span>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#4318FF]/10 border-none cursor-pointer"
            >
              <FiSave /> Simpan Absensi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
