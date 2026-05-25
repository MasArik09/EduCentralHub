import { useState } from 'react';
import { FiBookOpen, FiPlus, FiTrash2, FiEdit2, FiTag } from 'react-icons/fi';

export default function KurikulumMapel() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Matematika Wajib', code: 'MTK-10', curriculum: 'Kurikulum Merdeka', hours: '4 JP / Minggu' },
    { id: 2, name: 'Fisika Peminatan', code: 'FIS-11', curriculum: 'Kurikulum Merdeka', hours: '3 JP / Minggu' },
    { id: 3, name: 'Bahasa Inggris', code: 'ING-10', curriculum: 'Kurikulum Merdeka', hours: '2 JP / Minggu' }
  ]);

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Kurikulum & Mata Pelajaran
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Rancang silabus kurikulum akademik, kelola mata pelajaran, dan tentukan alokasi Jam Pelajaran (JP).
        </p>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiBookOpen className="text-[#4318FF] w-5 h-5" />
            Struktur Mata Pelajaran Aktif
          </h3>
          <button className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-none">
            <FiPlus /> Tambah Mapel Baru
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Kode Mapel</th>
                <th className="px-6 py-4">Nama Mata Pelajaran</th>
                <th className="px-6 py-4">Kurikulum</th>
                <th className="px-6 py-4">Alokasi Waktu</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject, index) => (
                <tr key={subject.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">{subject.code}</td>
                  <td className="px-6 py-4 font-semibold text-[#1B254B]">{subject.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200/50">
                      {subject.curriculum}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 flex items-center gap-1.5 pt-5">
                    <FiTag className="text-[#4318FF]" />
                    {subject.hours}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-[#F4F7FE] text-slate-600 hover:text-[#4318FF] rounded-lg transition-all border-none cursor-pointer">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all border-none cursor-pointer">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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
