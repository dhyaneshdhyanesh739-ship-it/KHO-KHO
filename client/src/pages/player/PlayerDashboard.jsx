import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, Trophy, Shield, CheckCircle2, XCircle, AlertCircle,
  Megaphone, LogOut, Award, Sparkles, Check, Dumbbell, Flame, Tag, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function PlayerDashboard() {
  const { user, logout } = useAuth();
  const [playerData, setPlayerData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [groundActivities, setGroundActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);

        // 1. Fetch player attendance records if playerRef exists
        if (user?.playerRef) {
          const res = await api.attendance.getPlayerAttendance(user.playerRef);
          if (res && res.data) {
            setAttendanceData(res.data);
          }
        }

        // 2. Fetch team announcements
        const annRes = await api.announcements.getAll({ team: user.team });
        if (annRes && annRes.data) {
          setAnnouncements(annRes.data);
        }

        // 3. Fetch upcoming matches and published squads
        const matchRes = await api.matches.getAll({ team: user.team, timeframe: 'upcoming' });
        if (matchRes && matchRes.data) {
          setUpcomingMatches(matchRes.data);
        }

        // 4. Fetch daily ground training logs (unlocked for attended sessions)
        const groundRes = await api.groundActivities.getPlayer();
        if (groundRes && groundRes.data) {
          setGroundActivities(groundRes.data);
        }
      } catch (err) {
        console.error('Error fetching player dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [user]);

  const summary = attendanceData?.summary || {
    totalSessions: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
    eligibleSessions: 0,
  };

  // Official Match Attendance Policy:
  // Base attendance percentage for the match is 100%.
  // If absent: automatically reduce 2% per session.
  // If excused: automatically reduce 1% per session.
  const absentCount = summary.absent || 0;
  const excusedCount = summary.excused || 0;
  const baseMatchPercentage = summary.baseMatchPercentage ?? 100;
  const absentDeduction = summary.absentDeduction ?? (absentCount * 2);
  const excusedDeduction = summary.excusedDeduction ?? (excusedCount * 1);
  const totalDeduction = summary.totalDeduction ?? (absentDeduction + excusedDeduction);
  const matchAttendancePercentage = summary.matchAttendancePercentage ?? Math.max(0, baseMatchPercentage - totalDeduction);

  return (
    <div className="min-h-screen bg-court-sand text-navy-900 pb-16">
      {/* Top Navbar */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-editorial font-black text-sm shadow-md ${
              user?.team === 'BOYS' ? 'bg-saffron-600' : 'bg-rose-600'
            }`}
          >
            KK
          </div>
          <div>
            <h1 className="font-editorial font-black text-base text-navy-900 leading-none">
              ATHLETE PORTAL
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.team} Team Division
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="btn-secondary py-1.5 px-3 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome & Player Bio Card */}
        <div className="card-premium p-6 sm:p-8 bg-gradient-to-r from-white via-court-sand to-white border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-editorial font-black text-3xl shadow-lg ${
                  user?.team === 'BOYS'
                    ? 'bg-saffron-100 text-saffron-700 border-2 border-saffron-200'
                    : 'bg-rose-100 text-rose-700 border-2 border-rose-200'
                }`}
              >
                #{attendanceData?.player?.jerseyNumber || user?.player?.jerseyNumber || '—'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge-tag ${
                      user?.team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {user?.team} Roster
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ID: {user?.username?.toUpperCase()}
                  </span>
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
                  {user?.name}
                </h2>

                <p className="text-xs font-semibold text-slate-600">
                  Position: <strong className="text-navy-900">{attendanceData?.player?.position || user?.player?.position || 'Athlete'}</strong>
                </p>
              </div>
            </div>

            {/* Match Attendance Percentage Badge */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center sm:text-right shadow-sm shrink-0">
              <div className="flex items-center gap-1.5 justify-center sm:justify-end text-[10px] font-bold uppercase tracking-wider text-saffron-600">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Match Attendance</span>
              </div>
              <p className={`font-editorial text-4xl font-black mt-0.5 ${
                matchAttendancePercentage >= 85 ? 'text-sportsGreen-dark' : matchAttendancePercentage >= 75 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {matchAttendancePercentage}%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Base 100% {totalDeduction > 0 ? `• -${totalDeduction}% Deductions` : '• Zero Deductions'}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== OFFICIAL MATCH ATTENDANCE BREAKDOWN BANNER ==================== */}
        <div className="card-premium p-6 bg-gradient-to-br from-white via-amber-50/20 to-white border border-slate-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial text-base sm:text-lg font-black text-navy-900 leading-tight">
                  Match Squad Attendance Standing
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time attendance score configured for {user?.team} team fixtures.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`badge-tag text-xs font-bold ${
                totalDeduction === 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {totalDeduction === 0 ? '✓ 100% Full Quota Maintained' : `⚠️ -${totalDeduction}% Total Reduction`}
              </span>
            </div>
          </div>

          {/* Three-Pillar Policy Formula Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase text-[10px]">
                <span>1. Baseline Standard</span>
                <span className="text-navy-900 font-black">100% Base</span>
              </div>
              <p className="font-black text-lg text-navy-900 font-editorial">
                {baseMatchPercentage}%
              </p>
              <p className="text-[11px] text-slate-500">
                Official starting match qualification quota for all team members.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-rose-700 font-bold uppercase text-[10px]">
                <span>2. Absent Reduction</span>
                <span className="text-rose-700 font-black">-2% per session</span>
              </div>
              <p className="font-black text-lg text-rose-600 font-editorial">
                {absentCount > 0 ? `-${absentDeduction}%` : '0%'}
              </p>
              <p className="text-[11px] text-slate-600">
                {absentCount} missed session(s) logged • Automatically reduces {absentDeduction}%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-purple-700 font-bold uppercase text-[10px]">
                <span>3. Excused Reduction</span>
                <span className="text-purple-700 font-black">-1% per session</span>
              </div>
              <p className="font-black text-lg text-purple-600 font-editorial">
                {excusedCount > 0 ? `-${excusedDeduction}%` : '0%'}
              </p>
              <p className="text-[11px] text-slate-600">
                {excusedCount} excused session(s) logged • Automatically reduces {excusedDeduction}%.
              </p>
            </div>
          </div>

          {/* Visual Deduction Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <span>Calculated Match Attendance:</span>
                <strong className="text-navy-900 font-editorial text-sm">
                  100% Base − ({absentDeduction}% Absent + {excusedDeduction}% Excused) = {matchAttendancePercentage}%
                </strong>
              </span>
              <span className="font-black font-editorial text-sm text-saffron-600">
                {matchAttendancePercentage}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  matchAttendancePercentage >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-sportsGreen-dark'
                    : matchAttendancePercentage >= 70
                    ? 'bg-gradient-to-r from-amber-500 to-saffron-600'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, matchAttendancePercentage))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              Minimum match selection threshold: 75%
            </p>
          </div>
        </div>

        {/* Notice on Attendance Authority */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Attendance Policy Notice:</strong> All training sessions and match attendances are officially recorded and verified by the head coaching administration. Student-athletes cannot alter records directly. If you notice a clerical error, contact your team coach.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Sessions</p>
            <p className="font-editorial text-3xl font-black text-sportsGreen-dark mt-1">
              {summary.present}
            </p>
            <p className="text-[11px] text-slate-400">Recorded on Court</p>
          </div>

          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent (-2% Each)</p>
            <p className="font-editorial text-3xl font-black text-rose-600 mt-1">
              {summary.absent}
            </p>
            <p className="text-[11px] text-rose-600 font-medium">-{absentDeduction}% Match Deduction</p>
          </div>

          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Excused (-1% Each)</p>
            <p className="font-editorial text-3xl font-black text-purple-600 mt-1">
              {summary.excused}
            </p>
            <p className="text-[11px] text-purple-600 font-medium">-{excusedDeduction}% Match Deduction</p>
          </div>

          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Attendance</p>
            <p className={`font-editorial text-3xl font-black mt-1 ${matchAttendancePercentage >= 75 ? 'text-sportsGreen-dark' : 'text-amber-600'}`}>
              {matchAttendancePercentage}%
            </p>
            <p className="text-[11px] text-slate-400">
              {totalDeduction === 0 ? '75% Baseline Maintained' : `-${totalDeduction}% Total Penalty`}
            </p>
          </div>
        </div>

        {/* Daily Ground Training & Workouts Section (Attendance-Unlocked) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-editorial text-xl font-black text-navy-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span>Daily Ground Activity &amp; Training Log</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Workouts and drills performed on the ground, unlocked for sessions where you were marked <strong>PRESENT</strong> or <strong>LATE</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{groundActivities.length} Ground Activity Logs Unlocked</span>
            </div>
          </div>

          {groundActivities.length === 0 ? (
            <div className="card-premium p-6 sm:p-8 text-center border-dashed border-2 border-slate-200 text-slate-400 space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-navy-900">No Ground Training Logs Available</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Daily ground activities appear automatically for training sessions where your attendance was verified as <strong>PRESENT</strong> or <strong>LATE</strong> on the court.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groundActivities.map((act) => (
                <div
                  key={act._id}
                  className="card-premium p-5 bg-white border border-slate-200 shadow-card flex flex-col justify-between space-y-4 hover:border-saffron-300 transition-all"
                >
                  <div>
                    {/* Date and Player's Attendance Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.date}
                      </span>
                      <span
                        className={`badge-tag text-[10px] ${
                          act.playerAttendanceStatus === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {act.playerAttendanceStatus === 'PRESENT' ? '✓ You Were Present' : '⏱ You Arrived Late'}
                      </span>
                    </div>

                    <h4 className="font-editorial text-base font-bold text-navy-900 mb-1 leading-snug">
                      {act.title}
                    </h4>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] text-saffron-700 font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{act.focusArea}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {act.sessionTime}
                      </span>
                    </div>

                    {/* Drills List */}
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tasks Done On Ground ({act.activities?.length || 0}):
                      </span>
                      <ul className="space-y-1.5">
                        {act.activities?.map((drill, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <span className="w-4 h-4 rounded-full bg-saffron-100 text-saffron-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{drill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Coach remarks */}
                    {act.coachNotes && (
                      <p className="mt-3 text-xs text-slate-600 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl italic">
                        "{act.coachNotes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Intensity: <strong className="text-slate-600">{act.intensity}</strong></span>
                    <span>Verified Log</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dual Panels: Published Match Squads & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upcoming Fixtures & Squad Selection Status */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Upcoming Fixtures & Official Squad Status
            </h3>

            {upcomingMatches.length === 0 ? (
              <div className="card-premium p-8 text-center text-slate-400 text-xs">
                No upcoming matches currently scheduled for the {user?.team} team.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((m) => {
                  const hasSquad = m.status === 'SQUAD_ANNOUNCED';
                  return (
                    <div key={m._id} className="card-premium p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="badge-tag bg-slate-100 text-slate-700 text-[10px]">
                            {m.competition}
                          </span>
                          <h4 className="font-editorial text-xl font-bold text-navy-900 mt-1">
                            vs {m.opponent}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {new Date(m.matchDate).toLocaleDateString()} • {m.venue}
                          </p>
                        </div>

                        <span
                          className={`badge-tag ${
                            hasSquad ? 'bg-sportsGreen-light text-sportsGreen-dark' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {hasSquad ? 'Squad Announced' : 'Draft Selection'}
                        </span>
                      </div>

                      {hasSquad && (
                        <div className="p-3 bg-saffron-50 rounded-xl border border-saffron-200 text-xs flex items-center gap-2 text-saffron-900">
                          <Sparkles className="w-4 h-4 text-saffron-600 shrink-0" />
                          <span>
                            Official match squad has been published by the coaching staff. Check the announcement board below for selected names.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Attendance History Calendar Table */}
            <div className="space-y-3 pt-4">
              <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-saffron-600" />
                Recent Attendance Log
              </h3>

              <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Session</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-navy-800">
                      {!attendanceData?.records || attendanceData.records.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No attendance history logged yet.
                          </td>
                        </tr>
                      ) : (
                        attendanceData.records.slice(0, 10).map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-mono font-medium text-slate-600">
                              {r.session?.date || r.date}
                            </td>
                            <td className="py-3 px-4 font-bold text-navy-900">
                              {r.session?.sessionLabel || 'Practice'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`badge-tag ${
                                  r.status === 'PRESENT'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'ABSENT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : r.status === 'LATE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {r.notes || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Published Team Announcements */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-saffron-600" />
              Team Noticeboard
            </h3>

            {announcements.length === 0 ? (
              <div className="card-premium p-8 text-center text-slate-400 text-xs">
                No announcements currently published.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div
                    key={item._id}
                    className={`card-premium p-5 space-y-2 border ${
                      item.isUrgent ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`badge-tag ${
                          item.category === 'MATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : item.category === 'PRACTICE'
                            ? 'bg-blue-100 text-blue-800'
                            : item.category === 'SQUAD'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-editorial text-base font-bold text-navy-900">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {item.message}
                    </p>

                    <p className="text-[10px] text-slate-400 pt-1">
                      Posted by {item.authorName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
