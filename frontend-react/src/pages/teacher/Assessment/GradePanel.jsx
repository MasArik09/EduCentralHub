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
      confirmButtonColor: '#1A73E8'
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
        <div className={`bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4 ${selectedSub ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <h3 className="text-md font-bold text-[#202124]">Daftar Tugas Dikumpulkan Siswa</h3>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-[#5F6368] border border-dashed border-gray-200 rounded-lg">
              Belum ada tugas siswa yang dikumpulkan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                    <th className="px-6 py-4 w-12 text-center">No.</th>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Topik Tugas</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Nilai</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center text-[#5F6368] font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-[#202124]">{sub.studentName}</td>
                      <td className="px-6 py-4 font-medium text-[#5F6368]">{sub.classCode}</td>
                      <td className="px-6 py-4 text-[#5F6368]">{sub.taskTitle}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border ${
                          sub.status === 'Sudah Dinilai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#202124]">
                        {sub.score !== null ? (
                          <span className="text-[#1A73E8] font-bold">{sub.score}</span>
                        ) : (
                          <span className="text-[#5F6368] font-normal">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenGrade(sub)}
                          className="flex items-center gap-1 bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 border-none cursor-pointer"
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
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none xl:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <h4 className="font-bold text-[#202124] flex items-center gap-2">
                  <FiCheckSquare className="text-[#1A73E8]" /> Detail Koreksi Tugas
                </h4>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-[#5F6368] hover:text-[#202124] font-semibold border-none bg-transparent text-sm cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p><strong className="text-[#5F6368]">Nama Siswa:</strong> <span className="font-semibold text-[#202124]">{selectedSub.studentName} ({selectedSub.classCode})</span></p>
                <p><strong className="text-[#5F6368]">Tugas:</strong> <span className="font-semibold text-[#202124]">{selectedSub.taskTitle}</span></p>
                <p><strong className="text-[#5F6368]">Tanggal Kirim:</strong> <span className="font-semibold text-[#5F6368]">{selectedSub.submissionDate}</span></p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <span className="text-[10px] font-semibold text-[#5F6368] uppercase tracking-wider block">Jawaban Siswa:</span>
                <p className="text-xs text-[#202124] font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedSub.content}
                </p>
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FiAward className="text-[#1A73E8]" /> Berikan Skor (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#202124] focus:outline-none focus:border-[#1A73E8]"
                    placeholder="Contoh: 95"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FiMessageSquare className="text-emerald-600" /> Feedback / Catatan Guru
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1A73E8]"
                    placeholder="Contoh: Penjelasan langkahmu sudah sangat runtun dan benar! Pertahankan."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg font-semibold transition-colors duration-150 border-none cursor-pointer shadow-none"
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
