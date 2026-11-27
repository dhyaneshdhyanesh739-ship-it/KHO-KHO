import React, { useState } from 'react';
import { Shield, ShieldAlert, Crown, ArrowLeft, LogIn, Eye, EyeOff, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';

export default function AdminPortalGate({ portalType = 'SUPER_ADMIN', onNavigateHome }) {
  const { user, isAuthenticated, login, logout } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Portal configuration metadata
  const configs = {
    SUPER_ADMIN: {
      title: 'Super Administrator Console',
      subtitle: 'Restricted Governance & Global Platform Control',
      badge: 'Master Control Portal',
      badgeIcon: Crown,
      themeColor: 'from-purple-900 via-indigo-950 to-slate-950',
      accentColor: 'text-purple-400',
      btnBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
      borderColor: 'border-purple-500/40',
      focusRing: 'focus:border-purple-500 focus:ring-purple-500/20',
      division: 'BOYS',
      checkAuth: (u) => u?.role === 'SUPER_ADMIN',
      unauthorizedMsg: 'Access Denied: Only Super Administrator credentials can access this console.',
    },
    BOYS_ADMIN: {
      title: 'Boys Kho-Kho Team Admin',
      subtitle: 'Boys Squad Coaching, Roster & Performance Administration',
      badge: 'Boys Team Admin Console',
      badgeIcon: Shield,
      themeColor: 'from-amber-950 via-slate-900 to-slate-950',
      accentColor: 'text-saffron-400',
      btnBg: 'bg-saffron-600 hover:bg-saffron-500 shadow-saffron-600/30',
      borderColor: 'border-saffron-500/40',
      focusRing: 'focus:border-saffron-500 focus:ring-saffron-500/20',
      division: 'BOYS',
      checkAuth: (u) => u?.role === 'SUPER_ADMIN' || ((u?.role === 'ADMIN' || u?.role === 'BOYS_ADMIN') && (u?.team === 'BOYS' || !u?.team)),
      unauthorizedMsg: 'Access Denied: You do not have administrator permissions for the Boys Squad.',
    },
    GIRLS_ADMIN: {
      title: 'Girls Kho-Kho Team Admin',
      subtitle: 'Girls Squad Coaching, Roster & Performance Administration',
      badge: 'Girls Team Admin Console',
      badgeIcon: Shield,
      themeColor: 'from-rose-950 via-slate-900 to-slate-950',
      accentColor: 'text-rose-400',
      btnBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
      borderColor: 'border-rose-500/40',
      focusRing: 'focus:border-rose-500 focus:ring-rose-500/20',
      division: 'GIRLS',
      checkAuth: (u) => u?.role === 'SUPER_ADMIN' || ((u?.role === 'ADMIN' || u?.role === 'GIRLS_ADMIN') && u?.team === 'GIRLS'),
      unauthorizedMsg: 'Access Denied: You do not have administrator permissions for the Girls Squad.',
    },
  };

  const currentConfig = configs[portalType] || configs.SUPER_ADMIN;
  const isAuthorized = isAuthenticated && currentConfig.checkAuth(user);

  // If already authenticated with required credentials, render the AdminDashboard
  if (isAuthorized) {
    return (
      <AdminDashboard
        onLogout={logout}
        initialDivision={currentConfig.division}
        portalMode={portalType}
      />
    );
  }

  // Handle Portal Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(username.trim(), password, currentConfig.division, 'ADMIN');

      if (!res.success) {
        setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      // Check role authorization for this specific portal
      const loggedUser = res.user;
      if (!currentConfig.checkAuth(loggedUser)) {
        await logout();
        setErrorMsg(currentConfig.unauthorizedMsg);
        setIsLoading(false);
        return;
      }

      // Successful authorized login
      setIsLoading(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Login service unavailable. Please try again.');
      setIsLoading(false);
    }
  };

  const BadgeIcon = currentConfig.badgeIcon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentConfig.themeColor} text-white flex flex-col justify-between p-4 sm:p-6 relative select-none overflow-hidden`}>
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Return Link */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl w-full mx-auto">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
            Secure Portal
          </span>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className={`rounded-3xl bg-slate-900/90 backdrop-blur-xl border ${currentConfig.borderColor} p-6 sm:p-8 shadow-2xl space-y-6`}>
          
          {/* Header & Emblem */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-inner">
              <BadgeIcon className={`w-8 h-8 ${currentConfig.accentColor}`} />
            </div>

            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest ${currentConfig.accentColor}`}>
                <Sparkles className="w-3 h-3" />
                {currentConfig.badge}
              </span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-black text-white tracking-wide">
              {currentConfig.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {currentConfig.subtitle}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className={`w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all ${currentConfig.focusRing}`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className={`w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all ${currentConfig.focusRing}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${currentConfig.btnBg} text-white font-black text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate &amp; Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="pt-2 border-t border-slate-800/80 text-center text-[10.5px] text-slate-500 font-mono">
            Authorized Personnel Only &bull; All Access Attempts Logged
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 font-medium">
        Kho-Kho Arena Digital Management System &bull; Private Administrator Portals
      </footer>
    </div>
  );
}
