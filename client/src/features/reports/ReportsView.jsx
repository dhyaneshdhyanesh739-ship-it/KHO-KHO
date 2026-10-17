import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Calendar, Download, FileText, Filter, TrendingUp, BarChart2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ReportsView({ team }) {
  const [reportType, setReportType] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'custom'
  const [loading, setLoading] = useState(false);

  // Daily report state
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailyData, setDailyData] = useState(null);

  // Weekly report state
  const [weeklyData, setWeeklyData] = useState(null);

  // Monthly report state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);

  // Custom report state
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customStatus, setCustomStatus] = useState('ALL');
  const [customData, setCustomData] = useState(null);

  // Fetch report data on parameters change
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        if (reportType === 'daily') {
          const res = await api.reports.getDaily({ team, date: dailyDate });
          if (res && res.data) setDailyData(res.data);
        } else if (reportType === 'weekly') {
          const res = await api.reports.getWeekly({ team });
          if (res && res.data) setWeeklyData(res.data);
        } else if (reportType === 'monthly') {
          const res = await api.reports.getMonthly({ team, month: selectedMonth, year: selectedYear });
          if (res && res.data) setMonthlyData(res.data);
        } else if (reportType === 'custom') {
          const res = await api.reports.getCustom({
            team,
            startDate: customStart || undefined,
            endDate: customEnd || undefined,
            status: customStatus,
          });
          if (res && res.data) setCustomData(res.data);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [team, reportType, dailyDate, selectedMonth, selectedYear, customStart, customEnd, customStatus]);

  const handleExportCustomCsv = () => {
    const qs = new URLSearchParams({
      team,
      ...(customStart && { startDate: customStart }),
      ...(customEnd && { endDate: customEnd }),
      ...(customStatus !== 'ALL' && { status: customStatus }),
      exportCsv: 'true',
    }).toString();
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/reports/custom?${qs}`, '_blank');
  };

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
              {team} Analytics
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Reports & Attendance Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic attendance calculation • Formula: Present Sessions ÷ (Total Recorded − Excused) × 100
          </p>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReportType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                reportType === type
                  ? 'bg-white text-saffron-600 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 1. DAILY REPORT ==================== */}
      {reportType === 'daily' && (
        <div className="space-y-6">
          {/* Date Selector */}
          <div className="card-premium p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <label className="font-bold text-slate-700">Select Date:</label>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            {dailyData?.session && (
              <span className="text-xs font-bold text-navy-800">
                Session: <strong className="text-saffron-600">{dailyData.session.sessionLabel}</strong> ({dailyData.session.status})
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading daily report...</div>
          ) : !dailyData?.session ? (
            <div className="card-premium p-12 text-center text-slate-500 text-xs">
              No recorded practice sessions found for {team} on {dailyDate}.
            </div>
          ) : (
            <div className="card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Jersey</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Coaching Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyData.records.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-editorial font-black text-saffron-600">
                          #{r.player?.jerseyNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-900">
                          {r.player?.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {r.player?.position}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. WEEKLY REPORT ==================== */}
      {reportType === 'weekly' && (
        <div className="space-y-6">
          <div className="card-premium p-4 flex items-center justify-between text-xs text-slate-600">
            <span>
              Week Period: <strong>{weeklyData?.startDate}</strong> to <strong>{weeklyData?.endDate}</strong>
            </span>
            <span>Total Sessions in Week: <strong>{weeklyData?.sessions?.length || 0}</strong></span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading weekly breakdown...</div>
          ) : !weeklyData?.playerMatrix || weeklyData.playerMatrix.length === 0 ? (
            <div className="card-premium p-12 text-center text-slate-500 text-xs">
              No weekly session data available for this range.
            </div>
          ) : (
            <div className="card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Jersey</th>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-center">Late</th>
                      <th className="py-3 px-4 text-center">Excused</th>
                      <th className="py-3 px-4 text-center">Week Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyData.playerMatrix.map((item) => (
                      <tr key={item.player._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-editorial font-black text-saffron-600">
                          #{item.player.jerseyNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-900">
                          {item.player.name}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-sportsGreen-dark">
                          {item.presentCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          {item.absentCount}
                        </td>
                        <td className="py-3 px-4 text-center text-amber-600 font-medium">
                          {item.lateCount}
                        </td>
                        <td className="py-3 px-4 text-center text-purple-600 font-medium">
                          {item.excusedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-editorial font-black text-sm text-saffron-600">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. MONTHLY REPORT & CHARTS ==================== */}
      {reportType === 'monthly' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="card-premium p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <label className="font-bold text-slate-700">Month / Year:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="text-xs font-bold text-navy-800">
              Total Sessions Recorded: <span className="text-saffron-600">{monthlyData?.sessionsCount || 0}</span>
            </div>
          </div>

          {/* Recharts Monthly Attendance Trend */}
          {monthlyData?.dailyChart && monthlyData.dailyChart.length > 0 && (
            <div className="card-premium p-6">
              <h3 className="font-editorial text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-saffron-600" />
                Daily Attendance Trend (%)
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.dailyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fullDate" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    />
                    <Bar dataKey="percentage" fill="#ea580c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Player Breakdown Table */}
          {monthlyData?.playerStats && (
            <div className="card-premium overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-editorial text-sm font-bold text-navy-900">
                  Athlete Monthly Standing & Percentages
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Jersey</th>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-center">Excused</th>
                      <th className="py-3 px-4 text-center">Monthly Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyData.playerStats.map((item) => (
                      <tr key={item.playerId} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-editorial font-black text-saffron-600">
                          #{item.jerseyNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-900">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.position}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-sportsGreen-dark">
                          {item.present}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          {item.absent}
                        </td>
                        <td className="py-3 px-4 text-center text-purple-600">
                          {item.excused}
                        </td>
                        <td className="py-3 px-4 text-center font-editorial font-black text-sm text-saffron-600">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 4. CUSTOM REPORT & CSV EXPORT ==================== */}
      {reportType === 'custom' && (
        <div className="space-y-6">
          <div className="card-premium p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="font-bold text-slate-700">Date Range:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              />

              <select
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present Only</option>
                <option value="ABSENT">Absent Only</option>
                <option value="LATE">Late Only</option>
                <option value="EXCUSED">Excused Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportCustomCsv}
              className="btn-primary text-xs py-2 px-4 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Filtering records...</div>
          ) : !customData?.records || customData.records.length === 0 ? (
            <div className="card-premium p-12 text-center text-slate-500 text-xs">
              No matching attendance records found.
            </div>
          ) : (
            <div className="card-premium overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Matching Records: <strong>{customData.totalRecords}</strong></span>
                <span>Sessions Covered: <strong>{customData.sessionsCount}</strong></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Session</th>
                      <th className="py-3 px-4">Jersey</th>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customData.records.slice(0, 100).map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">
                          {r.session?.date || r.date}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {r.session?.sessionLabel}
                        </td>
                        <td className="py-3 px-4 font-editorial font-black text-saffron-600">
                          #{r.player?.jerseyNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-900">
                          {r.player?.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {r.player?.position}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
