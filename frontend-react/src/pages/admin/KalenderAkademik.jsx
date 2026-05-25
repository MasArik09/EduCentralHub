import { useState } from 'react';
import { FiCalendar, FiPlus, FiTrash2, FiClock, FiActivity } from 'react-icons/fi';

export default function KalenderAkademik() {
  const [events, setEvents] = useState([
    { id: 1, name: 'Ujian Tengah Semester Ganjil', date: '12 Okt 2026 - 20 Okt 2026', type: 'Akademik' },
    { id: 2, name: 'Pembagian Rapor Semester Ganjil', date: '18 Des 2026', type: 'Laporan' },
    { id: 3, name: 'Libur Akhir Semester Ganjil', date: '21 Des 2026 - 02 Jan 2027', type: 'Libur Nasional' }
  ]);

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Kalender Akademik
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Atur milestones penting, periode ujian, libur nasional, dan agenda kegiatan sekolah sepanjang tahun.
        </p>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiCalendar className="text-[#4318FF] w-5 h-5" />
            Agenda & Kegiatan Akademik
          </h3>
          <button className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-none">
            <FiPlus /> Tambah Agenda Baru
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Tanggal Pelaksanaan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event, index) => (
                <tr key={event.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-[#1B254B]">{event.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 flex items-center gap-1.5 pt-5">
                    <FiClock className="text-[#4318FF]" />
                    {event.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                      event.type === 'Akademik'
                        ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
                        : event.type === 'Laporan'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                        : 'text-amber-600 bg-amber-50 border-amber-200'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all border-none cursor-pointer">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
