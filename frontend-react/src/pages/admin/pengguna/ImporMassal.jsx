import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAlertTriangle, FiX, FiCheckCircle } from 'react-icons/fi';

// Modular sub-components (extracted to keep parent under 300 lines)
import CsvDropZone from './components/CsvDropZone';
import PreviewTable from './components/PreviewTable';

/**
 * ImporMassal — Bulk student import page.
 * Handles CSV parsing, inline WhatsApp editing, and multipart upload to backend.
 */
export default function ImporMassal() {
  const [classesList, setClassesList] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch available classes on mount ──
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8080/api/admin/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassesList(res.data || []);
      } catch {
        setError('Gagal memuat daftar kelas.');
      }
    };
    fetchClasses();
  }, []);

  // ── CSV Parsing — maps values to fixed column spec ──
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.some(v => v !== '')) {
        rows.push({
          nis: values[0] || '',
          nama_lengkap: values[1] || '',
          kelas: values[2] || '',
          no_whatsapp: values[3] || '',
          email: values[4] || '',
        });
      }
    }
    return rows;
  };

  /** Validates and accepts a CSV file, parses its content into preview state */
  const handleFileAccept = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      showToast('Format file tidak valid. Harap unggah file .CSV.', 'error');
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCsvPreview(parseCSV(e.target.result));
    reader.readAsText(file);
  };

  const handleFileRemove = () => {
    setCsvFile(null);
    setCsvPreview([]);
  };

  /** Updates a WhatsApp number in the preview table for inline editing */
  const handleWhatsAppChange = (rowIndex, newValue) => {
    setCsvPreview(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], no_whatsapp: newValue };
      return updated;
    });
  };

  /** Generates and downloads a sample CSV template file */
  const handleDownloadTemplate = () => {
    const header = 'NIS,Nama Lengkap,Kelas,No. WhatsApp,Email';
    const rows = [
      '10001,Ahmad Fauzan,10 IPA-A,081234567890,ahmad.fauzan@email.com',
      '10002,Siti Nurhaliza,10 IPA-A,,siti.nurhaliza@email.com',
      '10003,Budi Santoso,10 IPA-B,089876543210,budi.santoso@email.com',
    ];
    const blob = new Blob([[header, ...rows].join('\n') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_impor_siswa.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /**
   * Rebuilds CSV from (possibly edited) preview data and uploads as multipart/form-data.
   * This ensures any inline WhatsApp edits are captured in the final file.
   */
  const handleBulkImport = async () => {
    if (!csvFile) return;
    for (let i = 0; i < csvPreview.length; i++) {
      const row = csvPreview[i];
      if (!row.nis || !row.nama_lengkap || !row.kelas || !row.email) {
        showToast(`Baris ke-${i + 1}: NIS, Nama, Kelas, dan Email wajib diisi.`, 'error');
        return;
      }
    }
    setSubmitLoading(true);
    const token = localStorage.getItem('token');
    try {
      const header = 'NIS,Nama Lengkap,Kelas,No. WhatsApp,Email';
      const csvRows = csvPreview.map(row =>
        [row.nis, row.nama_lengkap, row.kelas, row.no_whatsapp, row.email]
          .map(v => `"${(v || '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', new File([blob], csvFile.name, { type: 'text/csv' }));

      const res = await axios.post('http://localhost:8080/api/admin/users/import', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data?.message || `Berhasil mengimpor ${csvPreview.length} siswa.`, 'success');
      handleFileRemove();
    } catch (err) {
      showToast(err.response?.data?.error || 'Gagal memproses impor massal.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full bg-transparent space-y-6 text-left pb-12">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">Impor Massal Siswa</h2>
        <p className="text-[#5F6368] text-xs mt-1">Unggah file CSV untuk mendaftarkan banyak siswa sekaligus ke dalam kelas tertentu dalam satu transaksi cepat.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50/80 backdrop-blur-sm border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <FiAlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600 bg-transparent border-none cursor-pointer"><FiX className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Drop-zone (sub-component) */}
      <CsvDropZone
        csvFile={csvFile}
        csvPreviewCount={csvPreview.length}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        onFileAccept={handleFileAccept}
        onFileRemove={handleFileRemove}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* Preview Table (sub-component) */}
      <PreviewTable
        csvPreview={csvPreview}
        onWhatsAppChange={handleWhatsAppChange}
        onSubmit={handleBulkImport}
        submitLoading={submitLoading}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md animate-fade-in transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'}`}>
          {toast.type === 'success' ? (
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <FiAlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
