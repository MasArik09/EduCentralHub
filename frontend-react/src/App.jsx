import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DasborUtama from './pages/admin/DasborUtama';

// Teacher modular pages
import ClassManagement from './pages/teacher/ClassManagement/ClassManagement';
import ContentMateri from './pages/teacher/Content/ContentMateri';
import Assessment from './pages/teacher/Assessment/Assessment';
import Communication from './pages/teacher/Communication/Communication';
import TeacherLayout from './pages/teacher/components/TeacherLayout';

// Admin new structured modular pages
import KelolaUser from './pages/admin/pengguna/KelolaUser';
import ImporMassal from './pages/admin/pengguna/ImporMassal';
import AkunOrangTua from './pages/admin/pengguna/AkunOrangTua';

import KelolaKelasRombel from './pages/admin/sekolah/KelolaKelasRombel';
import KurikulumMapel from './pages/admin/sekolah/KurikulumMapel';
import KalenderAkademik from './pages/admin/sekolah/KalenderAkademik';

import DasborSekolah from './pages/admin/DasborSekolah';
import LaporanAkademik from './pages/admin/LaporanAkademik';

import PengaturanPlatform from './pages/admin/sistem/PengaturanPlatform';
import LogAktivitas from './pages/admin/sistem/LogAktivitas';

// A simple Route Protection component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Route / renders the LandingPage */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Route /register renders the Register page */}
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Nested Children Routes */}
          <Route index element={<DasborUtama />} />

          {/* Admin 4 Categories modular pages */}
          <Route path="admin/kelola-user" element={<KelolaUser />} />
          <Route path="admin/impor-massal" element={<ImporMassal />} />
          <Route path="admin/orang-tua" element={<AkunOrangTua />} />
          
          <Route path="admin/kelola-kelas" element={<KelolaKelasRombel />} />
          <Route path="admin/kurikulum" element={<KurikulumMapel />} />
          <Route path="admin/kalender" element={<KalenderAkademik />} />
          
          <Route path="admin/dasbor-sekolah" element={<DasborSekolah />} />
          <Route path="admin/laporan-akademik" element={<LaporanAkademik />} />
          
          <Route path="admin/pengaturan" element={<PengaturanPlatform />} />
          <Route path="admin/log-aktivitas" element={<LogAktivitas />} />
        </Route>

        {/* Route for teacher modular pages to prevent nesting wrappers */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="upload-materi" element={<ContentMateri />} />
          <Route path="buat-kuis" element={<ContentMateri />} />
          <Route path="teacher/class-management" element={<ClassManagement />} />
          <Route path="teacher/content" element={<ContentMateri />} />
          <Route path="teacher/assessment" element={<Assessment />} />
          <Route path="teacher/communication" element={<Communication />} />
        </Route>

        {/* Fallback route - redirect back to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
