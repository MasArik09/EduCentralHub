import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UploadMateri from './UploadMateri';
import QuestionBank from './QuestionBank';
import CreateQuiz from './CreateQuiz';
import { FiBookOpen, FiDatabase, FiFileText } from 'react-icons/fi';

export default function ContentMateri() {
  const [activeTab, setActiveTab] = useState('materi');
  const location = useLocation();

  useEffect(() => {
    // Read query parameter to determine active tab on load
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'materi') {
      setActiveTab('materi');
    } else if (tabParam === 'kuis') {
      setActiveTab('quiz');
    }
  }, [location]);

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Konten & Materi Pembelajaran
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Kelola bank materi multi-format, pelihara bank soal reusable, dan buat kuis interaktif dengan wizard step-by-step.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E9EDF7] overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'materi'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiBookOpen className="w-4 h-4" />
          Upload Materi
        </button>
        
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'bank'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiDatabase className="w-4 h-4" />
          Bank Soal
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'quiz'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiFileText className="w-4 h-4" />
          Buat Kuis & Tugas
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'materi' && <UploadMateri />}
        {activeTab === 'bank' && <QuestionBank />}
        {activeTab === 'quiz' && <CreateQuiz />}
      </div>
    </div>
  );
}
