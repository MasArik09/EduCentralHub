import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEdit3, FiPlus, FiTrash2, FiClock, FiFileText } from 'react-icons/fi';

export default function BuatKuis() {
  const [classes, setClasses] = useState([]);
  
  // Header state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30); // 30 minutes default
  const [classId, setClassId] = useState('');

  // Questions state
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }
  ]);

  // General states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data || [];
      setClasses(data);
      if (data.length > 0) {
        setClassId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Gagal memuat daftar kelas.');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length === 1) {
      Swal.fire({
        text: 'Minimal harus ada 1 pertanyaan di dalam kuis.',
        icon: 'warning',
        confirmButtonColor: '#4318FF'
      });
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    const invalidQuestion = questions.some(
      q => !q.questionText.trim() || q.options.some(o => !o.trim())
    );
    if (invalidQuestion) {
      setError('Harap isi semua pertanyaan dan opsi pilihan ganda.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title,
        duration: parseInt(duration, 10),
        class_id: parseInt(classId, 10),
        questions: JSON.stringify(questions)
      };

      await axios.post('http://localhost:8080/api/teacher/quizzes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Kuis baru berhasil diterbitkan!');
      setTitle('');
      setDuration(30);
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }]);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Kuis interaktif berhasil disimpan dan diterbitkan.',
        icon: 'success',
        background: '#FFFFFF',
        color: '#1B254B',
        confirmButtonColor: '#4318FF',
        customClass: { popup: 'rounded-3xl border border-slate-100' }
      });
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError(err.response?.data?.error || 'Gagal menerbitkan kuis.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left pb-12">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Buat Kuis Pembelajaran Baru
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Rancang kuis interaktif pilihan ganda, tetapkan skor, durasi pengerjaan, dan tentukan kelas target.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
          <span>✅ {success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: General Info Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiFileText className="text-[#4318FF] w-5 h-5" />
            1. Informasi Umum Kuis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kuis / Topik</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Kuis Pertemuan 1 - Aljabar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <FiClock /> Durasi (Menit)
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas Sasaran</label>
              <select
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id.toString()}>{cls.class_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Interactive Questions List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
              <FiEdit3 className="text-emerald-500 w-5 h-5" />
              2. Daftar Pertanyaan Pilihan Ganda ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-2 bg-[#4318FF]/10 text-[#4318FF] hover:bg-[#4318FF]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
            >
              <FiPlus /> Tambah Soal
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4 relative">
              <div className="absolute top-6 right-6">
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all border-none cursor-pointer"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="max-w-[85%] space-y-4">
                <div>
                  <span className="text-xs font-black text-[#4318FF] uppercase tracking-widest block mb-2">Soal #{qIdx + 1}</span>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm font-semibold"
                    placeholder="Masukkan pertanyaan kuis di sini..."
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                  />
                </div>

                {/* Option fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                        className="w-4 h-4 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-[#F4F7FE]/80 border border-slate-200/60 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-xs"
                        placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Skor Soal</label>
                    <input
                      type="number"
                      min="1"
                      className="px-3 py-1.5 w-24 bg-[#F4F7FE] border border-slate-200/80 rounded-lg text-xs text-[#1B254B] font-bold focus:outline-none"
                      value={q.score}
                      onChange={(e) => handleQuestionChange(qIdx, 'score', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-[10px] text-slate-400 italic">
                      *Tandai tombol lingkaran di sebelah opsi di atas untuk menentukan kunci jawaban yang benar.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit action */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full md:w-auto px-8 py-4 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer text-center"
          >
            {submitLoading ? 'Sedang Menerbitkan Kuis...' : 'Simpan & Terbitkan Kuis Sekarang'}
          </button>
        </div>
      </form>
    </div>
  );
}
