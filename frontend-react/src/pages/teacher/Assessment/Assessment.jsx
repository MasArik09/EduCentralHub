import { useState } from 'react';
import GradePanel from './GradePanel';
import ReportAnalytics from './ReportAnalytics';
import { FiCheckSquare, FiActivity } from 'react-icons/fi';

export default function Assessment() {
  const [activeTab, setActiveTab] = useState('grade');

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Module Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Penilaian & Evaluasi Belajar
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Koreksi tugas siswa dengan umpan balik terperinci, berikan nilai, dan pantau performa rata-rata kelas lewat grafik analitik interaktif.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E9EDF7] overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('grade')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'grade'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          Koreksi & Nilai
        </button>
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'analytics'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiActivity className="w-4 h-4" />
          Analitik Rapor Kelas
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="mt-6">
        {activeTab === 'grade' && <GradePanel />}
        {activeTab === 'analytics' && <ReportAnalytics />}
      </div>
    </div>
  );
}
