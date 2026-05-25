export default function Navbar({ role, setRole, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="h-20 bg-white border-b border-[#E9EDF7] px-6 flex justify-between items-center shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-slate-500 hover:text-[#1B254B] cursor-pointer" 
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-[#A3AED0]">
          <span>Pages</span>
          <span>/</span>
          <span className="text-[#1B254B] font-semibold capitalize">Dashboard ({role})</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* DEV TOOL: Role switcher dropdown */}
        <div className="flex items-center gap-2 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3 py-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dev Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#4318FF] focus:outline-none cursor-pointer border-none py-0 pr-6"
          >
            <option value="student" className="bg-white text-[#1B254B]">Student</option>
            <option value="teacher" className="bg-white text-[#1B254B]">Teacher</option>
            <option value="admin" className="bg-white text-[#1B254B]">Admin</option>
          </select>
        </div>

        <div className="h-8 w-px bg-[#E9EDF7]"></div>

        {/* Role Badge */}
        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
          role === 'admin'
            ? 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]'
            : role === 'teacher'
            ? 'bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE]'
            : 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
        }`}>
          {role}
        </span>
      </div>
    </header>
  );
}
