import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowLeft, Users, Trophy, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialMode = 'TEAM' }) {
  const { login } = useAuth();
  const [activeMode, setActiveMode] = useState(initialMode); // 'ADMIN' | 'TEAM'
  const [selectedTeam, setSelectedTeam] = useState(null); // 'BOYS' | 'GIRLS' | 'ALL' | null
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep activeMode in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode || 'TEAM');
      setSelectedTeam(null);
      setUsername('');
      setPassword('');
      setErrorMessage('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedTeam(null);
    setUsername('');
    setPassword('');
    setErrorMessage('');
    setShowPassword(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setErrorMessage('');
  };

  const handleSwitchMode = (newMode) => {
    setActiveMode(newMode);
    handleReset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass activeMode ('ADMIN' | 'TEAM') to enforce strict role segregation
      const result = await login(username.trim(), password, selectedTeam, activeMode);
      if (result.success) {
        handleClose();
        if (onLoginSuccess) onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdminPortal = activeMode === 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Bar */}
        <div
          className={`relative px-6 pt-6 pb-4 border-b flex items-center justify-between ${
            isAdminPortal
              ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-800'
              : 'bg-white text-navy-900 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {selectedTeam && (
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isAdminPortal
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-navy-900 hover:bg-slate-100'
                }`}
                title="Back to Selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                {isAdminPortal ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <Users className="w-5 h-5 text-saffron-600" />
                )}
                <h3 className="font-editorial text-xl font-bold tracking-tight">
                  {selectedTeam
                    ? selectedTeam === 'ALL'
                      ? 'Super Administrator Portal'
                      : `${selectedTeam === 'BOYS' ? 'Boys' : 'Girls'} ${isAdminPortal ? 'Admin' : 'Athlete'} Sign-In`
                    : isAdminPortal
                    ? 'Admin Portal Login'
                    : 'Team Portal Login'}
                </h3>
              </div>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  isAdminPortal ? 'text-purple-200' : 'text-slate-500'
                }`}
              >
                {isAdminPortal
                  ? 'Coaching Admins & Super Admin Only'
                  : 'Boys & Girls Kho-Kho Team Athletes Only'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-xl transition-colors ${
              isAdminPortal
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!selectedTeam ? (
              /* Step 1: Portal Division Selection */
              <motion.div
                key={`step-select-${activeMode}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3.5"
              >
                <p className="text-xs sm:text-sm text-slate-600">
                  {isAdminPortal
                    ? 'Select your administrative division or full console:'
                    : 'Select your team division to access player attendance & fixtures:'}
                </p>

                {/* IF ADMIN PORTAL: Options for Super Admin, Boys Admin, Girls Admin */}
                {isAdminPortal ? (
                  <>
                    {/* Admin Option 1: Super Administrator */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam('ALL')}
                      className="w-full group p-3.5 rounded-2xl border-2 border-slate-200 hover:border-purple-600 bg-gradient-to-r from-white via-purple-50/20 to-indigo-50/40 hover:to-purple-50/60 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                          <Crown className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-navy-900 group-hover:text-purple-700 transition-colors text-sm">
                              Super Administrator Portal
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                              Full Access
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Access Anyone in Project • Both Squads</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors text-xs">
                        →
                      </div>
                    </button>

                    {/* Admin Option 2: Boys Coaching Admin */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam('BOYS')}
                      className="w-full group p-3.5 rounded-2xl border-2 border-slate-200 hover:border-saffron-500 bg-gradient-to-r from-white to-orange-50/30 hover:to-orange-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 group-hover:text-saffron-600 transition-colors text-sm">
                            Boys Coaching Admin
                          </h4>
                          <p className="text-[11px] text-slate-500">22 Boys Roster Management & Attendance</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-saffron-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors text-xs">
                        →
                      </div>
                    </button>

                    {/* Admin Option 3: Girls Coaching Admin */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam('GIRLS')}
                      className="w-full group p-3.5 rounded-2xl border-2 border-slate-200 hover:border-rose-500 bg-gradient-to-r from-white to-rose-50/30 hover:to-rose-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 group-hover:text-rose-600 transition-colors text-sm">
                            Girls Coaching Admin
                          </h4>
                          <p className="text-[11px] text-slate-500">13 Girls Roster Management & Attendance</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors text-xs">
                        →
                      </div>
                    </button>
                  </>
                ) : (
                  /* IF TEAM PORTAL: Options for Boys Athletes and Girls Athletes */
                  <>
                    {/* Team Option 1: Boys Kho-Kho Team Athlete */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam('BOYS')}
                      className="w-full group p-4 rounded-2xl border-2 border-slate-200 hover:border-saffron-500 bg-gradient-to-r from-white to-orange-50/30 hover:to-orange-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 group-hover:text-saffron-600 transition-colors">
                            Boys Kho-Kho Team
                          </h4>
                          <p className="text-xs text-slate-500">22 Registered Athlete Members</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-saffron-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                        →
                      </div>
                    </button>

                    {/* Team Option 2: Girls Kho-Kho Team Athlete */}
                    <button
                      type="button"
                      onClick={() => handleSelectTeam('GIRLS')}
                      className="w-full group p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-500 bg-gradient-to-r from-white to-rose-50/30 hover:to-rose-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 group-hover:text-rose-600 transition-colors">
                            Girls Kho-Kho Team
                          </h4>
                          <p className="text-xs text-slate-500">13 Registered Athlete Members</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                        →
                      </div>
                    </button>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                      <span className="font-bold">Notice:</span> Only registered squad athletes can sign in here.
                    </div>
                  </>
                )}

                {/* Portal Switcher Link */}
                <div className="pt-2 text-center border-t border-slate-100">
                  {isAdminPortal ? (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('TEAM')}
                      className="text-xs font-semibold text-slate-500 hover:text-saffron-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Are you a team athlete? Switch to Team Portal Login</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('ADMIN')}
                      className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Are you a Coach or Super Admin? Switch to Admin Login</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Step 2: Credentials Form */
              <motion.form
                key="step-login-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Active Division Tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedTeam === 'ALL'
                        ? 'bg-purple-100 text-purple-800'
                        : selectedTeam === 'BOYS'
                        ? 'bg-saffron-100 text-saffron-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedTeam === 'ALL'
                      ? '👑 Super Admin Console'
                      : `${selectedTeam} ${isAdminPortal ? 'Coaching Admin' : 'Athlete Portal'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(null)}
                    className="text-xs text-slate-500 hover:text-navy-900 underline"
                  >
                    Change Division
                  </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                )}

                {/* Username / Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {selectedTeam === 'ALL' ? 'Email or Username' : 'Username'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        selectedTeam === 'ALL'
                          ? 'dhyaneshdhyanesh739@gmail.com'
                          : isAdminPortal
                          ? 'Dhyanesh_23'
                          : selectedTeam === 'GIRLS'
                          ? 'e.g. madhu'
                          : 'e.g. mohan'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {selectedTeam === 'ALL'
                      ? 'Enter your Super Admin email or username'
                      : isAdminPortal
                      ? 'Enter coaching admin username (Dhyanesh_23)'
                      : 'Enter your assigned team player username'}
                  </p>
                </div>

                {/* Password Field with Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    isAdminPortal
                      ? selectedTeam === 'ALL'
                        ? 'bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 shadow-purple-500/25'
                        : selectedTeam === 'BOYS'
                        ? 'bg-gradient-to-r from-saffron-600 to-saffron-500 hover:from-saffron-700 hover:to-saffron-600 shadow-saffron-500/25'
                        : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/25'
                      : selectedTeam === 'BOYS'
                      ? 'bg-gradient-to-r from-saffron-600 to-saffron-500 hover:from-saffron-700 hover:to-saffron-600 shadow-saffron-500/25'
                      : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      {isAdminPortal ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      <span>
                        Sign In to {selectedTeam === 'ALL' ? 'Super Admin' : selectedTeam === 'BOYS' ? 'Boys' : 'Girls'}{' '}
                        {isAdminPortal ? 'Admin' : 'Portal'}
                      </span>
                    </>
                  )}
                </button>

                {/* Credentials Helper Pill */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">
                    {isAdminPortal ? 'Admin Credentials Reference:' : 'Athlete Credentials Reference:'}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {isAdminPortal ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-1 gap-1">
                          <span className="font-bold text-navy-900 flex items-center gap-1">
                            <span>👑 Super Admin:</span>
                          </span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700 font-bold text-[10px] break-all">
                            dhyaneshdhyanesh739@gmail.com <span className="text-slate-400">/</span> Dhyanesh@23012007
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy-900">Coaching Admin:</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-saffron-700 font-semibold text-[10px]">
                            Dhyanesh_23 <span className="text-slate-400">/</span> kiddo@khokho
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {selectedTeam === 'GIRLS' ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-navy-900">Girls Team Athlete:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-rose-700 font-semibold text-[10px]">
                              madhu <span className="text-slate-400">/</span> madhu@khokho
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-navy-900">Boys Team Athlete:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[10px]">
                              mohan <span className="text-slate-400">/</span> mohan@khokho
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
