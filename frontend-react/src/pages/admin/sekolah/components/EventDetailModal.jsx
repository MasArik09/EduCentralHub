import { FiClock } from 'react-icons/fi';

/**
 * EventDetailModal — Glassmorphic modal for viewing/creating agenda on a specific day.
 *
 * Props:
 * - isOpen: Boolean controlling modal visibility
 * - onClose: Callback to close the modal
 * - selectedDayNum: The day number clicked (1-31)
 * - monthName: Current month name string (e.g. "Mei")
 * - year: Current year number
 * - selectedDateEvents: Array of events matching the selected day
 * - showAddForm / setShowAddForm: Boolean + setter for inline form toggle
 * - newEventName / setNewEventName: String + setter for form input
 * - newEventType / setNewEventType: String + setter for category select
 * - newEventUrgency / setNewEventUrgency: String + setter for priority select
 * - onCreateEvent: Async form submit handler
 * - formatReadableDate: Helper to format 'YYYY-MM-DD' → '26 Mei 2026'
 */
export default function EventDetailModal({
  isOpen,
  onClose,
  selectedDayNum,
  monthName,
  year,
  selectedDateEvents,
  showAddForm,
  setShowAddForm,
  newEventName,
  setNewEventName,
  newEventType,
  setNewEventType,
  newEventUrgency,
  setNewEventUrgency,
  onCreateEvent,
  formatReadableDate,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[3px] flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-xl shadow-2xl w-full max-w-md text-left animate-fade-in flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-[#1B254B]">
              Agenda - {selectedDayNum} {monthName} {year}
            </h3>
            <p className="text-[10px] text-[#5F6368] font-medium mt-0.5">
              Format Tanggal: {String(selectedDayNum).padStart(2, '0')}-{monthName}-{year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 flex-grow pr-1 mb-5">
          {showAddForm ? (
            <form onSubmit={onCreateEvent} className="space-y-4 bg-white/40 p-4 border border-white/30 rounded-lg backdrop-blur-sm">
              <div className="text-xs font-bold text-[#1B254B] uppercase tracking-wider mb-2">Buat Agenda Baru</div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#5F6368] uppercase">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama kegiatan..."
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A73E8] bg-white/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5F6368] uppercase">Kategori</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white/80"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Laporan">Laporan</option>
                    <option value="Libur">Libur</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5F6368] uppercase">Prioritas</label>
                  <select
                    value={newEventUrgency}
                    onChange={(e) => setNewEventUrgency(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white/80"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                {selectedDateEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white/60 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white border-none cursor-pointer shadow-sm"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          ) : selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event, idx) => {
                const isHoliday = event.type === 'Libur' || event.type === 'Libur Nasional';
                const accentClass = isHoliday
                  ? 'border-l-red-500'
                  : event.type === 'Akademik'
                  ? 'border-l-indigo-500'
                  : event.type === 'Laporan'
                  ? 'border-l-emerald-500'
                  : 'border-l-blue-500';

                return (
                  <div
                    key={event.id || idx}
                    className={`bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg p-3.5 shadow-sm border-l-4 ${accentClass} flex flex-col gap-1.5 text-left`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-bold text-[#202124] leading-snug">{event.name}</h4>
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full border shrink-0 ${
                        event.urgency === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : event.urgency === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {event.urgency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5F6368] font-semibold pt-1.5 border-t border-white/10">
                      <span className="flex items-center gap-1">
                        <FiClock /> {formatReadableDate(event.date)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md ${
                        event.type === 'Akademik' ? 'bg-indigo-50/70 text-indigo-700'
                          : event.type === 'Laporan' ? 'bg-emerald-50/70 text-emerald-700'
                          : 'bg-red-50/70 text-red-700'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3 bg-white/30 border border-white/10 rounded-lg p-4">
              <p className="text-xs text-[#5F6368] font-medium">Belum ada agenda terdaftar untuk hari ini.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white border-none cursor-pointer shadow-sm"
              >
                + Buat Agenda Baru
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 pt-4 flex justify-between items-center bg-transparent shrink-0">
          {selectedDateEvents.length > 0 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white transition-all cursor-pointer border-none shadow-sm"
            >
              + Tambah Agenda
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50/80 transition-all cursor-pointer bg-white/80"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
