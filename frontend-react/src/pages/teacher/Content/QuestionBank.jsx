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
      confirmButtonColor: '#1A73E8'
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
      cancelButtonColor: '#5F6368',
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
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
        <h3 className="text-md font-bold text-[#202124] flex items-center gap-2">
          <FiDatabase className="text-[#1A73E8] w-5 h-5" />
          Tambah Soal ke Bank Soal (Reusable)
        </h3>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Topik / Kategori Soal</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-[#1A73E8] text-sm"
                placeholder="Contoh: Matematika - Aljabar, Fisika - Dinamika Gerak"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Bobot Skor</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-[#1A73E8] text-sm"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-1">Teks Pertanyaan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-[#1A73E8] text-sm font-semibold"
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
                  className="w-4 h-4 text-[#1A73E8] focus:ring-[#1A73E8] cursor-pointer"
                />
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-[#1A73E8] text-xs font-medium"
                  placeholder={`Opsi Pilihan ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[#5F6368] italic block mt-1">
            *Tandai tombol lingkaran di sebelah opsi untuk menetapkan kunci jawaban yang benar.
          </span>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white px-6 py-2.5 rounded-lg font-semibold border-none cursor-pointer transition-colors duration-150"
            >
              <FiPlus /> Simpan ke Bank Soal
            </button>
          </div>
        </form>
      </div>

      {/* Questions Table */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-none space-y-4">
        <h3 className="text-md font-bold text-[#202124]">Daftar Kumpulan Soal Reusable</h3>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-[#5F6368] border border-dashed border-gray-200 rounded-lg">
            Belum ada soal tersimpan di Bank Soal.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-[#202124] border-b border-gray-200 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Topik</th>
                  <th className="px-6 py-4">Teks Soal</th>
                  <th className="px-6 py-4">Pilihan Opsi & Kunci Jawaban</th>
                  <th className="px-6 py-4 text-center">Skor</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {questions.map((q, index) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md">
                        <FiTag /> {q.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#202124] max-w-xs">{q.questionText}</td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`px-2 py-0.5 rounded ${
                            q.correctAnswer === oIdx
                              ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                              : 'text-[#5F6368]'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt} {q.correctAnswer === oIdx && '✔'}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#202124]">{q.score}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border-none cursor-pointer inline-flex items-center justify-center"
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
