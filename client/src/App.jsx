import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/public/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';
import AdminPortalGate from './pages/admin/AdminPortalGate';
import ViniVidiViciIntro from './components/ui/ViniVidiViciIntro';
import FierySwordScreen from './components/ui/FierySwordScreen';

function AppShell() {
  const { user, isAuthenticated, isLoading, logout, isImpersonated, exitImpersonation } = useAuth();
  const [viewingPublic, setViewingPublic] = useState(false);

  // URL Path Routing: detect direct portal access (/superadmin, /boysadmin, /girlsadmin, /admin)
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      setCurrentPath(p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.toLowerCase().replace(/\/+$/, '') || '/');
  };

  const isAdminPortal = ['/superadmin', '/boysadmin', '/girlsadmin', '/admin'].includes(currentPath);

  // Intro Phases: Only execute cinematic creed on public homepage ('/') for unauthenticated visitors!
  const [introStep, setIntroStep] = useState(isAdminPortal ? 'DONE' : 'CREED');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-court-sand dark:bg-[#0b1120] text-navy-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="w-16 h-16 rounded-3xl bg-saffron-500 text-white flex items-center justify-center font-editorial font-black text-2xl shadow-xl shadow-saffron-500/30 animate-bounce">
          KK
        </div>
        <p className="mt-4 font-editorial font-bold text-navy-900 dark:text-white text-lg">
          KHO-KHO ARENA
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying Session Authorization...</p>
      </div>
    );
  }

  // =========================================================================
  // ROUTE 1: /superadmin (or /admin) -> DEDICATED SUPER ADMIN PORTAL
  // =========================================================================
  if (currentPath === '/superadmin' || currentPath === '/admin') {
    return (
      <AdminPortalGate
        portalType="SUPER_ADMIN"
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // =========================================================================
  // ROUTE 2: /boysadmin -> DEDICATED BOYS TEAM ADMIN PORTAL
  // =========================================================================
  if (currentPath === '/boysadmin') {
    return (
      <AdminPortalGate
        portalType="BOYS_ADMIN"
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // =========================================================================
  // ROUTE 3: /girlsadmin -> DEDICATED GIRLS TEAM ADMIN PORTAL
  // =========================================================================
  if (currentPath === '/girlsadmin') {
    return (
      <AdminPortalGate
        portalType="GIRLS_ADMIN"
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // =========================================================================
  // ROUTE 4: / (PUBLIC WEBSITE & ATHLETE DASHBOARD)
  // =========================================================================
  return (
    <div className="relative min-h-screen bg-court-sand dark:bg-[#0b1120] text-navy-900 dark:text-slate-100 transition-colors duration-200">
      {/* Super Admin Impersonation Persistent Banner */}
      {isAuthenticated && isImpersonated && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white text-xs py-2.5 px-4 flex flex-wrap items-center justify-between sticky top-0 z-[100] shadow-xl border-b border-purple-500/40 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <span className="font-semibold text-purple-200">
              ⚡ Super Admin View Mode: Currently viewing as <strong className="text-white">@{user?.username}</strong> ({user?.name} &bull; {user?.role})
            </span>
          </div>
          <button
            type="button"
            onClick={exitImpersonation}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-1 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <span>✕ Exit View &amp; Return to Super Admin</span>
          </button>
        </div>
      )}

      {/* 2-Step Cinematic Intro: Only for unauthenticated guests on public homepage */}
      <AnimatePresence mode="wait">
        {!isAuthenticated && introStep === 'CREED' && (
          <ViniVidiViciIntro
            key="intro-creed"
            onComplete={() => setIntroStep('SWORD')}
          />
        )}
        {!isAuthenticated && introStep === 'SWORD' && (
          <FierySwordScreen
            key="intro-sword"
            onEnterHome={() => setIntroStep('DONE')}
          />
        )}
      </AnimatePresence>

      {/* If Authenticated and not explicitly previewing public home */}
      {isAuthenticated && !viewingPublic ? (
        user.role === 'PLAYER' ? (
          <PlayerDashboard />
        ) : (
          <AdminDashboard
            onLogout={logout}
            initialDivision={user.team === 'GIRLS' ? 'GIRLS' : 'BOYS'}
          />
        )
      ) : (
        <div>
          {isAuthenticated && viewingPublic && (
            <div className="bg-saffron-600 text-white text-xs py-2 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
              <span>Previewing Public Website as authenticated user: <strong>{user.name}</strong></span>
              <button
                type="button"
                onClick={() => setViewingPublic(false)}
                className="bg-white text-saffron-700 font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Return to {user.role === 'PLAYER' ? 'Athlete' : 'Admin'} Dashboard →
              </button>
            </div>
          )}
          <HomePage
            onLoginSuccess={() => {
              setViewingPublic(false);
              setIntroStep('DONE');
            }}
            onViewDashboard={() => setViewingPublic(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
