import { useCallback, useRef } from 'react';
import { FiUploadCloud, FiFile, FiX, FiDownload } from 'react-icons/fi';

/**
 * CsvDropZone — Drag-and-drop file upload area with CSV template download.
 *
 * Props:
 * - csvFile: The currently attached File object (or null)
 * - csvPreviewCount: Number of parsed rows for display
 * - isDragging / setIsDragging: Drag hover state
 * - onFileAccept: Callback(file) when a valid file is dropped/selected
 * - onFileRemove: Callback to clear the attached file
 * - onDownloadTemplate: Callback to trigger template CSV download
 */
export default function CsvDropZone({ csvFile, csvPreviewCount, isDragging, setIsDragging, onFileAccept, onFileRemove, onDownloadTemplate }) {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    onFileAccept(file);
  }, [setIsDragging, onFileAccept]);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Drop-zone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !csvFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-50/50'
            : csvFile
            ? 'border-emerald-300 bg-emerald-50/30 cursor-default'
            : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100/40 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => onFileAccept(e.target.files?.[0])}
          className="hidden"
        />

        {csvFile ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <FiFile className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#202124]">{csvFile.name}</p>
              <p className="text-[10px] text-[#5F6368] font-medium">
                {(csvFile.size / 1024).toFixed(1)} KB · {csvPreviewCount} baris data terdeteksi
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFileRemove(); }}
              className="ml-4 w-8 h-8 bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-500 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
              title="Hapus file"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mx-auto">
              <FiUploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#202124]">Tarik & lepas file CSV di sini</p>
            <p className="text-[11px] text-[#5F6368] font-medium">atau klik untuk memilih file dari perangkat Anda</p>
          </div>
        )}
      </div>

      {/* Info Row */}
      <div className="flex items-center justify-between">
        <button onClick={onDownloadTemplate} className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer p-0">
          <FiDownload className="w-3.5 h-3.5" /> Unduh Template CSV Contoh
        </button>
        <span className="text-[10px] text-[#5F6368] font-medium">Kolom: NIS, Nama Lengkap, Kelas, No. WhatsApp, Email</span>
      </div>
    </div>
  );
}
