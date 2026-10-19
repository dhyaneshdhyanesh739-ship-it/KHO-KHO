import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowLeft, Users, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null); // 'BOYS' | 'GIRLS' | null
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username.trim(), password, selectedTeam);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {selectedTeam && (
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                title="Change Team Selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-editorial text-xl font-bold text-navy-900 tracking-tight">
                {selectedTeam ? (selectedTeam === 'ALL' ? 'Super Administrator Portal' : `${selectedTeam === 'BOYS' ? 'Boys' : 'Girls'} Team Login`) : 'Select Team Division'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Kho-Kho Arena Team Management Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!selectedTeam ? (
              /* Step 1: Team Selection */
              <motion.div
                key="step-select-team"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-600 mb-2">
                  Please select your division to proceed to coaching staff or player sign-in:
                </p>

                {/* Option 1: Boys Team */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('BOYS')}
                  className="w-full group p-4 rounded-2xl border-2 border-slate-200 hover:border-saffron-500 bg-gradient-to-r from-white to-orange-50/30 hover:to-orange-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 group-hover:text-saffron-600 transition-colors">
                        Boys Kho-Kho Team
                      </h4>
                      <p className="text-xs text-slate-500">22 Active Roster Members • Coaching Admin & Players</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-saffron-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                    →
                  </div>
                </button>

                {/* Option 2: Girls Team */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('GIRLS')}
                  className="w-full group p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-500 bg-gradient-to-r from-white to-rose-50/30 hover:to-rose-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 group-hover:text-rose-600 transition-colors">
                        Girls Kho-Kho Team
                      </h4>
                      <p className="text-xs text-slate-500">13 Active Roster Members • Coaching Admin & Players</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                    →
                  </div>
                </button>

                {/* Option 3: Super Administrator Portal */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('ALL')}
                  className="w-full group p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/40 hover:to-indigo-50/70 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <span>Super Administrator Portal</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                          Full Access
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">System Authority • Access Anyone in Project & Both Squads</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                    →
                  </div>
                </button>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-500 text-center">
                  Super Administrator accounts can oversee both teams and access any account in the project.
                </div>
              </motion.div>
            ) : (
              /* Step 2: Login Form */
              <motion.form
                key="step-login-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Team Tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedTeam === 'ALL'
                        ? 'bg-indigo-100 text-indigo-700'
                        : selectedTeam === 'BOYS'
                        ? 'bg-saffron-100 text-saffron-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {selectedTeam === 'ALL' ? '👑 Super Admin Console' : `Division: ${selectedTeam} Team`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(null)}
                    className="text-xs text-slate-500 hover:text-navy-900 underline"
                  >
                    Switch Portal
                  </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                    <span className="font-bold">Error:</span> {errorMessage}
                  </div>
                )}

                {/* Username or Email Input */}
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
                          : selectedTeam === 'GIRLS'
                          ? 'e.g. Dhyanesh or madhu'
                          : 'e.g. Dhyanesh or mohan'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {selectedTeam === 'ALL'
                      ? 'Use your authorized Super Admin email or username'
                      : 'Use your assigned coaching admin or athlete username'}
                  </p>
                </div>

                {/* Password Input with Show/Hide */}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedTeam === 'ALL'
                      ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 shadow-indigo-500/25'
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
                      <ShieldCheck className="w-4 h-4" />
                      Sign In to {selectedTeam === 'ALL' ? 'Super Admin' : selectedTeam === 'BOYS' ? 'Boys' : 'Girls'} Portal
                    </>
                  )}
                </button>

                {/* Demo / Official Credentials Helper Pill */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Official Credentials Reference:</p>
                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-1 gap-1">
                      <span className="font-bold text-navy-900 flex items-center gap-1">
                        <span>👑 Super Admin:</span>
                      </span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700 font-bold text-[10px] break-all">
                        dhyaneshdhyanesh739@gmail.com <span className="text-slate-400">/</span> Dhyanesh@23012007
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span className="font-bold text-navy-900">Coaching Admin:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-saffron-700 font-semibold text-[10px]">
                        Dhyanesh <span className="text-slate-400">/</span> kiddo@khokho
                      </span>
                    </div>
                    {selectedTeam === 'GIRLS' ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900">Girls Player:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-rose-700 font-semibold text-[10px]">
                          madhu <span className="text-slate-400">/</span> madhu@khokho
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900">Boys Player:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[10px]">
                          mohan <span className="text-slate-400">/</span> mohan@khokho
                        </span>
                      </div>
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
