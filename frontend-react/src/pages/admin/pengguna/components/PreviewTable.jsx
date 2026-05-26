import { FiCheckCircle } from 'react-icons/fi';

/**
 * PreviewTable — Displays parsed CSV data with fixed column spec.
 * The No. WhatsApp column supports inline editing for manual input.
 *
 * Props:
 * - csvPreview: Array of row objects { nis, nama_lengkap, kelas, no_whatsapp, email }
 * - onWhatsAppChange: Callback(rowIndex, newValue) for inline WhatsApp editing
 * - onSubmit: Callback to trigger bulk import
 * - submitLoading: Boolean indicating submit in progress
 */
export default function PreviewTable({ csvPreview, onWhatsAppChange, onSubmit, submitLoading }) {
  const COLUMN_KEYS = ['nis', 'nama_lengkap', 'kelas', 'no_whatsapp', 'email'];
  const COLUMN_LABELS = {
    nis: 'NIS',
    nama_lengkap: 'Nama Lengkap',
    kelas: 'Kelas',
    no_whatsapp: 'No. WhatsApp',
    email: 'Email',
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#202124]">Pratinjau Data Siswa (Preview)</h3>
        <p className="text-[10px] text-[#5F6368] font-medium mt-0.5">
          Tinjau dan koreksi data sebelum memproses impor. Kolom No. WhatsApp dapat diedit langsung di dalam tabel.
        </p>
      </div>

      {csvPreview.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg py-14 text-center space-y-1">
          <p className="text-sm text-[#5F6368] font-medium">Belum ada data.</p>
          <p className="text-[11px] text-gray-400 font-medium">Silakan unggah file CSV untuk melihat pratinjau siswa.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-[10px] font-bold text-[#5F6368] uppercase tracking-wider w-14">No</th>
                {COLUMN_KEYS.map((key) => (
                  <th key={key} className="px-4 py-3 text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                    {COLUMN_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {csvPreview.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-[#5F6368] font-mono">{idx + 1}</td>
                  {COLUMN_KEYS.map((key) => (
                    <td key={key} className="px-4 py-2.5">
                      {key === 'no_whatsapp' ? (
                        /* Inline editable WhatsApp field — allows manual entry if CSV cell was empty */
                        <input
                          type="text"
                          value={row[key]}
                          onChange={(e) => onWhatsAppChange(idx, e.target.value)}
                          placeholder="Bisa diisi manual"
                          className={`w-full text-xs font-medium bg-transparent focus:outline-none py-0.5 px-0 transition-colors ${
                            row[key]
                              ? 'text-[#202124] border-b border-gray-200 focus:border-gray-400'
                              : 'text-gray-400 placeholder-gray-300 border-b border-dashed border-gray-200 focus:border-gray-400 focus:text-[#202124]'
                          }`}
                        />
                      ) : (
                        <span className={`text-xs font-medium ${
                          !row[key] ? 'text-rose-400 italic' : 'text-[#202124]'
                        }`}>
                          {row[key] || '⚠ Kosong'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: Summary + Execute Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-[#5F6368] font-medium">
          {csvPreview.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-500 w-3.5 h-3.5" />
              <span className="font-bold text-[#202124]">{csvPreview.length}</span> baris data siap diimpor
            </span>
          )}
        </div>
        <button
          onClick={onSubmit}
          disabled={csvPreview.length === 0 || submitLoading}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
        >
          {submitLoading ? 'Memproses...' : 'Proses Impor Massal'}
        </button>
      </div>
    </div>
  );
}
