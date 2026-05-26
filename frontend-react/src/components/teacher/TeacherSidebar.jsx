import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiBookOpen, FiEdit3, FiMessageSquare } from 'react-icons/fi';

export default function TeacherSidebar() {
  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome, end: true },
    { to: '/dashboard/teacher/class-management', label: 'Manajemen Kelas', icon: FiUsers },
    { to: '/dashboard/teacher/content', label: 'Konten & Materi', icon: FiBookOpen },
    { to: '/dashboard/teacher/assessment', label: 'Penilaian', icon: FiEdit3 },
    { to: '/dashboard/teacher/communication', label: 'Komunikasi', icon: FiMessageSquare }
  ];

  return (
    <>
      <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-widest px-3 pt-4 mb-2">Teacher Actions</div>
      
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#1A73E8] rounded-l-md"></div>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </>
  );
}
