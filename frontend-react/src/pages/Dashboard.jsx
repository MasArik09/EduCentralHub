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
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // Default role fallback
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Read and decode token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser({ name: 'Demo User', email: 'demo@educentral.hub' });
      return;
    }

    // Try parsing JWT first
    const decoded = decodeJWT(token);
    if (decoded) {
      setUser({
        name: decoded.name || decoded.username || 'User',
        email: decoded.email || 'user@educentral.hub',
      });
      if (decoded.role) {
        setRole(decoded.role.toLowerCase());
      }
    } else {
      // Fallback: If not JWT, check if it's stored as direct JSON object
      try {
        const parsed = JSON.parse(token);
        setUser({
          name: parsed.name || parsed.username || 'User',
          email: parsed.email || 'user@educentral.hub',
        });
        if (parsed.role) {
          setRole(parsed.role.toLowerCase());
        }
      } catch (e) {
        setUser({ name: 'Authenticated User', email: 'user@educentral.hub' });
      }
    }
  }, []);

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
    if (token) {
      localStorage.setItem('backupToken', token);
      localStorage.setItem('backupTokenTime', Date.now().toString());
      
      // Auto clean after 64 seconds
      setTimeout(() => {
        localStorage.removeItem('backupToken');
        localStorage.removeItem('backupTokenTime');
      }, 64000);
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen h-screen overflow-hidden flex bg-[#F4F7FE] text-[#1B254B] font-sans relative">
      {/* Dynamic glow backdrops */}
      <div className="absolute top-[-20%] left-[-20%] w-[50rem] h-[50rem] bg-[#4318FF]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sidebar navigation */}
      <Sidebar 
        role={role} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 max-w-full h-screen overflow-y-auto overflow-x-hidden relative flex flex-col">
        {/* Top Navbar */}
        <Navbar 
          role={role} 
          setRole={setRole} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto text-left">
          <Outlet context={{ user, role, setRole }} />
        </main>
      </div>
    </div>
  );
}
