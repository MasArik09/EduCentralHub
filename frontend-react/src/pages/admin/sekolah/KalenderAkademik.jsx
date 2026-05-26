import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function KalenderAkademik() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 26)); // May 2026 as default mock state
  const [events, setEvents] = useState([]);

  // Fetch events from backend-go
  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    const yVal = currentDate.getFullYear();
    const mVal = currentDate.getMonth() + 1; // 1-indexed for backend GORM extract queries
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/calendar-events?month=${mVal}&year=${yVal}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar events from backend:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Dropdown States & Refs for Interactive Month/Year Selectors
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calendar State Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Vanilla JS Date Calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  const prevMonthDaysLimit = new Date(year, month, 0).getDate();

  // Helper to format grid day as YYYY-MM-DD
  const formatGridDate = (dayNum) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${year}-${pad(month + 1)}-${pad(dayNum)}`;
  };

  // Handle click on calendar day to show/add event details
  const handleDayClick = (dayNum) => {
    const dateStr = formatGridDate(dayNum);
    const dayEvents = events.filter(e => e.date === dateStr);

    if (dayEvents.length > 0) {
      const eventsText = dayEvents.map((e, idx) => `${idx + 1}. ${e.name} (${e.type}) - Urgensi: ${e.urgency}`).join('\n');
      Swal.fire({
        title: `Agenda untuk ${dayNum} ${monthsList[month]} ${year}`,
        text: eventsText,
        icon: 'info',
        confirmButtonColor: '#1A73E8'
      });
    } else {
      Swal.fire({
        title: 'Tambah Agenda?',
        text: `Apakah Anda ingin mendaftarkan agenda baru pada tanggal ${dayNum} ${monthsList[month]}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1A73E8',
        cancelButtonColor: '#5F6368',
        confirmButtonText: 'Ya, Buat!',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Buat Agenda Baru',
            html: `
              <input id="swal-event-name" class="swal2-input" placeholder="Nama Kegiatan">
              <select id="swal-event-type" class="swal2-input">
                <option value="Akademik">Akademik</option>
                <option value="Laporan">Laporan</option>
                <option value="Libur">Libur</option>
              </select>
              <select id="swal-event-urgency" class="swal2-input">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            `,
            focusConfirm: false,
            preConfirm: () => {
              return {
                name: document.getElementById('swal-event-name').value,
                type: document.getElementById('swal-event-type').value,
                urgency: document.getElementById('swal-event-urgency').value
              }
            }
          }).then(async (res) => {
            if (res.value && res.value.name) {
              const newEv = {
                name: res.value.name,
                date: dateStr,
                type: res.value.type,
                urgency: res.value.urgency
              };
              
              const token = localStorage.getItem('token');
              try {
                await axios.post('http://localhost:8080/api/admin/calendar-events', newEv, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                Swal.fire({
                  title: 'Berhasil!',
                  text: 'Agenda baru berhasil disimpan ke database.',
                  icon: 'success',
                  confirmButtonColor: '#1A73E8'
                });
                fetchEvents();
              } catch (err) {
                console.error('Failed to save calendar event:', err);
                Swal.fire({
                  title: 'Gagal!',
                  text: 'Gagal menyimpan agenda baru ke database.',
                  icon: 'error',
                  confirmButtonColor: '#1A73E8'
                });
              }
            }
          });
        }
      });
    }
  };

  // Compile calendar grid array
  const calendarDays = [];
  
  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDaysLimit - i,
      isCurrentMonth: false,
      dateString: ''
    });
  }

  // Active month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      dateString: formatGridDate(i)
    });
  }

  // Next month leading days to complete grid 42 cells
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateString: ''
    });
  }

  // Format YYYY-MM-DD to readable Indonesian date
  const formatReadableDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = parseInt(parts[2], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parts[0];
      return `${d} ${monthsList[m]} ${y}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left pb-12">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">
          Kalender Akademik Sekolah
        </h2>
        <p className="text-[#5F6368] text-xs mt-1">
          Kelola rilis milestone penting, periode ujian akhir, rapat kurikulum, agenda libur nasional, dan tugas akademik di satu panel terintegrasi.
        </p>
      </div>

      {/* DUAL-PANEL SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width): Real-Time Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-none space-y-5">
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-50 text-[#1A73E8] flex items-center justify-center rounded-lg font-bold border border-gray-200">
                <FiCalendar />
              </div>
              <h3 className="font-bold text-[#202124] flex items-center gap-1.5 relative">
                {/* Month Dropdown Selector */}
                <span className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className="hover:text-[#1A73E8] cursor-pointer transition-colors font-bold bg-transparent border-none p-0 focus:outline-none text-[#202124]"
                  >
                    {monthsList[month]}
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                      {monthsList.map((mName, mIdx) => (
                        <button
                          key={mIdx}
                          type="button"
                          onClick={() => {
                            setCurrentDate(new Date(year, mIdx, 1));
                            setShowMonthDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${
                            mIdx === month
                              ? 'bg-[#1A73E8] text-white'
                              : 'text-[#202124] hover:bg-gray-50 hover:text-[#1A73E8]'
                          }`}
                        >
                          {mName}
                        </button>
                      ))}
                    </div>
                  )}
                </span>

                {/* Separator */}
                <span> </span>

                {/* Year Dropdown Selector */}
                <span className="relative" ref={yearDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className="hover:text-[#1A73E8] cursor-pointer transition-colors font-bold bg-transparent border-none p-0 focus:outline-none text-[#202124]"
                  >
                    {year}
                  </button>
                  {showYearDropdown && (
                    <div className="absolute left-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5 space-y-0.5">
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yVal) => (
                        <button
                          key={yVal}
                          type="button"
                          onClick={() => {
                            setCurrentDate(new Date(yVal, month, 1));
                            setShowYearDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${
                            yVal === year
                              ? 'bg-[#1A73E8] text-white'
                              : 'text-[#202124] hover:bg-gray-50 hover:text-[#1A73E8]'
                          }`}
                        >
                          {yVal}
                        </button>
                      ))}
                    </div>
                  )}
                </span>
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-gray-200 text-[#5F6368] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-center"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-gray-200 text-[#5F6368] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-center"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#5F6368] uppercase tracking-widest">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(dayTitle => (
              <div key={dayTitle} className="py-2">{dayTitle}</div>
            ))}
          </div>

          {/* 42 cells Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((cell, idx) => {
              const dateHasEvents = cell.isCurrentMonth && events.some(e => e.date === cell.dateString);
              const isToday = cell.isCurrentMonth && cell.day === 26 && month === 4 && year === 2026; // Highlight static "today" relative to mock system Date

              return (
                <div
                  key={idx}
                  onClick={() => cell.isCurrentMonth && handleDayClick(cell.day)}
                  className={`aspect-square rounded-lg flex flex-col justify-between p-2.5 transition-colors duration-150 relative ${
                    cell.isCurrentMonth
                      ? 'bg-white text-[#202124] hover:bg-gray-50 cursor-pointer border border-gray-200'
                      : 'bg-transparent text-slate-300 pointer-events-none border border-transparent'
                  } ${
                    isToday
                      ? 'ring-2 ring-[#1A73E8] ring-offset-2 font-bold bg-white'
                      : ''
                  }`}
                >
                  <span className="text-xs font-semibold">{cell.day}</span>
                  
                  {/* Event Marker Bar */}
                  {dateHasEvents && (
                    <div className="w-full flex items-center justify-center gap-1 mt-1">
                      <span className="h-1.5 w-1/2 bg-[#1A73E8] rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1/3 width): Academic Task List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
              <FiAlertCircle className="text-[#1A73E8]" /> Agenda & Tugas Terdekat
            </h3>
            <span className="text-[10px] bg-blue-50 text-[#1A73E8] px-2 py-0.5 rounded-md border border-blue-200/50 font-semibold">
              {events.length} Aktif
            </span>
          </div>

          {/* Vertikal Agenda List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-none hover:border-gray-300 transition-colors border-l-4 border-l-[#1A73E8] flex flex-col justify-between text-left"
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

      </div>
    </div>
  );
}
