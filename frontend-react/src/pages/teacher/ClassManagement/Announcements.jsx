import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiBell, FiTrash2, FiSend } from 'react-icons/fi';

export default function Announcements() {
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Form State
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load classes and announcements from localStorage
    const savedClasses = localStorage.getItem('teacher_classes');
    const savedAnnouncements = localStorage.getItem('teacher_announcements');

    const defaultAnnouncements = [
      { id: 1, classCode: 'MAT-7A', title: 'Ulangan Harian Bab 1', message: 'Persiapkan diri kalian untuk ulangan harian matematika bab 1 hari Senin depan mengenai persamaan linier satu variabel.', date: '2026-05-25' },
      { id: 2, classCode: 'FIS-8B', title: 'Tugas Mandiri Termodinamika', message: 'Tolong kumpulkan hasil laporan eksperimen termodinamika kalian di folder kuis sebelum hari Jumat jam 23:59.', date: '2026-05-24' }
    ];

    if (savedClasses) setClasses(JSON.parse(savedClasses));
    
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    } else {
      localStorage.setItem('teacher_announcements', JSON.stringify(defaultAnnouncements));
      setAnnouncements(defaultAnnouncements);
    }
  }, []);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!selectedClassCode || !title || !message) return;

    const classExists = classes.find(c => c.code === selectedClassCode);

    const newAnnouncement = {
      id: Date.now(),
      classCode: selectedClassCode,
      title,
      message,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('teacher_announcements', JSON.stringify(updatedAnnouncements));

    Swal.fire({
      title: 'Pesan Disiarkan!',
      text: `Pengumuman berhasil dikirim ke seluruh siswa kelas ${classExists?.name || selectedClassCode}.`,
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });

    setTitle('');
    setMessage('');
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Pengumuman?',
      text: 'Pengumuman yang dihapus tidak akan terlihat lagi oleh siswa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E31A1A',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = announcements.filter(a => a.id !== id);
        setAnnouncements(updated);
        localStorage.setItem('teacher_announcements', JSON.stringify(updated));
        Swal.fire('Terhapus!', 'Pengumuman berhasil dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Broadcast Form */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiBell className="text-[#4318FF] w-5 h-5" />
          Broadcast Pengumuman Baru
        </h3>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kelas Sasaran</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                value={selectedClassCode}
                onChange={(e) => setSelectedClassCode(e.target.value)}
              >
                <option value="">-- Pilih Kelas Sasaran --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subjek / Topik</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Info Pengumpulan Tugas Mandiri"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pesan Pengumuman</label>
            <textarea
              required
              rows="4"
              className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
              placeholder="Tuliskan isi pesan detail pengumuman yang ingin disiarkan ke kelas..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#4318FF] hover:bg-[#3311CC] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#4318FF]/10 border-none cursor-pointer"
            >
              <FiSend /> Broadcast Sekarang
            </button>
          </div>
        </form>
      </div>

      {/* History of Announcements */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B]">Riwayat Broadcast Pengumuman</h3>
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Belum ada pengumuman yang disiarkan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Subjek</th>
                  <th className="px-6 py-4">Isi Pesan</th>
                  <th className="px-6 py-4">Tanggal Kirim</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((ann, index) => (
                  <tr key={ann.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold text-[#4318FF] bg-[#4318FF]/10 rounded-full border border-[#4318FF]/5">
                        {ann.classCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1B254B]">{ann.title}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-sm truncate">{ann.message}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{ann.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center border-none"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
