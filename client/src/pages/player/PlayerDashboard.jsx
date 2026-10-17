import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, Trophy, Shield, CheckCircle2, XCircle, AlertCircle,
  Megaphone, LogOut, Award, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function PlayerDashboard() {
  const { user, logout } = useAuth();
  const [playerData, setPlayerData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
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
  };

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

            {/* Attendance Percentage Badge */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center sm:text-right shadow-sm shrink-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Attendance
              </p>
              <p className="font-editorial text-4xl font-black text-saffron-600 mt-0.5">
                {summary.percentage}%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {summary.present} Present / {summary.eligibleSessions} Eligible Sessions
              </p>
            </div>
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent</p>
            <p className="font-editorial text-3xl font-black text-rose-600 mt-1">
              {summary.absent}
            </p>
            <p className="text-[11px] text-slate-400">Unexcused Misses</p>
          </div>

          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Late / Excused</p>
            <p className="font-editorial text-3xl font-black text-amber-500 mt-1">
              {summary.late + summary.excused}
            </p>
            <p className="text-[11px] text-slate-400">{summary.late} Late • {summary.excused} Excused</p>
          </div>

          <div className="card-premium p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Squad Qualification</p>
            <p className={`font-editorial text-2xl font-black mt-1 ${summary.percentage >= 75 ? 'text-sportsGreen-dark' : 'text-amber-600'}`}>
              {summary.percentage >= 75 ? 'Eligible' : 'Under Review'}
            </p>
            <p className="text-[11px] text-slate-400">75% Threshold</p>
          </div>
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
