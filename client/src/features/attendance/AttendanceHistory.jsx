import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Lock, Unlock, Eye, Edit3, Filter } from 'lucide-react';
import { api } from '../../services/api';

export default function AttendanceHistory({ team, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.attendance.getSessions({
        team,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res && res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Failed to load session history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [team, startDate, endDate, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`badge-tag ${
                team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {team} Archive
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Attendance History & Session Log
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical log of all recorded training sessions, coaches in charge, and finalization audits.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-premium p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white font-medium"
        >
          <option value="">All Statuses</option>
          <option value="FINALIZED">Finalized Only</option>
          <option value="DRAFT">Draft Only</option>
        </select>

        {(startDate || endDate || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setStatusFilter('');
            }}
            className="text-xs text-slate-500 hover:text-navy-900 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Sessions Grid / Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Session Label</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Present</th>
                <th className="py-3.5 px-4 text-center">Absent</th>
                <th className="py-3.5 px-4 text-center">Late / Excused</th>
                <th className="py-3.5 px-4 text-center">Attendance %</th>
                <th className="py-3.5 px-4 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading session history...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No attendance sessions recorded yet</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Use "Mark Attendance" to log a new practice session.</p>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const eligible = (s.totalEligible || 0) - (s.totalExcused || 0);
                  const rate = eligible > 0 ? Math.round(((s.totalPresent || 0) / eligible) * 100) : 0;

                  return (
                    <tr
                      key={s._id}
                      onClick={() => onSelectSession && onSelectSession(s._id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-navy-900">
                        {s.date}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {s.sessionLabel}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            s.status === 'FINALIZED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'FINALIZED' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-sportsGreen-dark">
                        {s.totalPresent || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                        {s.totalAbsent || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {s.totalLate || 0}L / {s.totalExcused || 0}E
                      </td>

                      <td className="py-3.5 px-4 text-center font-editorial font-black text-sm text-saffron-600">
                        {rate}%
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {s.recordedBy?.name || 'Staff'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
