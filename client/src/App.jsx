import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/public/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';
import ViniVidiViciIntro from './components/ui/ViniVidiViciIntro';
import { api } from './services/api';
import { Sparkles, Shield, User, Users, RefreshCw, Play } from 'lucide-react';

function AppShell() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [viewingPublic, setViewingPublic] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');
  const [showIntro, setShowIntro] = useState(true);

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

  // Quick Demo Seed Trigger
  const handleQuickSeed = async () => {
    try {
      setSeedNotice('Seeding database with 23 Boys, 18 Girls, and attendance records...');
      const res = await api.content.seedDemo();
      if (res.success) {
        setSeedNotice('✅ Database seeded! You can now log in.');
        setTimeout(() => setSeedNotice(''), 4000);
      }
    } catch (err) {
      setSeedNotice('Error seeding: ' + err.message);
    }
  };

  // Quick Switch Login for Evaluator
  const handleQuickLogin = async (username, password, team) => {
    await login(username, password, team);
    setViewingPublic(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* VINI VIDI VICI Cinematic Intro Screen */}
      <AnimatePresence>
        {showIntro && (
          <ViniVidiViciIntro onComplete={() => setShowIntro(false)} />
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

      {/* Floating Demo Testing Bar (Sticky Bottom Pill for Evaluator Convenience) */}
      <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-1.5 pointer-events-auto">
        {seedNotice && (
          <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 animate-fade-in">
            {seedNotice}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            Quick Demo:
          </span>

          <button
            type="button"
            onClick={() => handleQuickLogin('boysadmin', 'BoysAdmin@KhoKho2026!', 'BOYS')}
            className="px-2.5 py-1 rounded-lg bg-saffron-50 hover:bg-saffron-100 text-saffron-700 font-bold border border-saffron-200 transition-colors"
            title="Login as Coach Vikramaditya Patil"
          >
            Boys Admin
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('girlsadmin', 'GirlsAdmin@KhoKho2026!', 'GIRLS')}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
            title="Login as Coach Ananya Deshmukh"
          >
            Girls Admin
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('b01', 'b01@KhoKho2026', 'BOYS')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            title="Login as Player Arjun Shinde (#1)"
          >
            Player (B01)
          </button>

          <button
            type="button"
            onClick={() => setShowIntro(true)}
            className="px-2 py-1 rounded-lg bg-black hover:bg-slate-800 text-white font-bold transition-colors flex items-center gap-1 shadow-sm"
            title="Replay VINI VIDI VICI Intro"
          >
            <Play className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-[11px]">Intro</span>
          </button>

          <button
            type="button"
            onClick={handleQuickSeed}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
            title="Seed / Reset Database Demo Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
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
