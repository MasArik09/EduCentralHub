import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiBook, FiTrash2, FiLink, FiFolder, FiEye, FiVideo, FiFileText } from 'react-icons/fi';

export default function UploadMateri() {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('Link');
  const [fileUrl, setFileUrl] = useState('');
  const [classCode, setClassCode] = useState('');

  useEffect(() => {
    const savedClasses = localStorage.getItem('teacher_classes');
    const savedMaterials = localStorage.getItem('teacher_materials');

    const defaultClasses = [
      { id: 1, code: 'MAT-7A', name: 'Matematika VII-A' },
      { id: 2, code: 'FIS-8B', name: 'Fisika VIII-B' }
    ];

    const defaultMaterials = [
      { id: 1, classCode: 'MAT-7A', title: 'Modul Persamaan Linier Satu Variabel', type: 'PDF', file_url: 'https://educentral.hub/files/aljabar.pdf', description: 'Silakan unduh dan pelajari materi dasar aljabar ini sebelum hari Senin.' },
      { id: 2, classCode: 'FIS-8B', title: 'Video Pengenalan Hukum Termodinamika', type: 'Video', file_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Video penjelasan mengenai hukum ke-0, ke-1, dan ke-2 termodinamika.' }
    ];

    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      localStorage.setItem('teacher_classes', JSON.stringify(defaultClasses));
      setClasses(defaultClasses);
    }

    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    } else {
      localStorage.setItem('teacher_materials', JSON.stringify(defaultMaterials));
      setMaterials(defaultMaterials);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !fileUrl || !classCode) return;

    const newMaterial = {
      id: Date.now(),
      classCode,
      title,
      type: materialType,
      file_url: fileUrl,
      description
    };

    const updated = [newMaterial, ...materials];
    setMaterials(updated);
    localStorage.setItem('teacher_materials', JSON.stringify(updated));

    Swal.fire({
      title: 'Materi Diunggah!',
      text: `Materi "${title}" berhasil dibagikan ke kelas ${classCode}.`,
      icon: 'success',
      confirmButtonColor: '#4318FF'
    });

    setTitle('');
    setDescription('');
    setFileUrl('');
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Materi?',
      text: 'Materi yang dihapus tidak dapat diakses lagi oleh siswa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E31A1A',
      cancelButtonColor: '#A3AED0',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = materials.filter(m => m.id !== id);
        setMaterials(updated);
        localStorage.setItem('teacher_materials', JSON.stringify(updated));
        Swal.fire('Terhapus!', 'Materi berhasil dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Upload Form and Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm lg:col-span-7 space-y-4">
          <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
            <FiBook className="text-[#4318FF] w-5 h-5" />
            Upload Materi Baru
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                  placeholder="Contoh: Modul Limit Fungsi Aljabar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kelas Sasaran</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Format Materi</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm cursor-pointer"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                >
                  <option value="Link">Link Eksternal</option>
                  <option value="PDF">Dokumen PDF</option>
                  <option value="Video">Video Youtube</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tautan / URL Materi</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                  placeholder="https://drive.google.com/... atau https://youtube.com/embed/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Petunjuk Pembelajaran</label>
              <textarea
                rows="2"
                className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/80 rounded-xl text-[#1B254B] focus:outline-none focus:border-[#4318FF] text-sm"
                placeholder="Tuliskan catatan singkat instruksi belajar siswa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all cursor-pointer border-none mt-2"
            >
              Upload Materi
            </button>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-extrabold text-[#1B254B] flex items-center gap-2">
              <FiEye className="text-amber-500 w-5 h-5" />
              Live Preview
            </h3>
            
            <div className="mt-4 p-4 border border-[#E0E5F2] bg-[#F8FAFC] rounded-2xl flex-1 flex flex-col items-center justify-center min-h-[160px] text-center">
              {fileUrl ? (
                <div className="w-full space-y-3">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    {materialType} Preview
                  </span>
                  
                  {materialType === 'Video' && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                      {fileUrl.includes('embed') ? (
                        <iframe
                          className="w-full h-full"
                          src={fileUrl}
                          title="YouTube video player"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="text-white space-y-1 flex flex-col items-center">
                          <FiVideo className="w-10 h-10 text-rose-500 animate-pulse" />
                          <span className="text-xs font-semibold">Video Youtube Mockup Player</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{fileUrl}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {materialType === 'PDF' && (
                    <div className="w-full p-4 border border-[#E9EDF7] bg-white rounded-xl flex items-center gap-3 text-left">
                      <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 text-2xl shrink-0">
                        <FiFileText />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#1B254B] truncate">{title || 'Dokumen Tanpa Judul'}</h4>
                        <p className="text-xs text-slate-400 truncate">{fileUrl}</p>
                      </div>
                    </div>
                  )}

                  {materialType === 'Link' && (
                    <div className="w-full p-4 border border-[#E9EDF7] bg-white rounded-xl flex items-center gap-3 text-left">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-2xl shrink-0">
                        <FiLink />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#1B254B] truncate">{title || 'Tautan Eksternal'}</h4>
                        <p className="text-xs text-slate-400 truncate">{fileUrl}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs font-medium text-slate-500 text-left line-clamp-2">
                    {description || 'Belum ada petunjuk pembelajaran.'}
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 text-xs">
                  <FiFolder className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Isi form di samping dengan URL materi untuk melihat Live Preview di sini.
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 text-center block mt-2">
            *Preview secara dinamis memetakan format visual PDF, Video Player, dan Tautan Web.
          </span>
        </div>
      </div>

      {/* Materials List Table */}
      <div className="bg-white p-6 border border-[#E9EDF7] rounded-3xl shadow-sm space-y-4">
        <h3 className="text-md font-extrabold text-[#1B254B]">Daftar Materi Pembelajaran Saya</h3>
        {materials.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
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
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Catatan</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m, index) => (
                  <tr key={m.id} className="hover:bg-[#F4F7FE]/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1B254B]">{m.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{m.file_url}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{m.classCode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${
                        m.type === 'Video'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : m.type === 'PDF'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{m.description || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#F4F7FE] text-[#4318FF] hover:bg-[#4318FF] hover:text-white rounded-lg transition-all flex items-center justify-center"
                        >
                          <FiLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border-none cursor-pointer flex items-center justify-center"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
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
