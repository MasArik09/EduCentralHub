import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupSecondsLeft, setBackupSecondsLeft] = useState(0);
  const [backupToken, setBackupToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('backupToken');
    const timeStr = localStorage.getItem('backupTokenTime');
    if (token && timeStr) {
      const time = parseInt(timeStr, 10);
      const elapsed = Math.floor((Date.now() - time) / 1000);
      const remaining = 64 - elapsed; // 64 seconds total (1 minute grace period)
      if (remaining > 0) {
        setBackupToken(token);
        setBackupSecondsLeft(remaining);
      } else {
        localStorage.removeItem('backupToken');
        localStorage.removeItem('backupTokenTime');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || backupSecondsLeft <= 0) {
      setBackupToken(null);
      localStorage.removeItem('backupToken');
      localStorage.removeItem('backupTokenTime');
      return;
    }

    const timer = setInterval(() => {
      setBackupSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setBackupToken(null);
          localStorage.removeItem('backupToken');
          localStorage.removeItem('backupTokenTime');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, backupSecondsLeft]);

  const handleQuickRelogin = () => {
    const token = localStorage.getItem('backupToken');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.removeItem('backupToken');
      localStorage.removeItem('backupTokenTime');
      setSuccess('Selamat datang kembali! Mengalihkan...');
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      const token = response.data?.token || response.data?.data?.token || response.data?.access_token;
      const refreshToken = response.data?.refresh_token;

      if (!token) {
        throw new Error('Autentikasi gagal: Token JWT tidak ditemukan.');
      }

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      setSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Email atau Password salah.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Dark frosted glass overlay - clicking it closes the modal */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-[4px] cursor-pointer"
      ></div>

      {/* Main Glassmorphic Modal Box */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 transform transition-all duration-300 relative z-10 animate-fade-in text-[#1B254B]">
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100/50 hover:bg-slate-200/80 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer text-sm"
          title="Tutup"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#4318FF] to-[#3010C8] bg-clip-text text-transparent">
              EduCentralHub
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1B254B] tracking-tight">
            Selamat Datang Kembali
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Masuk ke EduCentralHub untuk mengelola ruang kerja Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3 animate-shake">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 focus:border-[#4318FF] transition-all duration-200"
                placeholder="anda@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-[#1B254B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 focus:border-[#4318FF] transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold rounded-xl shadow-lg shadow-[#4318FF]/20 hover:shadow-[#4318FF]/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {backupToken && backupSecondsLeft > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-[#4318FF]/5 border border-[#4318FF]/10 text-slate-600 text-sm text-center animate-fade-in shadow-sm">
            <p className="font-bold text-xs mb-2 text-[#1B254B]">Tidak sengaja keluar?</p>
            <button
              type="button"
              onClick={handleQuickRelogin}
              className="w-full py-2.5 px-4 bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md shadow-[#4318FF]/15 cursor-pointer border-none"
            >
              Klik di sini untuk Masuk Kembali ({backupSecondsLeft} detik)
            </button>
          </div>
        )}

        <div className="mt-6 text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <Link 
              to="/register" 
              onClick={onClose} 
              className="font-bold text-[#4318FF] hover:underline transition-colors duration-200"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
