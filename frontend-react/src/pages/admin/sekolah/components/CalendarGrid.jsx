import { FiClock } from 'react-icons/fi';

/**
 * CalendarGrid — Renders the 42-cell monthly calendar grid with event badges.
 *
 * Props:
 * - calendarDays: Array of { day, isCurrentMonth, dateString }
 * - events: Array of event objects from backend
 * - year, month: Current calendar year and month index
 * - formatToISODate: Helper to normalize dates to 'YYYY-MM-DD'
 * - onDayClick: Callback when an active day cell is clicked
 */
export default function CalendarGrid({ calendarDays, events, year, month, formatToISODate, onDayClick }) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {calendarDays.map((cell, idx) => {
        // Match events to this cell using timezone-safe ISO date comparison
        const dayEvents = cell.isCurrentMonth
          ? events.filter(e => {
              const agendaTarget = formatToISODate(e.date || e.tanggal_pelaksanaan);
              const cellTarget = formatToISODate(cell.dateString);
              return agendaTarget === cellTarget && agendaTarget !== '';
            })
          : [];

        const isToday = cell.isCurrentMonth && cell.day === 26 && month === 4 && year === 2026;

        return (
          <div
            key={idx}
            onClick={() => cell.isCurrentMonth && onDayClick(cell.day)}
            className={`min-h-[80px] lg:min-h-[96px] rounded-lg flex flex-col justify-between p-2 transition-colors duration-150 relative ${
              cell.isCurrentMonth
                ? 'bg-white/70 backdrop-blur-sm text-[#202124] hover:bg-white/90 cursor-pointer border border-white/20 shadow-sm'
                : 'bg-transparent text-slate-300 pointer-events-none border border-transparent'
            } ${
              isToday
                ? 'ring-2 ring-[#1A73E8] ring-offset-2 font-bold bg-white/80 backdrop-blur-sm'
                : ''
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-semibold">{cell.day}</span>
            </div>

            {/* Event Badges — show max 2, overflow count */}
            <div className="w-full flex flex-col gap-1 mt-1 overflow-hidden flex-grow justify-end">
              {dayEvents.slice(0, 2).map((e, eIdx) => {
                const isHoliday = e.type === 'Libur' || e.type === 'Libur Nasional';
                const badgeClass = isHoliday
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : e.type === 'Akademik'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : e.type === 'Laporan'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100';

                return (
                  <div
                    key={eIdx}
                    title={e.name}
                    className={`text-[9px] font-medium px-1 py-0.5 rounded-sm truncate w-full ${badgeClass}`}
                  >
                    {e.name}
                  </div>
                );
              })}
              {dayEvents.length > 2 && (
                <div className="text-[8px] font-semibold text-[#5F6368] pl-0.5">
                  +{dayEvents.length - 2} lainnya
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
