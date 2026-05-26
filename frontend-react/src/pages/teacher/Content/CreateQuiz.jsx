import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiClock, FiList, FiPlus, FiTrash2, FiFileText, FiArrowRight, FiArrowLeft, FiCheck, FiDownload } from 'react-icons/fi';

export default function CreateQuiz() {
  const [classes, setClasses] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [step, setStep] = useState(1);

  // Step 1 Form States
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [classCode, setClassCode] = useState('');

  // Step 2 Form States (Questions drafted for this quiz)
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }
  ]);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const savedClasses = localStorage.getItem('teacher_classes');
    const savedBank = localStorage.getItem('teacher_question_bank');

    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedBank) setBankQuestions(JSON.parse(savedBank));
  }, []);

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (quizQuestions.length === 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...quizQuestions];
    updated[qIdx][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[oIdx] = value;
    setQuizQuestions(updated);
  };

  const handleImportQuestion = (q) => {
    const newQ = {
      questionText: q.questionText,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      score: q.score
    };

    // If first question is empty, replace it
    if (quizQuestions.length === 1 && !quizQuestions[0].questionText && quizQuestions[0].options.every(o => !o)) {
      setQuizQuestions([newQ]);
    } else {
      setQuizQuestions([...quizQuestions, newQ]);
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Soal berhasil diimpor!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handlePublish = () => {
    const invalid = quizQuestions.some(q => !q.questionText || q.options.some(o => !o));
    if (invalid) {
      Swal.fire('Form Belum Lengkap', 'Semua soal dan opsi pilihan ganda wajib diisi.', 'error');
      return;
    }

    const payload = {
      id: Date.now(),
      title,
      duration: parseInt(duration, 10),
      classCode,
      questions: quizQuestions,
      date: new Date().toISOString().split('T')[0]
    };

    const savedQuizzes = localStorage.getItem('teacher_quizzes') || '[]';
    const quizzes = JSON.parse(savedQuizzes);
    quizzes.push(payload);
    localStorage.setItem('teacher_quizzes', JSON.stringify(quizzes));

    Swal.fire({
      title: 'Kuis Diterbitkan!',
      text: `Kuis "${title}" berhasil dikirim ke seluruh siswa kelas ${classCode}.`,
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });

    // Reset Form
    setTitle('');
    setDuration(30);
    setQuizQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, score: 10 }]);
    setStep(1);
  };

  return (
    <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-6 text-left">
      {/* Wizard Progress Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiList className="text-[#4318FF] w-5 h-5" />
          Wizard Pembuatan Kuis & Tugas
        </h3>
        
        {/* Wizard Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                step === s
                  ? 'bg-[#4318FF] text-white border-[#4318FF]'
                  : step > s
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-[#F4F7FE] text-slate-400 border-slate-200'
              }`}>
                {step > s ? '✔' : s}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-[#E9EDF7]'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Info Kuis */}
      {step === 1 && (
        <div className="space-y-4">
          <h4 className="text-sm font-black text-[#1B254B] uppercase tracking-wide">Langkah 1: Informasi Kuis</h4>
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
                <FiClock /> Batas Waktu (Menit)
              </label>
              <input
                type="number"
                min="5"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm font-semibold"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas Target</label>
              <select
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!title || !classCode) return Swal.fire('Error', 'Harap isi seluruh field Langkah 1.', 'error');
                setStep(2);
              }}
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer border-none"
            >
              Lanjut Langkah 2 <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Pertanyaan Kuis */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="text-sm font-black text-[#1B254B] uppercase tracking-wide">Langkah 2: Rancang Soal Kuis ({quizQuestions.length})</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-black border-none cursor-pointer"
              >
                <FiDownload /> Impor dari Bank Soal
              </button>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 bg-[#4318FF]/15 text-[#4318FF] hover:bg-[#4318FF]/25 px-4 py-2 rounded-xl text-xs font-black border-none cursor-pointer"
              >
                <FiPlus /> Tambah Soal
              </button>
            </div>
          </div>

          {quizQuestions.map((q, idx) => (
            <div key={idx} className="p-4 border border-[#E9EDF7] rounded-2xl relative space-y-3">
              <button
                type="button"
                onClick={() => handleRemoveQuestion(idx)}
                className="absolute top-4 right-4 text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all border-none cursor-pointer"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
              <div className="max-w-[90%] space-y-3">
                <div>
                  <span className="text-[10px] font-black text-[#4318FF] uppercase tracking-wider block">Soal #{idx + 1}</span>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4318FF] mt-1"
                    placeholder="Masukkan pertanyaan di sini..."
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q-ans-${idx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => handleQuestionChange(idx, 'correctAnswer', oIdx)}
                        className="w-3.5 h-3.5 text-[#4318FF] cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-1.5 bg-[#F4F7FE]/80 border border-slate-200/60 rounded-lg text-xs"
                        placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[#1B254B]">Impor Soal dari Bank Soal</h4>
                  <button onClick={() => setShowImportModal(false)} className="text-slate-400 font-bold border-none bg-transparent text-lg cursor-pointer">×</button>
                </div>
                {bankQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Bank Soal kosong. Silakan isi Bank Soal terlebih dahulu.</p>
                ) : (
                  <div className="space-y-3">
                    {bankQuestions.map((q) => (
                      <div key={q.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1B254B] truncate">{q.questionText}</p>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{q.topic}</span>
                        </div>
                        <button
                          onClick={() => handleImportQuestion(q)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                        >
                          Pilih
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 bg-[#F4F7FE] text-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all border-none cursor-pointer"
            >
              <FiArrowLeft /> Langkah 1
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-6 py-2.5 rounded-xl font-bold transition-all border-none cursor-pointer"
            >
              Lanjut Langkah 3 <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Konfirmasi */}
      {step === 3 && (
        <div className="space-y-6">
          <h4 className="text-sm font-black text-[#1B254B] uppercase tracking-wide">Langkah 3: Konfirmasi & Terbitkan Kuis</h4>
          
          <div className="p-6 bg-[#F8FAFC] border border-[#E9EDF7] rounded-3xl space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Judul Kuis</span>
                <span className="text-sm font-bold text-[#1B254B]">{title}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Batas Waktu</span>
                <span className="text-sm font-bold text-[#1B254B] flex items-center gap-1"><FiClock /> {duration} Menit</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Kelas Target</span>
                <span className="text-sm font-bold text-[#1B254B]">{classCode}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Jumlah Soal</span>
                <span className="text-sm font-bold text-[#1B254B]">{quizQuestions.length} Butir Soal</span>
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-4 space-y-2">
              <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider mb-2">Daftar Ringkasan Soal</span>
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span>{idx + 1}.</span>
                  <span className="font-semibold text-slate-700">{q.questionText || '(Pertanyaan Kosong)'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-[#F4F7FE] text-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all border-none cursor-pointer"
            >
              <FiArrowLeft /> Langkah 2
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all border-none shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <FiCheck /> Terbitkan Kuis Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
