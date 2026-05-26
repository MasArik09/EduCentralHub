import { FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * AgendaSidebar — Right-side panel listing all events for the current month.
 *
 * Props:
 * - events: Array of event objects from backend
 * - formatReadableDate: Helper to format 'YYYY-MM-DD' → '26 Mei 2026'
 */
export default function AgendaSidebar({ events, formatReadableDate }) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
          <FiAlertCircle className="text-[#1A73E8]" /> Agenda & Tugas Terdekat
        </h3>
        <span className="text-[10px] bg-blue-50 text-[#1A73E8] px-2 py-0.5 rounded-md border border-blue-200/50 font-semibold">
          {events.length} Aktif
        </span>
      </div>

      {/* Scrollable Agenda List */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-sm hover:bg-white/90 hover:border-white/30 transition-colors border-l-4 border-l-[#1A73E8] flex flex-col justify-between text-left"
          >
            <div>
              <h4 className="text-xs font-bold text-[#202124] leading-snug line-clamp-2">
                {event.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6368] mt-2">
                <FiClock /> {formatReadableDate(event.date)}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                event.type === 'Akademik'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : event.type === 'Laporan'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {event.type}
              </span>

              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                event.urgency === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : event.urgency === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {event.urgency} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
