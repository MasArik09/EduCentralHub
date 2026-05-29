import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Navbar from '../../../components/Navbar';

// Utility function to decode JWT safely
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export default function TeacherLayout() {
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) return savedRole;
    
    const token = localStorage.getItem('token');
    if (!token) return 'teacher';
    const decoded = decodeJWT(token);
    if (decoded && decoded.role) {
      return decoded.role.toLowerCase();
    }
    return 'teacher';
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return { name: 'Demo Teacher', email: 'teacher@educentral.hub' };
    const decoded = decodeJWT(token);
    if (decoded) {
      return {
        name: decoded.name || decoded.username || 'Teacher',
        email: decoded.email || 'teacher@educentral.hub',
      };
    }
    return { name: 'Authenticated Teacher', email: 'teacher@educentral.hub' };
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token) {
      const graceSession = {
        token,
        refreshToken,
        role: 'teacher',
        user,
        logoutAt: Date.now()
      };
      localStorage.setItem('grace_session', JSON.stringify(graceSession));
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-[#202124] font-sans">
      <Sidebar 
        role="teacher" 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user} 
        handleLogout={handleLogout} 
      />
      <div className="flex-1 pl-64 flex flex-col">
        <Navbar 
          role="teacher" 
          setRole={setRole} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        /> 
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet context={{ user, role: 'teacher', setRole }} /> 
        </main>
      </div>
    </div>
  );
}
