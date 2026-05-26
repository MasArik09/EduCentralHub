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
      confirmButtonColor: '#1A73E8'
    });
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <h3 className="text-md font-bold text-[#202124] flex items-center gap-2">
          <FiCheckSquare className="text-[#1A73E8] w-5 h-5" />
          Absensi Siswa Online
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">Kelas:</span>
            <select
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[#202124] text-xs font-semibold focus:outline-none cursor-pointer"
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
            <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider flex items-center gap-1"><FiCalendar /> Tanggal:</span>
            <input
              type="date"
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[#202124] text-xs font-semibold focus:outline-none"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!selectedClassCode ? (
        <div className="text-center py-12 text-[#5F6368] border border-dashed border-gray-200 rounded-lg">
          Silakan pilih kelas terlebih dahulu untuk melakukan absensi.
        </div>
      ) : activeStudents.length === 0 ? (
        <div className="text-center py-12 text-[#5F6368] border border-dashed border-gray-200 rounded-lg">
          Belum ada siswa terdaftar di kelas ini. Daftarkan siswa di tab "Kelola Kelas".
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-[#202124]">{student.name}</td>
                    <td className="px-6 py-4 text-[#5F6368]">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((status) => {
                          const isSelected = attendance[student.id] === status;
                          let btnStyle = 'bg-gray-50 text-[#5F6368] hover:bg-gray-100 border border-gray-200';
                          
                          if (isSelected) {
                            if (status === 'Hadir') btnStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
                            if (status === 'Izin') btnStyle = 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
                            if (status === 'Sakit') btnStyle = 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold';
                            if (status === 'Alpa') btnStyle = 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
                          }

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors duration-150 ${btnStyle}`}
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

          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <span className="text-xs text-[#202124] font-semibold flex items-center gap-1.5">
              <FiAward className="text-[#1A73E8]" /> Total: {activeStudents.length} Siswa | Hadir:{' '}
              {Object.values(attendance).filter(v => v === 'Hadir').length}
            </span>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white px-5 py-2.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors duration-150"
            >
              <FiSave /> Simpan Absensi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
