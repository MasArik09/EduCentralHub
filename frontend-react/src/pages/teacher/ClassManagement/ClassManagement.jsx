import { useState } from 'react';
import ClassList from './ClassList';
import Attendance from './Attendance';
import Announcements from './Announcements';
import { FiUsers, FiCheckSquare, FiBell } from 'react-icons/fi';

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState('classes');

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Module Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Manajemen Kelas & Siswa
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Kelola kelas, atur jadwal mingguan, lakukan absensi online harian, dan siarkan pengumuman broadcast kepada siswa Anda.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E9EDF7] overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'classes'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          Kelola Kelas
        </button>
        
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'attendance'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          Absensi Online
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer border-none px-2 ${
            activeTab === 'announcements'
              ? 'text-[#4318FF] border-[#4318FF]'
              : 'text-[#A3AED0] hover:text-[#1B254B] border-transparent'
          }`}
        >
          <FiBell className="w-4 h-4" />
          Pengumuman Broadcast
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="mt-6">
        {activeTab === 'classes' && <ClassList />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'announcements' && <Announcements />}
      </div>
    </div>
  );
}
