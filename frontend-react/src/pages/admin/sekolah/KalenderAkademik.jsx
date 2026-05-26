import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Modular sub-components (extracted to keep parent under 300 lines)
import CalendarGrid from './components/CalendarGrid';
import EventDetailModal from './components/EventDetailModal';
import AgendaSidebar from './components/AgendaSidebar';

/**
 * KalenderAkademik — Main academic calendar page.
 * Orchestrates state management, API calls, and renders three sub-components:
 * CalendarGrid, EventDetailModal, and AgendaSidebar.
 */
export default function KalenderAkademik() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 26));
  const [events, setEvents] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal & form state
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDayNum, setSelectedDayNum] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState('Akademik');
  const [newEventUrgency, setNewEventUrgency] = useState('Medium');
  const [toast, setToast] = useState(null);

  // Dropdown state for month/year selectors
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // ── API: Sync national holidays ──
  const handleSyncHolidays = async () => {
    setIsSyncing(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:8080/api/admin/calendar-events/sync', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(response.data.message || 'Hari libur nasional berhasil disinkronisasi.', 'success');
      await fetchEvents();
    } catch {
      showToast('Gagal mensinkronisasi hari libur nasional.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // ── API: Fetch calendar events for current month ──
  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    const yVal = currentDate.getFullYear();
    const mVal = currentDate.getMonth() + 1;
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/calendar-events?month=${mVal}&year=${yVal}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sanitize Idul Adha 2026 date error from API
      const sanitizedData = (response.data || []).map(event => {
        const eventName = event.name || '';
        const eventDate = event.date || event.tanggal_pelaksanaan || '';
        if (eventName.toLowerCase().includes('idul adha')) {
          if (eventDate.startsWith('2026-05-14')) return { ...event, date: '2026-05-27', tanggal_pelaksanaan: '2026-05-27' };
          if (eventDate.startsWith('2026-05-15')) return { ...event, date: '2026-05-28', tanggal_pelaksanaan: '2026-05-28' };
        }
        return event;
      });
      setEvents(sanitizedData);
    } catch {
      // Silently fail — events will remain empty
    }
  };

  useEffect(() => { fetchEvents(); }, [currentDate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) setShowMonthDropdown(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) setShowYearDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Date helpers ──

  /** Formats a day number into 'YYYY-MM-DD' for the current calendar month */
  const formatGridDate = (dayNum) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${year}-${pad(month + 1)}-${pad(dayNum)}`;
  };

  /**
   * Normalizes any date input (string or Date) into a pure 'YYYY-MM-DD' string.
   * Extracts the date substring directly from ISO strings to avoid timezone shifts.
   */
  const formatToISODate = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') {
      const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  };

  /** Converts 'YYYY-MM-DD' to readable Indonesian date like '26 Mei 2026' */
  const formatReadableDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      return `${parseInt(parts[2], 10)} ${monthsList[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    } catch { return dateStr; }
  };

  // ── Day click handler ──
  const handleDayClick = (dayNum) => {
    const dateStr = formatGridDate(dayNum);
    const dayEvents = events.filter(e => {
      const a = formatToISODate(e.date || e.tanggal_pelaksanaan);
      const b = formatToISODate(dateStr);
      return a === b && a !== '';
    });
    setSelectedDateEvents(dayEvents);
    setSelectedDayNum(dayNum);
    setIsDetailModalOpen(true);
    setNewEventName('');
    setNewEventType('Akademik');
    setNewEventUrgency('Medium');
    setShowAddForm(false);
  };

  // ── Create event handler ──
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventName.trim()) return;
    const dateStr = formatGridDate(selectedDayNum);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/admin/calendar-events', {
        name: newEventName, date: dateStr, type: newEventType, urgency: newEventUrgency
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Agenda baru berhasil disimpan.', 'success');
      setNewEventName('');
      setShowAddForm(false);
      // Re-fetch and update both grid and modal
      const mVal = currentDate.getMonth() + 1;
      const response = await axios.get(`http://localhost:8080/api/admin/calendar-events?month=${mVal}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allEvents = response.data || [];
      setEvents(allEvents);
      setSelectedDateEvents(allEvents.filter(ev => formatToISODate(ev.date || ev.tanggal_pelaksanaan) === formatToISODate(dateStr)));
    } catch {
      showToast('Gagal menyimpan agenda baru.', 'error');
    }
  };

  // ── Build 42-cell calendar grid ──
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDaysLimit = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) calendarDays.push({ day: prevMonthDaysLimit - i, isCurrentMonth: false, dateString: '' });
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push({ day: i, isCurrentMonth: true, dateString: formatGridDate(i) });
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) calendarDays.push({ day: i, isCurrentMonth: false, dateString: '' });

  return (
    <div className="w-full bg-transparent space-y-6 text-left pb-12">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#202124]">Kalender Akademik Sekolah</h2>
          <p className="text-[#5F6368] text-xs mt-1">Kelola rilis milestone penting, periode ujian, rapat kurikulum, agenda libur nasional, dan tugas akademik.</p>
        </div>
        <button onClick={handleSyncHolidays} disabled={isSyncing} className="border border-white/20 hover:bg-white/80 text-sm text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 font-semibold transition-colors duration-150 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm">
          {isSyncing ? 'Mensinkronisasi...' : 'Sinkronisasi Libur Nasional'}
        </button>
      </div>

      {/* Dual-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar Grid */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-white/20 rounded-lg p-6 shadow-sm space-y-5">
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-50 text-[#1A73E8] flex items-center justify-center rounded-lg font-bold border border-gray-200"><FiCalendar /></div>
              <h3 className="font-bold text-[#202124] flex items-center gap-1.5 relative">
                {/* Month Dropdown */}
                <span className="relative" ref={monthDropdownRef}>
                  <button type="button" onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); }} className="hover:text-[#1A73E8] cursor-pointer transition-colors font-bold bg-transparent border-none p-0 focus:outline-none text-[#202124]">{monthsList[month]}</button>
                  {showMonthDropdown && (
                    <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                      {monthsList.map((mName, mIdx) => (
                        <button key={mIdx} type="button" onClick={() => { setCurrentDate(new Date(year, mIdx, 1)); setShowMonthDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${mIdx === month ? 'bg-[#1A73E8] text-white' : 'text-[#202124] hover:bg-gray-50 hover:text-[#1A73E8]'}`}>{mName}</button>
                      ))}
                    </div>
                  )}
                </span>
                <span> </span>
                {/* Year Dropdown */}
                <span className="relative" ref={yearDropdownRef}>
                  <button type="button" onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); }} className="hover:text-[#1A73E8] cursor-pointer transition-colors font-bold bg-transparent border-none p-0 focus:outline-none text-[#202124]">{year}</button>
                  {showYearDropdown && (
                    <div className="absolute left-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5 space-y-0.5">
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yVal) => (
                        <button key={yVal} type="button" onClick={() => { setCurrentDate(new Date(yVal, month, 1)); setShowYearDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${yVal === year ? 'bg-[#1A73E8] text-white' : 'text-[#202124] hover:bg-gray-50 hover:text-[#1A73E8]'}`}>{yVal}</button>
                      ))}
                    </div>
                  )}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 border border-gray-200 text-[#5F6368] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-center"><FiChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 border border-gray-200 text-[#5F6368] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-center"><FiChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#5F6368] uppercase tracking-widest">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="py-2">{d}</div>)}
          </div>

          {/* Calendar Grid (sub-component) */}
          <CalendarGrid calendarDays={calendarDays} events={events} year={year} month={month} formatToISODate={formatToISODate} onDayClick={handleDayClick} />
        </div>

        {/* Right: Agenda Sidebar (sub-component) */}
        <AgendaSidebar events={events} formatReadableDate={formatReadableDate} />
      </div>

      {/* Event Detail Modal (sub-component) */}
      <EventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setShowAddForm(false); }}
        selectedDayNum={selectedDayNum}
        monthName={monthsList[month]}
        year={year}
        selectedDateEvents={selectedDateEvents}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        newEventName={newEventName}
        setNewEventName={setNewEventName}
        newEventType={newEventType}
        setNewEventType={setNewEventType}
        newEventUrgency={newEventUrgency}
        setNewEventUrgency={setNewEventUrgency}
        onCreateEvent={handleCreateEvent}
        formatReadableDate={formatReadableDate}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md animate-fade-in transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'}`}>
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
