import { useState } from 'react';
import { FiActivity, FiUser, FiInfo, FiSearch } from 'react-icons/fi';

export default function LogAktivitas() {
  const [logs, setLogs] = useState([
    { id: 1, user: 'Admin Wahab', action: 'Membuat Kelas Baru 11 RPL-B', ip: '192.168.1.10', time: '25 Mei 2026 20:30' },
    { id: 2, user: 'Admin Wahab', action: 'Mengubah Peran User Budi Santoso menjadi Teacher', ip: '192.168.1.10', time: '25 Mei 2026 19:45' },
    { id: 3, user: 'Sistem', action: 'Token Silent Rotation otomatis sukses dilakukan', ip: '127.0.0.1', time: '25 Mei 2026 19:00' }
  ]);

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Log Aktivitas & Audit Sistem
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Pantau seluruh aktivitas administratif, perubahan konfigurasi, log masuk sistem, dan audit IP untuk keamanan platform.
        </p>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiActivity className="text-rose-500 w-5 h-5 animate-pulse" />
            Riwayat Aktivitas Administratif
          </h3>
          <div className="flex items-center gap-2 bg-[#F4F7FE] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500">
            <FiSearch />
            <input type="text" placeholder="Filter log..." className="bg-transparent border-none focus:outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Aksi / Aktivitas</th>
                <th className="px-6 py-4">Alamat IP</th>
                <th className="px-6 py-4 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, index) => (
                <tr key={log.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-[#1B254B] flex items-center gap-2 pt-5">
                    <FiUser className="text-[#4318FF]" />
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs">{log.action}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="px-6 py-4 text-right text-slate-400 text-xs font-semibold">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
