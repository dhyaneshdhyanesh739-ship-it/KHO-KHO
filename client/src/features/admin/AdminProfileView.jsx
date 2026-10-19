import React, { useState } from 'react';
import { Shield, Key, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function AdminProfileView() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      const res = await api.auth.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 5000);
      }
    } catch (err) {
      setPasswordError(err.data?.message || err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-saffron-100 text-saffron-700 flex items-center justify-center font-editorial font-black text-2xl">
                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-navy-900">{user?.name}</h3>
                <span className="badge-tag bg-slate-100 text-slate-700 mt-1">
                  {user?.role?.replace('_', ' ')} • {user?.team}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Username</span>
                <strong className="font-mono text-navy-900">{user?.username}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email Reference</span>
                <strong className="text-navy-900">{user?.email || 'Registered with Sports Directorate'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Team Domain</span>
                <strong className="text-saffron-600">{user?.team} Team (Strict Isolation Enforced)</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Session Login</span>
                <strong className="text-slate-700">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Current Session Active'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-7">
          <div className="card-premium p-6">
            <h3 className="font-editorial text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-saffron-600" />
              Update Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Securely update your coaching administrative access credentials.
            </p>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark text-xs font-semibold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="btn-primary text-xs py-2 px-5 shadow-sm"
              >
                {isUpdatingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
