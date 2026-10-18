import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/public/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';
import ViniVidiViciIntro from './components/ui/ViniVidiViciIntro';
import FierySwordScreen from './components/ui/FierySwordScreen';
function AppShell() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [viewingPublic, setViewingPublic] = useState(false);
  // Intro Phases: 'CREED' -> 'SWORD' -> 'DONE'
  const [introStep, setIntroStep] = useState('CREED');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-court-sand flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-saffron-500 text-white flex items-center justify-center font-editorial font-black text-2xl shadow-xl shadow-saffron-500/30 animate-bounce">
          KK
        </div>
        <p className="mt-4 font-editorial font-bold text-navy-900 text-lg">
          KHO-KHO ARENA
        </p>
        <p className="text-xs text-slate-500 font-medium">Verifying Session Authorization...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 2-Step Cinematic Intro: VINI VIDI VICI -> Flaming Sword Tattoo -> Home */}
      <AnimatePresence mode="wait">
        {introStep === 'CREED' && (
          <ViniVidiViciIntro
            key="intro-creed"
            onComplete={() => setIntroStep('SWORD')}
          />
        )}
        {introStep === 'SWORD' && (
          <FierySwordScreen
            key="intro-sword"
            onEnterHome={() => setIntroStep('DONE')}
          />
        )}
      </AnimatePresence>

      {/* If Authenticated and not explicitly previewing public home */}
      {isAuthenticated && !viewingPublic ? (
        user.role === 'PLAYER' ? (
          <div>
            {/* Top Switcher Banner */}
            <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between">
              <span>Logged in as <strong>{user.name}</strong> ({user.team} Player)</span>
              <button
                type="button"
                onClick={() => setViewingPublic(true)}
                className="text-saffron-400 hover:text-white underline font-semibold"
              >
                View Public Landing Page
              </button>
            </div>
            <PlayerDashboard />
          </div>
        ) : (
          <div>
            {/* Top Switcher Banner */}
            <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between">
              <span>Administrative Workspace: <strong>{user.name}</strong> ({user.role})</span>
              <button
                type="button"
                onClick={() => setViewingPublic(true)}
                className="text-saffron-400 hover:text-white underline font-semibold"
              >
                View Public Landing Page
              </button>
            </div>
            <AdminDashboard onLogout={logout} />
          </div>
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
          <HomePage onLoginSuccess={() => setViewingPublic(false)} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
