import { useState } from 'react';
import { FiSettings, FiSave, FiLock, FiGlobe, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function PengaturanPlatform() {
  const [schoolName, setSchoolName] = useState('SMA EduCentral Hub Jakarta');
  const [address, setAddress] = useState('Jl. Jendral Sudirman No. 12, Jakarta Selatan');
  const [phone, setPhone] = useState('021-12345678');
  const [systemActive, setSystemActive] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Berhasil!',
      text: 'Konfigurasi platform berhasil diperbarui.',
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Pengaturan Platform
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Sesuaikan profil institusi sekolah, opsi penjenamaan, alamat, dan setelan operasional sistem platform.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiSettings className="text-[#4318FF] w-5 h-5" />
          Konfigurasi Umum Platform
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Sekolah / Institusi</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Lengkap</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Telepon</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Operasional Platform</label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={systemActive}
                  onChange={(e) => setSystemActive(e.target.checked)}
                  className="w-5 h-5 text-[#4318FF] focus:ring-[#4318FF] rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-[#1B254B]">Platform Aktif & Terbuka untuk Umum</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-slate-100 flex gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-none"
            >
              <FiSave /> Simpan Perubahan Setelan
            </button>
            <button
              type="button"
              className="flex items-center gap-2 bg-[#F4F7FE] hover:bg-slate-200/60 text-slate-600 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-none"
            >
              <FiLock /> Keamanan & Kredensial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
