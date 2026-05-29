import { NavLink, useLocation } from 'react-router-dom';
import TeacherSidebar from '../pages/teacher/components/TeacherSidebar';
import { FiUser, FiUpload, FiUsers, FiLayers, FiGrid, FiCalendar, FiActivity, FiFileText, FiSettings, FiShield } from 'react-icons/fi';

export default function Sidebar({ role, sidebarOpen, setSidebarOpen, user, handleLogout }) {
  const location = useLocation();
  return (
    <aside className={`bg-white/70 backdrop-blur-md border-r border-white/20 w-64 h-screen flex-shrink-0 flex flex-col transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed left-0 top-0 shadow-sm`}>
      <div className="p-6 border-b border-white/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1A73E8] flex items-center justify-center font-bold text-white shadow-none">
            E
          </div>
          <span className="font-extrabold text-lg text-[#202124] tracking-wider">EduCentral</span>
        </div>
        <button className="md:hidden text-slate-500 hover:text-[#202124]" onClick={() => setSidebarOpen(false)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sidebar Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 mb-2">Main Menu</div>
        
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
              isActive
                ? 'text-[#1A73E8] bg-gray-100/70'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
                <span>Dashboard</span>
              </div>
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
              )}
            </>
          )}
        </NavLink>

        {/* Conditional Role Based Navigation */}
        {(role === 'admin' && !location.pathname.includes('/teacher/')) && (
          <>
            {/* MANAJEMEN PENGGUNA */}
            <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Manajemen Pengguna</div>
            
            <NavLink
              to="/dashboard/admin/kelola-user"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiUser className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Kelola User</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/impor-massal"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiUpload className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Impor Massal</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/orang-tua"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiUsers className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Akun Orang Tua</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            {/* MANAJEMEN SEKOLAH */}
            <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Manajemen Sekolah</div>

            <NavLink
              to="/dashboard/admin/kelola-kelas"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiLayers className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Kelola Kelas & Rombel</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/kurikulum"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiGrid className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Kurikulum & Mapel</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/kalender"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiCalendar className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Kalender Akademik</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            {/* LAPORAN & ANALITIK */}
            <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Laporan & Analitik</div>

            <NavLink
              to="/dashboard/admin/dasbor-sekolah"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiActivity className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Dasbor Sekolah</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/laporan-akademik"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiFileText className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Laporan Akademik</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            {/* KONFIGURASI SISTEM */}
            <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Konfigurasi Sistem</div>

            <NavLink
              to="/dashboard/admin/pengaturan"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiSettings className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Pengaturan Platform</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin/log-aktivitas"
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-[#1A73E8] bg-gray-100/70'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-gray-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <FiShield className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                    <span>Log Aktivitas</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
                  )}
                </>
              )}
            </NavLink>
          </>
        )}

        {(role === 'teacher' || location.pathname.includes('/teacher/')) && (
          <TeacherSidebar />
        )}

        {role === 'student' && (
          <>
            <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Student Actions</div>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100/70 text-[#5F6368] hover:text-[#202124] rounded-md transition-all">
              <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lihat Materi
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100/70 text-[#5F6368] hover:text-[#202124] rounded-md transition-all">
              <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Kerjakan Kuis
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100/70 text-[#5F6368] hover:text-[#202124] rounded-md transition-all">
              <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Rapor
            </a>
          </>
        )}

        <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">General</div>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100/70 text-[#5F6368] hover:text-[#202124] rounded-md transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </a>
      </nav>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-white/20 bg-white/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/60 border border-white/20 flex items-center justify-center font-bold text-[#1A73E8] capitalize">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#202124] truncate">{user?.name}</p>
            <p className="text-xs text-[#5F6368] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFF5F5] border border-[#FDE8E8] hover:bg-[#FDE8E8] text-[#E31A1A] font-semibold rounded-md text-sm transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
