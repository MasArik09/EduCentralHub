import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2, FiDatabase, FiTag } from 'react-icons/fi';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  
  // Question Form State
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [topic, setTopic] = useState('');
  const [score, setScore] = useState(10);

  useEffect(() => {
    const savedQuestions = localStorage.getItem('teacher_question_bank');
    
    const defaultQuestions = [
      { id: 1, topic: 'Matematika - Aljabar', questionText: 'Jika 3x + 5 = 20, berapakah nilai x?', options: ['3', '4', '5', '6'], correctAnswer: 2, score: 10 },
      { id: 2, topic: 'Matematika - Aljabar', questionText: 'Berapakah hasil pemfaktoran dari x^2 - 9?', options: ['(x-3)(x-3)', '(x+3)(x-3)', '(x+9)(x-9)', '(x+3)(x+3)'], correctAnswer: 1, score: 10 },
      { id: 3, topic: 'Fisika - Termodinamika', questionText: 'Hukum Termodinamika yang menyatakan tentang kekekalan energi adalah hukum ke...', options: ['Nol', 'Satu', 'Dua', 'Tiga'], correctAnswer: 1, score: 10 }
    ];

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      localStorage.setItem('teacher_question_bank', JSON.stringify(defaultQuestions));
      setQuestions(defaultQuestions);
    }
  }, []);

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!questionText || options.some(o => !o) || !topic) return;

    const newQuestion = {
      id: Date.now(),
      topic,
      questionText,
      options: [...options],
      correctAnswer,
      score: parseInt(score, 10)
    };

    const updated = [...questions, newQuestion];
    setQuestions(updated);
    localStorage.setItem('teacher_question_bank', JSON.stringify(updated));

    Swal.fire({
      title: 'Soal Ditambahkan!',
      text: 'Pertanyaan berhasil disimpan ke dalam Bank Soal.',
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });

    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setTopic('');
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Soal?',
      text: 'Soal akan dihapus secara permanen dari Bank Soal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E31A1A',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = questions.filter(q => q.id !== id);
        setQuestions(updated);
        localStorage.setItem('teacher_question_bank', JSON.stringify(updated));
        Swal.fire('Terhapus!', 'Soal berhasil dihapus dari Bank Soal.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Add Question Form */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiDatabase className="text-[#4318FF] w-5 h-5" />
          Tambah Soal ke Bank Soal (Reusable)
        </h3>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Topik / Kategori Soal</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Matematika - Aljabar, Fisika - Dinamika Gerak"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bobot Skor</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teks Pertanyaan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm font-semibold"
              placeholder="Masukkan bunyi pertanyaan pilihan ganda..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct-answer-bank"
                  checked={correctAnswer === idx}
                  onChange={() => setCorrectAnswer(idx)}
                  className="w-4 h-4 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                />
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-[#F4F7FE]/80 border border-slate-200/60 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-xs font-medium"
                  placeholder={`Opsi Pilihan ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 italic block mt-1">
            *Tandai tombol lingkaran di sebelah opsi untuk menetapkan kunci jawaban yang benar.
          </span>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#4318FF]/10 border-none cursor-pointer"
            >
              <FiPlus /> Simpan ke Bank Soal
            </button>
          </div>
        </form>
      </div>

      {/* Questions Table */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B]">Daftar Kumpulan Soal Reusable</h3>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Belum ada soal tersimpan di Bank Soal.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Topik</th>
                  <th className="px-6 py-4">Teks Soal</th>
                  <th className="px-6 py-4">Pilihan Opsi & Kunci Jawaban</th>
                  <th className="px-6 py-4 text-center">Skor</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q, index) => (
                  <tr key={q.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <FiTag /> {q.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1B254B] max-w-xs">{q.questionText}</td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`px-2 py-0.5 rounded ${
                            q.correctAnswer === oIdx
                              ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                              : 'text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt} {q.correctAnswer === oIdx && '✔'}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#1B254B]">{q.score}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border-none cursor-pointer inline-flex items-center justify-center"
                      >
                        <FiTrash2 className="w-4 h-4" />
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
  );
}
