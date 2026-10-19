import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, History, BarChart3, Trophy,
  Megaphone, UserCheck, LogOut, ChevronRight, Menu, X, Calendar, ArrowRight,
  TrendingUp, Clock, CheckCircle2, Shield, Crown
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

import RosterManager from '../../features/roster/RosterManager';
import AttendanceMarker from '../../features/attendance/AttendanceMarker';
import AttendanceHistory from '../../features/attendance/AttendanceHistory';
import ReportsView from '../../features/reports/ReportsView';
import MatchSquadSelector from '../../features/squad/MatchSquadSelector';
import AnnouncementsManager from '../../features/announcements/AnnouncementsManager';
import AdminProfileView from '../../features/admin/AdminProfileView';
import SuperAdminDirectory from '../../features/admin/SuperAdminDirectory';

export default function AdminDashboard({ onLogout }) {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [activeDivision, setActiveDivision] = useState(user?.team === 'GIRLS' ? 'GIRLS' : 'BOYS');
  const team = isSuperAdmin ? activeDivision : (user?.team || 'BOYS');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'directory' | 'roster' | 'mark-attendance' | 'history' | 'reports' | 'squad' | 'announcements' | 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Overview stats state
  const [overviewStats, setOverviewStats] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const fetchOverviewStats = async () => {
    try {
      setLoadingOverview(true);
      const res = await api.reports.getOverview({ team });
      if (res && res.data) {
        setOverviewStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load overview statistics:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewStats();
    }
  }, [activeTab, team]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ id: 'directory', label: 'Access Anyone (Users)', icon: Crown }] : []),
    { id: 'roster', label: 'Players / Roster', icon: Users },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'squad', label: 'Match Squad', icon: Trophy },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-court-sand text-navy-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo / Portal Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-editorial font-black shadow-md ${
                  isSuperAdmin
                    ? 'bg-purple-600 shadow-purple-500/25'
                    : team === 'BOYS'
                    ? 'bg-saffron-600 shadow-saffron-500/25'
                    : 'bg-rose-600 shadow-rose-500/25'
                }`}
              >
                {isSuperAdmin ? <Crown className="w-5 h-5 text-amber-300" /> : 'KK'}
              </div>
              <div>
                <h1 className="font-editorial font-black text-lg text-navy-900 tracking-tight leading-none">
                  {isSuperAdmin ? 'SUPER ADMIN' : `${team} ADMIN`}
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isSuperAdmin ? 'Full Access Portal' : 'Kho-Kho Arena Portal'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-navy-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Super Admin Squad Switcher */}
          {isSuperAdmin && (
            <div className="p-1 rounded-2xl bg-slate-100 flex gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveDivision('BOYS')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeDivision === 'BOYS'
                    ? 'bg-white text-saffron-700 shadow-sm border border-saffron-200'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                <span>👦 Boys Squad</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDivision('GIRLS')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeDivision === 'GIRLS'
                    ? 'bg-white text-rose-700 shadow-sm border border-rose-200'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                <span>👧 Girls Squad</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? team === 'BOYS'
                        ? 'bg-saffron-50 text-saffron-700 shadow-sm border border-saffron-200/60'
                        : 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? team === 'BOYS'
                          ? 'text-saffron-600'
                          : 'text-rose-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-navy-900 flex items-center justify-center font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-navy-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              className={`badge-tag ${
                isSuperAdmin
                  ? 'bg-purple-100 text-purple-900 border border-purple-200 shadow-sm'
                  : team === 'BOYS'
                  ? 'bg-saffron-100 text-saffron-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isSuperAdmin
                ? `⚡ Super Admin Portal • Managing ${activeDivision === 'BOYS' ? 'Boys Squad' : 'Girls Squad'}`
                : `${team} Team Administrative Workspace`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('mark-attendance')}
              className="btn-primary text-xs py-1.5 px-3.5 hidden sm:inline-flex"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark Today</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {/* ==================== 1. OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Top Greeting */}
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
                  Welcome back, {user?.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Here is the real-time operational status for the {team} Kho-Kho Team.
                </p>
              </div>

              {/* Real MongoDB Overview Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card-premium p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Active Roster</p>
                  <p className="font-editorial text-3xl sm:text-4xl font-black text-navy-900 mt-1">
                    {loadingOverview ? '—' : overviewStats?.totalActivePlayers || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {team === 'BOYS' ? '23 Expected' : 'Configured Active Athletes'}
                  </p>
                </div>

                <div className="card-premium p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Today</p>
                  <p className="font-editorial text-3xl sm:text-4xl font-black text-sportsGreen-dark mt-1">
                    {loadingOverview ? '—' : overviewStats?.presentToday || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {overviewStats?.hasTodaySession ? 'Logged Practice Sessions' : 'No Practice Logged Yet'}
                  </p>
                </div>

                <div className="card-premium p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent Today</p>
                  <p className="font-editorial text-3xl sm:text-4xl font-black text-rose-600 mt-1">
                    {loadingOverview ? '—' : overviewStats?.absentToday || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {overviewStats?.lateToday || 0} Late • {overviewStats?.excusedToday || 0} Excused
                  </p>
                </div>

                <div className="card-premium p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Rate</p>
                  <p className="font-editorial text-3xl sm:text-4xl font-black text-saffron-600 mt-1">
                    {loadingOverview ? '—' : `${overviewStats?.todayPercentage || 0}%`}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Monthly Avg: {overviewStats?.monthlySummary?.percentage || 0}%
                  </p>
                </div>
              </div>

              {/* Weekly Trend Recharts Chart */}
              {overviewStats?.weeklyTrend && overviewStats.weeklyTrend.length > 0 && (
                <div className="card-premium p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-editorial text-base font-bold text-navy-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-saffron-600" />
                      7-Day Attendance Trend
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Real Session Counts</span>
                  </div>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewStats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        />
                        <Bar dataKey="present" name="Present Athletes" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Dual Columns: Upcoming Matches & Recent Updates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Matches */}
                <div className="card-premium p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-base font-bold text-navy-900 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Upcoming Fixtures
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('squad')}
                      className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
                    >
                      Manage Squads →
                    </button>
                  </div>

                  {overviewStats?.upcomingMatches?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No upcoming fixtures scheduled.</p>
                  ) : (
                    <div className="space-y-3">
                      {overviewStats?.upcomingMatches?.map((m) => (
                        <div key={m._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-navy-900">vs {m.opponent}</p>
                            <p className="text-[11px] text-slate-500">{m.competition}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(m.matchDate).toLocaleDateString()} • {m.venue}
                            </p>
                          </div>
                          <span className="badge-tag bg-white text-navy-800 border border-slate-200 text-[10px]">
                            Squad: {m.squadSize} Max
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Sessions */}
                <div className="card-premium p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-base font-bold text-navy-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Recent Attendance Sessions
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
                    >
                      View All History →
                    </button>
                  </div>

                  {overviewStats?.recentSessions?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No recent sessions recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {overviewStats?.recentSessions?.map((s) => (
                        <div key={s._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-navy-900">{s.sessionLabel}</p>
                            <p className="text-[11px] text-slate-500">{s.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-editorial font-bold text-sm text-sportsGreen-dark">
                              {s.totalPresent || 0} Present
                            </span>
                            <p className="text-[10px] text-slate-400">{s.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 1.5 SUPER ADMIN: DIRECTORY TAB ==================== */}
          {activeTab === 'directory' && isSuperAdmin && <SuperAdminDirectory />}

          {/* ==================== 2. PLAYERS / ROSTER TAB ==================== */}
          {activeTab === 'roster' && <RosterManager team={team} />}

          {/* ==================== 3. MARK ATTENDANCE TAB ==================== */}
          {activeTab === 'mark-attendance' && <AttendanceMarker team={team} />}

          {/* ==================== 4. ATTENDANCE HISTORY TAB ==================== */}
          {activeTab === 'history' && (
            <AttendanceHistory
              team={team}
              onSelectSession={(sessionId) => setActiveTab('mark-attendance')}
            />
          )}

          {/* ==================== 5. REPORTS & ANALYTICS TAB ==================== */}
          {activeTab === 'reports' && <ReportsView team={team} />}

          {/* ==================== 6. MATCH SQUAD TAB ==================== */}
          {activeTab === 'squad' && <MatchSquadSelector team={team} />}

          {/* ==================== 7. ANNOUNCEMENTS TAB ==================== */}
          {activeTab === 'announcements' && <AnnouncementsManager team={team} />}

          {/* ==================== 8. ADMIN PROFILE TAB ==================== */}
          {activeTab === 'profile' && <AdminProfileView />}
        </main>
      </div>
    </div>
  );
}
