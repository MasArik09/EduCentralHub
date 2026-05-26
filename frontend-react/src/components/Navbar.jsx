export default function Navbar({ role, setRole, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="h-20 bg-white/40 backdrop-blur-md px-6 flex justify-between items-center shrink-0 z-30 sticky top-0 border-b border-white/20 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-slate-500 hover:text-[#202124] cursor-pointer" 
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-[#5F6368]">
          <span>Pages</span>
          <span>/</span>
          <span className="text-[#202124] font-semibold capitalize">Dashboard ({role})</span>
        </div>
      </div>
 
      <div className="flex items-center gap-4">
        {/* DEV TOOL: Role switcher dropdown */}
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 shadow-sm">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dev Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#1A73E8] focus:outline-none cursor-pointer border-none py-0 pr-6"
          >
            <option value="student" className="bg-white text-[#202124]">Student</option>
            <option value="teacher" className="bg-white text-[#202124]">Teacher</option>
            <option value="admin" className="bg-white text-[#202124]">Admin</option>
          </select>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Role Badge */}
        <span className={`px-3 py-1 text-xs font-bold rounded-md capitalize ${
          role === 'admin'
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : role === 'teacher'
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {role}
        </span>
      </div>
    </header>
  );
}
