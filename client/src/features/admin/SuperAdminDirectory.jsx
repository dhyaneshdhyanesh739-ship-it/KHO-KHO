import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Crown, UserCheck, Search, Filter, Key, CheckCircle,
  AlertCircle, ArrowRight, RefreshCw, Lock, Mail, Phone, ExternalLink,
  ToggleLeft, ToggleRight, Sparkles, LogIn
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDirectory() {
  const { user: currentUser, impersonateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMINS' | 'BOYS' | 'GIRLS'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Password reset modal state
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.auth.getAllUsers();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load system users:', err);
      setError(err.message || 'Failed to retrieve system user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAccessUser = async (targetUser) => {
    if (targetUser._id === currentUser?.id) {
      setError('You are already logged in as this Super Administrator.');
      return;
    }

    try {
      setActionLoadingId(targetUser._id);
      const res = await impersonateUser(targetUser._id);
      if (!res.success) {
        setError(res.message || 'Unable to access target user session.');
      }
    } catch (err) {
      setError(err.message || 'Failed to switch user view.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    try {
      setActionLoadingId(targetUser._id);
      const res = await api.auth.toggleUserStatus(targetUser._id);
      if (res && res.success) {
        setSuccessMessage(`User @${targetUser.username} status updated.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword.trim()) return;

    try {
      const res = await api.auth.resetUserPassword(resetModalUser._id, newPassword.trim());
      if (res && res.success) {
        setSuccessMessage(`Password updated successfully for @${resetModalUser.username}`);
        setResetModalUser(null);
        setNewPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.playerRef && u.playerRef.position && u.playerRef.position.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (roleFilter === 'ADMINS') {
      return u.role === 'SUPER_ADMIN' || u.role === 'BOYS_ADMIN' || u.role === 'GIRLS_ADMIN';
    }
    if (roleFilter === 'BOYS') {
      return u.team === 'BOYS' && u.role === 'PLAYER';
    }
    if (roleFilter === 'GIRLS') {
      return u.team === 'GIRLS' && u.role === 'PLAYER';
    }

    return true;
  });

  const boysCount = users.filter((u) => u.team === 'BOYS' && u.role === 'PLAYER').length;
  const girlsCount = users.filter((u) => u.team === 'GIRLS' && u.role === 'PLAYER').length;
  const adminCount = users.filter((u) => u.role !== 'PLAYER').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold uppercase tracking-wider mb-2 border border-saffron-500/30">
              <Crown className="w-3.5 h-3.5 text-saffron-400" />
              <span>Super Administrator Access Console</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-black tracking-tight text-white">
              System Directory & Access Anyone
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Full administrative authority. As Super Admin, you can directly inspect, manage, and log in as ANY athlete or coaching staff member in the project with one click.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Directory</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Accounts</span>
            <p className="text-xl font-editorial font-black text-white mt-0.5">{users.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-saffron-400 uppercase tracking-wider">Boys Squad</span>
            <p className="text-xl font-editorial font-black text-saffron-400 mt-0.5">{boysCount} Athletes</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Girls Squad</span>
            <p className="text-xl font-editorial font-black text-rose-400 mt-0.5">{girlsCount} Athletes</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Coaches & Admins</span>
            <p className="text-xl font-editorial font-black text-emerald-400 mt-0.5">{adminCount} Staff</p>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="text-rose-500 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: `All (${users.length})` },
            { id: 'ADMINS', label: `Admins (${adminCount})` },
            { id: 'BOYS', label: `Boys (${boysCount})` },
            { id: 'GIRLS', label: `Girls (${girlsCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading system user registry...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No matching accounts found for query "{searchQuery}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">User / Athlete</th>
                  <th className="py-3.5 px-4">Role & Team</th>
                  <th className="py-3.5 px-4">Login Identifier</th>
                  <th className="py-3.5 px-4">Default Password</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const isCurrent = u._id === currentUser?.id;
                  const isPlayer = u.role === 'PLAYER';
                  const isBoys = u.team === 'BOYS';
                  const isSuper = u.role === 'SUPER_ADMIN';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Player Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSuper
                                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-sm'
                                : isBoys
                                ? 'bg-saffron-100 text-saffron-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isSuper ? <Crown className="w-4 h-4" /> : u.playerRef?.jerseyNumber ? `#${u.playerRef.jerseyNumber}` : u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-navy-900">{u.name}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {u.playerRef?.position || (isSuper ? 'Chief Administrator' : 'Head Coaching Staff')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Team */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isSuper
                              ? 'bg-amber-100 text-amber-800'
                              : u.team === 'BOYS'
                              ? 'bg-saffron-50 text-saffron-800 border border-saffron-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isSuper ? 'SUPER ADMIN' : `${u.team} • ${u.role === 'PLAYER' ? 'ATHLETE' : 'COACH'}`}
                        </span>
                      </td>

                      {/* Login Identifier */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <div>@{u.username}</div>
                        {u.email && <div className="text-[10px] text-slate-400 font-sans">{u.email}</div>}
                      </td>

                      {/* Default Password */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {isSuper ? (
                          <span className="text-amber-700 font-semibold">Dhyanesh@23012007</span>
                        ) : isPlayer ? (
                          <span>{u.username}@khokho</span>
                        ) : (
                          <span className="text-slate-700">kiddo@khokho</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Access / Impersonate Button */}
                          <button
                            type="button"
                            disabled={isCurrent || actionLoadingId === u._id}
                            onClick={() => handleAccessUser(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                              isCurrent
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-indigo-500/20 hover:scale-[1.02]'
                            }`}
                            title={`Sign in and view portal as ${u.name}`}
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{actionLoadingId === u._id ? 'Switching...' : 'Access Account'}</span>
                          </button>

                          {/* Quick Password Reset Key */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalUser(u);
                              setNewPassword('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                            title="Reset password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Status Toggle (Activate/Deactivate) */}
                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {u.isActive ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="font-editorial text-lg font-bold text-navy-900">
              Reset Password for @{resetModalUser.username}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set a new secure password for {resetModalUser.name}.
            </p>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
