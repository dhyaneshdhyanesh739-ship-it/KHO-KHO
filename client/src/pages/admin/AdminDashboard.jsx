import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, History, BarChart3, Trophy,
  Megaphone, UserCheck, LogOut, ChevronRight, Menu, X, Calendar, ArrowRight,
  TrendingUp, Clock, CheckCircle2, Shield, Crown, Dumbbell, Search, AlertTriangle,
  UserPlus, Trash2, Plus, AlertCircle
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
import DailyGroundLogManager from '../../features/ground/DailyGroundLogManager';

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
  const [matchSearch, setMatchSearch] = useState('');
  const [matchStatusFilter, setMatchStatusFilter] = useState('ALL'); // 'ALL' | 'DEDUCTIONS' | 'CLEAN'

  // Add Member Modal state
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberDivision, setNewMemberDivision] = useState(team);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    jerseyNumber: '',
    position: 'All-Rounder',
    playerId: '',
    phone: '',
    email: '',
    bloodGroup: 'Unknown',
  });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');

  // Delete Member Confirmation state
  const [deleteConfirmMember, setDeleteConfirmMember] = useState(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Overview Action feedback notification
  const [overviewNotification, setOverviewNotification] = useState({ type: '', message: '' });

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

  const handleOpenAddMemberModal = () => {
    const currentDiv = isSuperAdmin ? activeDivision : team;
    setNewMemberDivision(currentDiv);
    setMemberFormError('');

    const raw = overviewStats?.teamMatchAttendance?.members || [];
    const existingJerseys = new Set(raw.map((m) => Number(m.jerseyNumber)));
    let nextJersey = 1;
    while (existingJerseys.has(nextJersey)) {
      nextJersey++;
    }
    const prefix = currentDiv === 'BOYS' ? 'B' : 'G';
    setNewMemberForm({
      name: '',
      jerseyNumber: String(nextJersey),
      position: 'All-Rounder',
      playerId: `${prefix}${String(nextJersey).padStart(2, '0')}`,
      phone: '',
      email: '',
      bloodGroup: 'Unknown',
    });
    setAddMemberModalOpen(true);
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setMemberFormError('');
    if (!newMemberForm.name.trim() || !newMemberForm.jerseyNumber || !newMemberForm.playerId.trim()) {
      setMemberFormError('Athlete Name, Jersey Number, and Player ID are required.');
      return;
    }

    setIsSubmittingMember(true);
    try {
      const targetTeamDivision = isSuperAdmin ? newMemberDivision : team;
      const payload = {
        team: targetTeamDivision,
        name: newMemberForm.name.trim(),
        jerseyNumber: Number(newMemberForm.jerseyNumber),
        position: newMemberForm.position,
        playerId: newMemberForm.playerId.trim().toUpperCase(),
        bloodGroup: newMemberForm.bloodGroup,
        contactInfo: {
          phone: newMemberForm.phone.trim(),
          email: newMemberForm.email.trim(),
        },
        createLogin: true,
      };

      const res = await api.players.create(payload);
      if (res.success) {
        setAddMemberModalOpen(false);
        setOverviewNotification({
          type: 'success',
          message: res.message || `Successfully added ${newMemberForm.name} to the ${targetTeamDivision} team roster!`,
        });
        setTimeout(() => setOverviewNotification({ type: '', message: '' }), 6000);
        await fetchOverviewStats();
      }
    } catch (err) {
      setMemberFormError(err.data?.message || err.message || 'Failed to add team member.');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteConfirmMember) return;
    setIsDeletingMember(true);
    try {
      const res = await api.players.delete(deleteConfirmMember._id);
      if (res.success) {
        const deletedName = deleteConfirmMember.name;
        setDeleteConfirmMember(null);
        setOverviewNotification({
          type: 'success',
          message: res.message || `Team member ${deletedName} was successfully removed.`,
        });
        setTimeout(() => setOverviewNotification({ type: '', message: '' }), 6000);
        await fetchOverviewStats();
      }
    } catch (err) {
      setOverviewNotification({
        type: 'error',
        message: err.data?.message || err.message || 'Failed to remove team member.',
      });
      setTimeout(() => setOverviewNotification({ type: '', message: '' }), 6000);
      setDeleteConfirmMember(null);
    } finally {
      setIsDeletingMember(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ id: 'directory', label: 'Access Anyone (Users)', icon: Crown }] : []),
    { id: 'roster', label: 'Players / Roster', icon: Users },
    { id: 'ground-log', label: 'Daily Ground Log', icon: Dumbbell },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'squad', label: 'Match Squad', icon: Trophy },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck },
  ];

  const rawMembers = overviewStats?.teamMatchAttendance?.members || [];
  const filteredMembers = rawMembers.filter((m) => {
    const matchesSearch =
      !matchSearch.trim() ||
      m.name?.toLowerCase().includes(matchSearch.toLowerCase()) ||
      String(m.jerseyNumber).includes(matchSearch) ||
      m.playerId?.toLowerCase().includes(matchSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (matchStatusFilter === 'DEDUCTIONS') return m.totalDeduction > 0;
    if (matchStatusFilter === 'CLEAN') return m.totalDeduction === 0;
    return true;
  });

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

              {/* Action Notification Banner */}
              {overviewNotification.message && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in ${
                    overviewNotification.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {overviewNotification.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{overviewNotification.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOverviewNotification({ type: '', message: '' })}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

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

              {/* ==================== TEAM MEMBERS MATCH ATTENDANCE MONITOR (100% Base, -2% Absent, -1% Excused) ==================== */}
              <div className="card-premium p-6 space-y-5 bg-white border border-slate-200 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                        team === 'BOYS' ? 'bg-saffron-600 shadow-saffron-500/25' : 'bg-rose-600 shadow-rose-500/25'
                      }`}
                    >
                      <Trophy className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-editorial text-lg font-black text-navy-900 tracking-tight">
                          Team Members Match Attendance Monitor
                        </h3>
                        <span
                          className={`badge-tag text-[10px] ${
                            team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {team} Division
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Base match quota: <strong>100%</strong> • Absent automatically deducts <strong>-2%</strong> • Excused deducts <strong>-1%</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setMatchStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          matchStatusFilter === 'ALL' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-navy-900'
                        }`}
                      >
                        All Members ({rawMembers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchStatusFilter('DEDUCTIONS')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          matchStatusFilter === 'DEDUCTIONS' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-500 hover:text-navy-900'
                        }`}
                      >
                        Deductions ({overviewStats?.teamMatchAttendance?.membersWithDeductions || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchStatusFilter('CLEAN')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          matchStatusFilter === 'CLEAN' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-navy-900'
                        }`}
                      >
                        Clean 100% ({overviewStats?.teamMatchAttendance?.membersFullStanding || 0})
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={matchSearch}
                        onChange={(e) => setMatchSearch(e.target.value)}
                        placeholder="Search member..."
                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-saffron-500 w-36 sm:w-44"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddMemberModal}
                      className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Team Member</span>
                    </button>
                  </div>
                </div>

                {/* Team Match Attendance KPI Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting Quota</p>
                    <p className="font-editorial text-xl font-black text-navy-900 mt-0.5">75% Base</p>
                    <p className="text-[10px] text-slate-500">Official Standard</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squad Average</p>
                    <p className={`font-editorial text-xl font-black mt-0.5 ${
                      (overviewStats?.teamMatchAttendance?.averageMatchAttendance || 75) >= 70
                        ? 'text-sportsGreen-dark'
                        : 'text-amber-600'
                    }`}>
                      {overviewStats?.teamMatchAttendance?.averageMatchAttendance || 75}%
                    </p>
                    <p className="text-[10px] text-slate-500">Team Match Readiness</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-center">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">With Deductions</p>
                    <p className="font-editorial text-xl font-black text-rose-600 mt-0.5">
                      {overviewStats?.teamMatchAttendance?.membersWithDeductions || 0}
                    </p>
                    <p className="text-[10px] text-rose-600">Absences or Excuses</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Zero Penalties</p>
                    <p className="font-editorial text-xl font-black text-emerald-700 mt-0.5">
                      {overviewStats?.teamMatchAttendance?.membersFullStanding || 0}
                    </p>
                    <p className="text-[10px] text-emerald-700">Full 75% Maintained</p>
                  </div>
                </div>

                {/* Team Members List Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-3.5 w-16">Jersey</th>
                        <th className="py-3 px-3.5">Athlete</th>
                        <th className="py-3 px-3.5">Position</th>
                        <th className="py-3 px-3.5 text-center">Sessions Logged</th>
                        <th className="py-3 px-3.5 text-center">Absent (-2%)</th>
                        <th className="py-3 px-3.5 text-center">Excused (-1%)</th>
                        <th className="py-3 px-3.5 text-center">Total Penalty</th>
                        <th className="py-3 px-3.5 text-center">Match Attendance</th>
                        <th className="py-3 px-3.5 text-center">Standing</th>
                        <th className="py-3 px-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingOverview ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            Loading team members match attendance...
                          </td>
                        </tr>
                      ) : filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            No team members match the search / filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((m) => {
                          const isClean = m.totalDeduction === 0;
                          return (
                            <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3.5 font-editorial font-black text-sm text-saffron-600">
                                #{m.jerseyNumber}
                              </td>
                              <td className="py-3 px-3.5">
                                <p className="font-bold text-navy-900 leading-tight">{m.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">{m.playerId}</p>
                              </td>
                              <td className="py-3 px-3.5">
                                <span className="badge-tag bg-slate-100 text-slate-600 text-[10px]">
                                  {m.position}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span className="font-semibold text-slate-700">
                                  {m.present} Present / {m.totalSessions} Total
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {m.absent > 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                    {m.absent} miss (-{m.absentDeduction}%)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium">0</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {m.excused > 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                    {m.excused} exc (-{m.excusedDeduction}%)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium">0</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-center font-bold">
                                {m.totalDeduction > 0 ? (
                                  <span className="text-rose-600">-{m.totalDeduction}%</span>
                                ) : (
                                  <span className="text-emerald-600">0%</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span
                                  className={`font-editorial font-black text-sm ${
                                    m.matchAttendancePercentage >= 75
                                      ? 'text-sportsGreen-dark'
                                      : m.matchAttendancePercentage >= 70
                                      ? 'text-amber-600'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {m.matchAttendancePercentage}%
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span
                                  className={`badge-tag text-[10px] ${
                                    isClean
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {isClean ? '✓ 75% Full Quota' : `⚠️ -${m.totalDeduction}% Reduced`}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmMember(m)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                                  title={`Remove ${m.name} from team`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Remove</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
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

          {/* ==================== 2.5 DAILY GROUND LOG TAB ==================== */}
          {activeTab === 'ground-log' && <DailyGroundLogManager team={team} />}

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

          {/* ==================== ADD TEAM MEMBER MODAL ==================== */}
          {addMemberModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                        (isSuperAdmin ? newMemberDivision : team) === 'BOYS' ? 'bg-saffron-600' : 'bg-rose-600'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-navy-900 leading-tight">
                        Add New Team Member
                      </h3>
                      <p className="text-xs text-slate-500">
                        Register athlete to the {isSuperAdmin ? newMemberDivision : team} Kho-Kho team
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateMember} className="p-6 space-y-4 overflow-y-auto flex-1">
                  {memberFormError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{memberFormError}</span>
                    </div>
                  )}

                  {/* Division Selector for Super Admin */}
                  {isSuperAdmin && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Team Division
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewMemberDivision('BOYS');
                            setNewMemberForm((prev) => ({
                              ...prev,
                              playerId: prev.playerId.replace(/^G/, 'B'),
                            }));
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            newMemberDivision === 'BOYS'
                              ? 'bg-saffron-50 border-saffron-500 text-saffron-800 shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Boys Division
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewMemberDivision('GIRLS');
                            setNewMemberForm((prev) => ({
                              ...prev,
                              playerId: prev.playerId.replace(/^B/, 'G'),
                            }));
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            newMemberDivision === 'GIRLS'
                              ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Girls Division
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Athlete Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMemberForm.name}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Jersey Number *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        required
                        value={newMemberForm.jerseyNumber}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, jerseyNumber: e.target.value })}
                        placeholder="e.g. 24"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Player ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMemberForm.playerId}
                        onChange={(e) =>
                          setNewMemberForm({ ...newMemberForm, playerId: e.target.value.toUpperCase() })
                        }
                        placeholder="e.g. B24"
                        className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Used for athlete portal username</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Playing Position
                      </label>
                      <select
                        value={newMemberForm.position}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, position: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500 bg-white"
                      >
                        <option value="All-Rounder">All-Rounder</option>
                        <option value="Chaser">Chaser</option>
                        <option value="Defender">Defender</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newMemberForm.phone}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={newMemberForm.bloodGroup}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, bloodGroup: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-saffron-500 bg-white"
                      >
                        <option value="Unknown">Unknown</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-navy-900">✨ Automatic Athlete Onboarding:</p>
                    <p>• Starts with official <strong>100% base match attendance quota</strong>.</p>
                    <p>
                      • Generates login credentials automatically (username:{' '}
                      <code>{newMemberForm.playerId.toLowerCase() || 'playerid'}</code>).
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAddMemberModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingMember}
                      className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                    >
                      {isSubmittingMember ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Member...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Member</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== DELETE MEMBER CONFIRMATION MODAL ==================== */}
          {deleteConfirmMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-md border border-slate-100 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-navy-900 leading-tight">
                      Remove Team Member
                    </h3>
                    <p className="text-xs text-slate-500">
                      This action will permanently remove the player from the active roster.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                  <p className="font-bold">
                    Athlete: {deleteConfirmMember.name} (#{deleteConfirmMember.jerseyNumber})
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Team Division: <strong>{team}</strong> • Player ID: <code>{deleteConfirmMember.playerId}</code>
                  </p>
                  <div className="pt-2 text-[11px] text-rose-800 space-y-0.5 border-t border-rose-200/60">
                    <p>• Associated player login account will be removed</p>
                    <p>• Historical attendance logs for this player will be cleaned up</p>
                    <p>• Roster allocations in match squads will be removed</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeletingMember}
                    onClick={() => setDeleteConfirmMember(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingMember}
                    onClick={handleConfirmDeleteMember}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all inline-flex items-center gap-1.5"
                  >
                    {isDeletingMember ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Removal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
