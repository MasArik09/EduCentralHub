import { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiShield } from 'react-icons/fi';
import axios from 'axios';

export default function AkunOrangTua() {
  const [parents, setParents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/admin/parents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) {
        setParents(res.data);
      }
    })
    .catch(err => {
      console.error("Failed to fetch parents from backend Go:", err);
    });
  }, []);

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Manajemen Akun Orang Tua
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Kelola kredensial akses orang tua/wali siswa untuk pemantauan akademis secara terintegrasi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center font-bold">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#1B254B]">{parents.length}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Wali Terdaftar</div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiShield className="text-emerald-500 w-5 h-5" />
            Daftar Orang Tua / Wali
          </h3>
          <button className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-none">
            <FiPlus /> Hubungkan Wali Baru
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Nama Wali</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Siswa Binaan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parents.map((parent, index) => (
                <tr key={parent.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-[#1B254B]">{parent.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 space-y-1">
                    <div>📧 {parent.email}</div>
                    <div>📞 {parent.whatsapp || parent.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200/50">
                      {parent.student ? `${parent.student.name} (NIS: ${parent.student.nis})` : 'Belum Dihubungkan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 bg-[#F4F7FE] text-slate-600 hover:text-[#4318FF] rounded-lg transition-all border-none cursor-pointer">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
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
