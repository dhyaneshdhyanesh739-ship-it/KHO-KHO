import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Users,
  Trophy,
  Crown,
  ArrowRight,
  Key,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialMode = 'TEAM' }) {
  const { login } = useAuth();
  const [activeMode, setActiveMode] = useState(initialMode); // 'ADMIN' | 'TEAM'
  const [selectedTeam, setSelectedTeam] = useState(null); // 'BOYS' | 'GIRLS' | 'ALL' | null
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changeForm, setChangeForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingChangePass, setIsSubmittingChangePass] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  // Keep activeMode in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode || 'TEAM');
      setSelectedTeam(null);
      setUsername('');
      setPassword('');
      setErrorMessage('');
      setShowPassword(false);
      setIsChangingPassword(false);
      setChangeForm({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setChangePassError('');
      setChangePassSuccess('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedTeam(null);
    setUsername('');
    setPassword('');
    setErrorMessage('');
    setShowPassword(false);
    setIsChangingPassword(false);
    setChangeForm({
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePassError('');
    setChangePassSuccess('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setErrorMessage('');
    setChangePassError('');
  };

  const handleSwitchMode = (newMode) => {
    setActiveMode(newMode);
    handleReset();
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');

    const targetUser = changeForm.username.trim();
    if (!targetUser) {
      setChangePassError('Please enter your username, email, or Player ID.');
      return;
    }
    if (!changeForm.currentPassword) {
      setChangePassError('Please enter your current password.');
      return;
    }
    if (!changeForm.newPassword) {
      setChangePassError('Please enter a new password.');
      return;
    }
    if (changeForm.newPassword.length < 6) {
      setChangePassError('New password must be at least 6 characters long.');
      return;
    }
    if (changeForm.newPassword !== changeForm.confirmPassword) {
      setChangePassError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingChangePass(true);
    try {
      const response = await api.auth.directChangePassword({
        username: targetUser,
        currentPassword: changeForm.currentPassword,
        newPassword: changeForm.newPassword,
      });

      if (response.success) {
        setChangePassSuccess(
          response.message || 'Password changed successfully! You can now sign in with your new password.'
        );
        setUsername(targetUser);
        setPassword('');
      } else {
        setChangePassError(response.message || 'Failed to update password.');
      }
    } catch (err) {
      setChangePassError(err.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setIsSubmittingChangePass(false);
    }
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
            {(isChangingPassword || selectedTeam) && (
              <button
                type="button"
                onClick={() => {
                  if (isChangingPassword) {
                    setIsChangingPassword(false);
                    setChangePassError('');
                    setChangePassSuccess('');
                  } else {
                    setSelectedTeam(null);
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isAdminPortal
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-navy-900 hover:bg-slate-100'
                }`}
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                {isChangingPassword ? (
                  <Key className="w-5 h-5 text-indigo-400" />
                ) : isAdminPortal ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <Users className="w-5 h-5 text-saffron-600" />
                )}
                <h3 className="font-editorial text-xl font-bold tracking-tight">
                  {isChangingPassword
                    ? 'Change Password'
                    : selectedTeam
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
                {isChangingPassword
                  ? 'Verify current credentials & set a new password'
                  : isAdminPortal
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
            {isChangingPassword ? (
              /* Step: Change Password Form */
              <motion.form
                key="step-change-password-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleChangePasswordSubmit}
                className="space-y-4"
              >
                {/* Active Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-100 text-indigo-800">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    Security & Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setChangePassError('');
                      setChangePassSuccess('');
                    }}
                    className="text-xs text-slate-500 hover:text-navy-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                </div>

                {/* Success Banner */}
                {changePassSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{changePassSuccess}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setChangePassSuccess('');
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {changePassError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Error:</span> {changePassError}
                    </div>
                  </div>
                )}

                {!changePassSuccess && (
                  <>
                    {/* Username or Athlete ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Username / Athlete ID / Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={changeForm.username}
                          onChange={(e) => setChangeForm({ ...changeForm, username: e.target.value })}
                          placeholder="Enter your username, email, or player ID (e.g. B01)"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={changeForm.currentPassword}
                          onChange={(e) => setChangeForm({ ...changeForm, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Key className="w-4 h-4" />
                        </div>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={changeForm.newPassword}
                          onChange={(e) => setChangeForm({ ...changeForm, newPassword: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">Must be at least 6 characters long.</p>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={changeForm.confirmPassword}
                          onChange={(e) => setChangeForm({ ...changeForm, confirmPassword: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingChangePass}
                        className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmittingChangePass ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Updating Password...
                          </span>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            <span>Save New Password</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setChangePassError('');
                          setChangePassSuccess('');
                        }}
                        className="text-xs text-slate-500 hover:text-navy-900 transition-colors cursor-pointer"
                      >
                        Cancel and Return to Sign In
                      </button>
                    </div>
                  </>
                )}
              </motion.form>
            ) : !selectedTeam ? (
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
                          <p className="text-[11px] text-slate-500">21 Boys Roster Management & Attendance</p>
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
                <div className="pt-2 text-center border-t border-slate-100 space-y-2">
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

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setChangeForm({
                          username: '',
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setChangePassError('');
                        setChangePassSuccess('');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Need to Change Password? Update Here</span>
                    </button>
                  </div>
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
                          ? 'Enter email or username'
                          : 'Enter username'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {selectedTeam === 'ALL'
                      ? 'Enter your Super Admin email or username'
                      : isAdminPortal
                      ? 'Enter coaching admin username'
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Downside the password: Change Password Option */}
                  <div className="flex items-center justify-between mt-2 pt-0.5">
                    <span className="text-[11px] text-slate-400">Forgot or want to update?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setChangeForm({
                          username: username.trim(),
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setChangePassError('');
                        setChangePassSuccess('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors hover:underline cursor-pointer focus:outline-none"
                    >
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Change Password?</span>
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
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
