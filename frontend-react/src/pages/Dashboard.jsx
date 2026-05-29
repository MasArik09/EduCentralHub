import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) return savedRole;
    
    const token = localStorage.getItem('token');
    if (!token) return 'student';
    const decoded = decodeJWT(token);
    if (decoded && decoded.role) {
      return decoded.role.toLowerCase();
    }
    return 'student';
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return { name: 'Demo User', email: 'demo@educentral.hub' };
    const decoded = decodeJWT(token);
    if (decoded) {
      return {
        name: decoded.name || decoded.username || 'User',
        email: decoded.email || 'user@educentral.hub',
      };
    }
    return { name: 'Authenticated User', email: 'user@educentral.hub' };
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Logika Inactivity Timeout (20 Menit)
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        // Auto Logout
        localStorage.removeItem('token');
        navigate('/login');
        
        Swal.fire({
          title: 'Sesi Berakhir!',
          text: 'Sesi Anda telah berakhir karena tidak ada aktivitas.',
          icon: 'warning',
          background: '#FFFFFF',
          color: '#1B254B',
          confirmButtonColor: '#4318FF'
        });
      }, 20 * 60 * 1000); // 20 Menit
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    const events = ['mousemove', 'mousedown', 'click', 'scroll', 'keypress'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialize timer
    resetTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [navigate]);

  // Logika Silent Refresh Token (Automated Token Rotation)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 error and the error is "token expired" (and we haven't retried yet)
        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data &&
          (error.response.data.error === 'token expired' || 
           (typeof error.response.data.error === 'string' && error.response.data.error.toLowerCase().includes('expired'))) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              // Attempt to silently refresh token
              const res = await axios.post('http://localhost:8080/api/auth/refresh', {
                refresh_token: refreshToken
              });
              
              const newAccessToken = res.data?.token || res.data?.access_token;
              if (newAccessToken) {
                localStorage.setItem('token', newAccessToken);
                
                // Update Authorization header for the original request
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Retry original request
                return axios(originalRequest);
              }
            } catch (refreshErr) {
              console.error('Refresh token also expired or invalid, forcing logout:', refreshErr);
              // Refresh token also failed (e.g. expired after 7 days) -> Force Logout!
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              navigate('/login');
              
              Swal.fire({
                title: 'Sesi Berakhir!',
                text: 'Sesi Anda telah berakhir secara permanen. Silakan masuk kembali.',
                icon: 'error',
                background: '#FFFFFF',
                color: '#1B254B',
                confirmButtonColor: '#4318FF'
              });
            }
          } else {
            // No refresh token -> Force Logout!
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token) {
      const graceSession = {
        token,
        refreshToken,
        role,
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
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#202124] font-sans relative z-0">
      {/* Dynamic Glassmorphism Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-blue-100/40 blur-[120px] pointer-events-none z-[-1]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none z-[-1]" />

      {/* Sidebar navigation container */}
      <div className={`w-64 fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar 
          role={role} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          user={user} 
          handleLogout={handleLogout} 
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        {/* Top Navbar */}
        <Navbar 
          role={role} 
          setRole={setRole} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet context={{ user, role, setRole }} />
        </main>
      </div>
    </div>
  );
}
