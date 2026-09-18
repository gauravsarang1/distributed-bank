import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { api, tokenStorage } from './services/api.ts';
import { User } from './types/index.ts';
import { Building2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setIsInitializing(false);
        setCurrentPage('login');
        return;
      }

      try {
        const currentUser = await api.users.me();
        setUser(currentUser);
        setCurrentPage('dashboard');
      } catch (err) {
        console.warn('Stored session invalid or expired, resetting auth token');
        tokenStorage.remove();
        setUser(null);
        setCurrentPage('login');
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (registeredUser: User) => {
    setUser(registeredUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    tokenStorage.remove();
    setUser(null);
    setCurrentPage('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-3 animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-600">Connecting to Distributed Bank...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1">
        {currentPage === 'login' && (
          <Login
            onSuccess={handleLoginSuccess}
            onNavigateRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && (
          <Register
            onSuccess={handleRegisterSuccess}
            onNavigateLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'dashboard' && user && (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  );
}
