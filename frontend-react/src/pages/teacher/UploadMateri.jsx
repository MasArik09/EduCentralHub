import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiBook, FiTrash2, FiLink, FiFolder } from 'react-icons/fi';

export default function UploadMateri() {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [classId, setClassId] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchMaterials();
  }, []);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data || [];
      setClasses(data);
      if (data.length > 0) {
        setClassId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Gagal memuat daftar kelas.');
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/teacher/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data || []);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title,
        description,
        file_url: fileUrl,
        class_id: parseInt(classId, 10)
      };

      await axios.post('http://localhost:8080/api/teacher/materials', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Materi pembelajaran berhasil diunggah!');
      setTitle('');
      setDescription('');
      setFileUrl('');
      fetchMaterials();
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Materi pembelajaran berhasil disimpan.',
        icon: 'success',
        background: '#FFFFFF',
        color: '#1B254B',
        confirmButtonColor: '#4318FF',
        customClass: { popup: 'rounded-3xl border border-slate-100' }
      });
    } catch (err) {
      console.error('Failed to upload material:', err);
      const errMsg = err.response?.data?.error || 'Gagal menyimpan materi pembelajaran.';
      setError(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Materi yang dihapus tidak dapat dipulihkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4318FF',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#FFFFFF',
      color: '#1B254B',
      customClass: { popup: 'rounded-3xl border border-slate-100' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
          await axios.delete(`http://localhost:8080/api/teacher/materials/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire({
            title: 'Berhasil!',
            text: 'Materi berhasil dihapus.',
            icon: 'success',
            background: '#FFFFFF',
            color: '#1B254B',
            confirmButtonColor: '#4318FF'
          });
          fetchMaterials();
        } catch (err) {
          console.error('Failed to delete material:', err);
          Swal.fire({
            title: 'Gagal!',
            text: err.response?.data?.error || 'Gagal menghapus materi.',
            icon: 'error',
            background: '#FFFFFF',
            color: '#1B254B'
          });
        }
      }
    });
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold text-[#1B254B]">
          Manajemen Materi Pembelajaran
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Unggah materi pembelajaran baru berupa tautan berkas atau tautan eksternal untuk kelas Anda.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-3">
          <span>✅ {success}</span>
        </div>
      )}

      {/* Form (Card White) */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiBook className="text-[#4318FF] w-5 h-5" />
          Form Upload Materi baru
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Materi</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Contoh: Pengenalan Aljabar Linear"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Singkat</label>
              <textarea
                rows="3"
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Tuliskan petunjuk pembelajaran atau silabus singkat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas Target</label>
              <select
                required
                className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id.toString()}>{cls.class_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan File/Link Materi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiLink />
                </span>
                <input
                  type="url"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                  placeholder="https://drive.google.com/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-3 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitLoading ? 'Menyimpan...' : 'Upload Materi'}
            </button>
          </div>
        </form>
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
        <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
          <FiFolder className="text-amber-500 w-5 h-5" />
          Daftar Materi Saya
        </h3>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Memuat materi...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Belum ada materi pembelajaran yang diunggah.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#1B254B] border-b border-slate-100 font-bold">
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Judul Materi</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-center">Tautan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m, index) => (
                  <tr key={m.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-[#1B254B]">{m.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold text-[#4318FF] bg-[#4318FF]/10 rounded-full border border-[#4318FF]/5">
                        {m.class?.class_name || 'Tidak Ada Kelas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{m.description || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:underline transition-all"
                      >
                        <FiLink />
                        Buka
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
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
