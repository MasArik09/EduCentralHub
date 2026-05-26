import { useState } from 'react';
import GradePanel from './GradePanel';
import ReportAnalytics from './ReportAnalytics';
import { FiCheckSquare, FiActivity } from 'react-icons/fi';

export default function Assessment() {
  const [activeTab, setActiveTab] = useState('grade');

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Module Title */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">
          Penilaian & Evaluasi Belajar
        </h2>
        <p className="text-[#5F6368] text-xs mt-1">
          Koreksi tugas siswa dengan umpan balik terperinci, berikan nilai, dan pantau performa rata-rata kelas lewat grafik analitik interaktif.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('grade')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 px-2 bg-transparent -mb-[2px] ${
            activeTab === 'grade'
              ? 'text-[#1A73E8] border-[#1A73E8]'
              : 'text-[#5F6368] hover:text-[#202124] border-transparent'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          Koreksi & Nilai
        </button>
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 px-2 bg-transparent -mb-[2px] ${
            activeTab === 'analytics'
              ? 'text-[#1A73E8] border-[#1A73E8]'
              : 'text-[#5F6368] hover:text-[#202124] border-transparent'
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
