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
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">
          Manajemen Kelas & Siswa
        </h2>
        <p className="text-[#5F6368] text-xs mt-1">
          Kelola kelas, atur jadwal mingguan, lakukan absensi online harian, dan siarkan pengumuman broadcast kepada siswa Anda.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 px-2 bg-transparent -mb-[2px] ${
            activeTab === 'classes'
              ? 'text-[#1A73E8] border-[#1A73E8]'
              : 'text-[#5F6368] hover:text-[#202124] border-transparent'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          Kelola Kelas
        </button>
        
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 px-2 bg-transparent -mb-[2px] ${
            activeTab === 'attendance'
              ? 'text-[#1A73E8] border-[#1A73E8]'
              : 'text-[#5F6368] hover:text-[#202124] border-transparent'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          Absensi Online
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 px-2 bg-transparent -mb-[2px] ${
            activeTab === 'announcements'
              ? 'text-[#1A73E8] border-[#1A73E8]'
              : 'text-[#5F6368] hover:text-[#202124] border-transparent'
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
