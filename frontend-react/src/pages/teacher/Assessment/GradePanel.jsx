import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiCheckSquare, FiAward, FiMessageSquare } from 'react-icons/fi';

export default function GradePanel() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  
  // Grade Form State
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const savedSubmissions = localStorage.getItem('teacher_submissions');

    const defaultSubmissions = [
      { id: 1, studentName: 'Ahmad Rafli', classCode: 'MAT-7A', taskTitle: 'Kuis Aljabar Dasar', submissionDate: '2026-05-25', content: 'x = 5. Langkah: 3x = 20 - 5 => 3x = 15 => x = 5.', status: 'Belum Dinilai', score: null, feedback: '' },
      { id: 2, studentName: 'Budi Santoso', classCode: 'MAT-7A', taskTitle: 'Kuis Aljabar Dasar', submissionDate: '2026-05-25', content: 'x = 5. Karena 3(5)+5 = 15+5 = 20.', status: 'Belum Dinilai', score: null, feedback: '' },
      { id: 3, studentName: 'Citra Kirana', classCode: 'MAT-7A', taskTitle: 'Kuis Aljabar Dasar', submissionDate: '2026-05-24', content: 'x = 4. 3(4)+5 = 17 (Salah hitung).', status: 'Sudah Dinilai', score: 60, feedback: 'Kurang teliti dalam mengoperasikan pembagian di akhir.' },
      { id: 4, studentName: 'Fajar Pratama', classCode: 'FIS-8B', taskTitle: 'Tugas Termodinamika', submissionDate: '2026-05-24', content: 'Laporan Eksperimen Hukum Termodinamika I: Energi tidak dapat diciptakan atau dimusnahkan...', status: 'Belum Dinilai', score: null, feedback: '' }
    ];

    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    } else {
      localStorage.setItem('teacher_submissions', JSON.stringify(defaultSubmissions));
      setSubmissions(defaultSubmissions);
    }
  }, []);

  const handleOpenGrade = (sub) => {
    setSelectedSub(sub);
    setScore(sub.score !== null ? sub.score.toString() : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!selectedSub || score === '') return;

    const numScore = parseInt(score, 10);
    if (numScore < 0 || numScore > 100) {
      Swal.fire('Nilai Tidak Valid', 'Skor penilaian harus berada di antara range 0 - 100.', 'error');
      return;
    }

    const updated = submissions.map(sub => {
      if (sub.id === selectedSub.id) {
        return {
          ...sub,
          status: 'Sudah Dinilai',
          score: numScore,
          feedback
        };
      }
      return sub;
    });

    setSubmissions(updated);
    localStorage.setItem('teacher_submissions', JSON.stringify(updated));

    Swal.fire({
      title: 'Tugas Dinilai!',
      text: `Penilaian untuk ${selectedSub.studentName} berhasil disimpan dengan nilai: ${numScore}`,
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });

    // Update class average analytics
    updateClassAverage(selectedSub.classCode, selectedSub.taskTitle, numScore);

    setSelectedSub(null);
    setScore('');
    setFeedback('');
  };

  // Helper to dynamically update average values in localStorage
  const updateClassAverage = (classCode, taskTitle, newScore) => {
    const savedAverage = localStorage.getItem('class_grades_average') || '[]';
    const averages = JSON.parse(savedAverage);

    // Find if we already have grades entry for this class/task
    const entryIdx = averages.findIndex(e => e.classCode === classCode && e.task === taskTitle);
    
    if (entryIdx !== -1) {
      const entry = averages[entryIdx];
      const currentTotal = entry.avgScore * entry.count;
      const nextCount = entry.count + 1;
      const nextAvg = Math.round((currentTotal + newScore) / nextCount);

      averages[entryIdx] = {
        ...entry,
        count: nextCount,
        avgScore: nextAvg
      };
    } else {
      averages.push({
        classCode,
        task: taskTitle,
        count: 1,
        avgScore: newScore
      });
    }

    localStorage.setItem('class_grades_average', JSON.stringify(averages));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Submissions List Table */}
        <div className={`bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4 ${selectedSub ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <h3 className="text-md font-extrabold text-[#1B254B]">Daftar Tugas Dikumpulkan Siswa</h3>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Belum ada tugas siswa yang dikumpulkan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                    <th className="px-6 py-4 w-12 text-center">No.</th>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Topik Tugas</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Nilai</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-[#1B254B]">{sub.studentName}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{sub.classCode}</td>
                      <td className="px-6 py-4 text-slate-500">{sub.taskTitle}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          sub.status === 'Sudah Dinilai'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#1B254B]">
                        {sub.score !== null ? (
                          <span className="text-[#4318FF] font-black">{sub.score}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenGrade(sub)}
                          className="flex items-center gap-1 bg-[#4318FF]/10 text-[#4318FF] hover:bg-[#4318FF] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer"
                        >
                          Koreksi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grading Details Panel */}
        {selectedSub && (
          <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm xl:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-[#1B254B] flex items-center gap-2">
                  <FiCheckSquare className="text-[#4318FF]" /> Detail Koreksi Tugas
                </h4>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-slate-400 font-bold border-none bg-transparent hover:text-slate-600 text-sm cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p><strong className="text-slate-500">Nama Siswa:</strong> <span className="font-semibold text-[#1B254B]">{selectedSub.studentName} ({selectedSub.classCode})</span></p>
                <p><strong className="text-slate-500">Tugas:</strong> <span className="font-semibold text-[#1B254B]">{selectedSub.taskTitle}</span></p>
                <p><strong className="text-slate-500">Tanggal Kirim:</strong> <span className="font-semibold text-slate-600">{selectedSub.submissionDate}</span></p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E0E5F2] rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider block">Jawaban Siswa:</span>
                <p className="text-xs text-[#1B254B] font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedSub.content}
                </p>
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FiAward className="text-[#4318FF]" /> Berikan Skor (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-sm font-bold text-[#1B254B] focus:outline-none focus:border-[#4318FF]"
                    placeholder="Contoh: 95"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FiMessageSquare className="text-emerald-500" /> Feedback / Catatan Guru
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:border-[#4318FF]"
                    placeholder="Contoh: Penjelasan langkahmu sudah sangat runtun dan benar! Pertahankan."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all border-none cursor-pointer shadow-md shadow-[#4318FF]/10"
                >
                  Simpan Penilaian
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
