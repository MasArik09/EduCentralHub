import { NavLink } from 'react-router-dom';
import { FiBook, FiEdit3, FiHome } from 'react-icons/fi';

export default function TeacherSidebar() {
  return (
    <>
      <div className="text-xs font-semibold text-[#A3AED0] uppercase tracking-widest px-3 pt-4 mb-2">Teacher Actions</div>
      
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all text-left relative ${
            isActive
              ? 'text-[#4318FF] bg-[#F4F7FE]'
              : 'text-[#A3AED0] hover:text-[#1B254B] hover:bg-[#F4F7FE]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <FiHome className={`w-5 h-5 ${isActive ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`} />
              <span>Dashboard</span>
            </div>
            {isActive && (
              <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
            )}
          </>
        )}
      </NavLink>

      <NavLink
        to="/dashboard/upload-materi"
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all text-left relative ${
            isActive
              ? 'text-[#4318FF] bg-[#F4F7FE]'
              : 'text-[#A3AED0] hover:text-[#1B254B] hover:bg-[#F4F7FE]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <FiBook className={`w-5 h-5 ${isActive ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`} />
              <span>Upload Materi</span>
            </div>
            {isActive && (
              <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
            )}
          </>
        )}
      </NavLink>

      <NavLink
        to="/dashboard/buat-kuis"
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all text-left relative ${
            isActive
              ? 'text-[#4318FF] bg-[#F4F7FE]'
              : 'text-[#A3AED0] hover:text-[#1B254B] hover:bg-[#F4F7FE]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <FiEdit3 className={`w-5 h-5 ${isActive ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`} />
              <span>Buat Kuis</span>
            </div>
            {isActive && (
              <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-l-md"></div>
            )}
          </>
        )}
      </NavLink>
    </>
  );
}
