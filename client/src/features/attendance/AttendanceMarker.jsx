import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Save,
  Users, Check, X, Shield, Lock, Unlock, FileText, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_SESSION_LABELS = [
  'Morning Conditioning & Speed Drills',
  'Tactical Kho & Pole Turn Practice',
  'Defense 3-Batch Evasion Drills',
  'Match Simulation & Zigzag Running',
  'Agility & Stamina Circuit',
  'Tactical Video & Mat Footwork',
  'Pre-Match Kit & Fitness Inspection',
];

export default function AttendanceMarker({ team }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionLabel, setSessionLabel] = useState(DEFAULT_SESSION_LABELS[0]);
  const [customLabel, setCustomLabel] = useState('');
  const [sessionsOnDate, setSessionsOnDate] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Player rows: array of { player, status, notes, isModified }
  const [playerRows, setPlayerRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [finalizeOnSave, setFinalizeOnSave] = useState(false);

  // Notifications & Confirmations
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [confirmFinalizedModalOpen, setConfirmFinalizedModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing sessions for the selected date
  const loadSessionsForDate = async () => {
    try {
      const res = await api.attendance.getSessions({ team, startDate: selectedDate, endDate: selectedDate });
      if (res && res.data) {
        setSessionsOnDate(res.data);
        if (res.data.length > 0) {
          // Default to the first session found on this date
          loadSessionDetails(res.data[0]._id);
        } else {
          setActiveSession(null);
          loadActivePlayersFresh();
        }
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  // Load fresh active players when creating a new session
  const loadActivePlayersFresh = async () => {
    try {
      setLoading(true);
      const res = await api.players.getAll({ team, status: 'active', sortBy: 'jerseyNumber', sortOrder: 'asc' });
      if (res && res.data) {
        const rows = res.data.map((p) => ({
          player: p,
          status: 'PRESENT', // default to present
          notes: '',
          isModified: false,
        }));
        setPlayerRows(rows);
        setHasUnsavedChanges(true); // new session needs saving
      }
    } catch (err) {
      console.error('Failed to load active players:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load session and records from backend
  const loadSessionDetails = async (sessionId) => {
    try {
      setLoading(true);
      const res = await api.attendance.getSession(sessionId);
      if (res && res.data) {
        setActiveSession(res.data.session);
        setFinalizeOnSave(res.data.session.status === 'FINALIZED');
        const rows = res.data.players.map((item) => ({
          player: item.player,
          status: item.status || 'PRESENT',
          notes: item.notes || '',
          isModified: false,
        }));
        setPlayerRows(rows);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionsForDate();
  }, [selectedDate, team]);

  // Handle changing status for an individual player
  const handleStatusChange = (playerId, newStatus) => {
    setPlayerRows((prev) =>
      prev.map((row) => {
        if (row.player._id === playerId) {
          return { ...row, status: newStatus, isModified: true };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Handle notes change
  const handleNotesChange = (playerId, notes) => {
    setPlayerRows((prev) =>
      prev.map((row) => {
        if (row.player._id === playerId) {
          return { ...row, notes, isModified: true };
        }
        return row;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Select All Present quick action
  const handleSelectAllPresent = () => {
    setPlayerRows((prev) =>
      prev.map((row) => ({
        ...row,
        status: 'PRESENT',
        isModified: true,
      }))
    );
    setHasUnsavedChanges(true);
  };

  // Calculate live statistics
  const totalEligible = playerRows.length;
  const presentCount = playerRows.filter((r) => r.status === 'PRESENT').length;
  const absentCount = playerRows.filter((r) => r.status === 'ABSENT').length;
  const lateCount = playerRows.filter((r) => r.status === 'LATE').length;
  const excusedCount = playerRows.filter((r) => r.status === 'EXCUSED').length;
  const eligibleSessions = totalEligible - excusedCount;
  const attendancePercentage = eligibleSessions > 0 ? Math.round((presentCount / eligibleSessions) * 100) : 0;

  // Save attendance batch
  const handleSave = async (confirmEditFinalized = false) => {
    setSaveError('');
    setSaveSuccess('');

    // If session doesn't exist yet, create it first
    let currentSessionId = activeSession?._id;
    const effectiveLabel = sessionLabel === 'CUSTOM' ? (customLabel.trim() || 'General Practice') : sessionLabel;

    setIsSaving(true);
    try {
      if (!currentSessionId) {
        const createRes = await api.attendance.createSession({
          team,
          date: selectedDate,
          sessionLabel: effectiveLabel,
        });
        if (createRes.success && createRes.data) {
          currentSessionId = createRes.data._id;
          setActiveSession(createRes.data);
        } else {
          throw new Error('Failed to establish attendance session.');
        }
      } else if (activeSession.status === 'FINALIZED' && !confirmEditFinalized) {
        // Prompt for confirmation before editing finalized records
        setConfirmFinalizedModalOpen(true);
        setIsSaving(false);
        return;
      }

      const recordsPayload = playerRows.map((r) => ({
        playerId: r.player._id,
        status: r.status,
        notes: r.notes,
      }));

      const res = await api.attendance.saveBatch({
        sessionId: currentSessionId,
        records: recordsPayload,
        finalize: finalizeOnSave,
        confirmEditFinalized,
      });

      if (res.success) {
        setSaveSuccess(res.message);
        setHasUnsavedChanges(false);
        setConfirmFinalizedModalOpen(false);
        setTimeout(() => setSaveSuccess(''), 5000);
        // Refresh session
        loadSessionDetails(currentSessionId);
      }
    } catch (err) {
      if (err.data?.isFinalized) {
        setConfirmFinalizedModalOpen(true);
      } else {
        setSaveError(err.data?.message || err.message || 'Failed to save attendance records.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Division Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`badge-tag ${
                team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {team} Team
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Mark Session Attendance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official daily attendance logging • Verified MongoDB storage & automatic squad eligibility tracking
          </p>
        </div>

        {/* Live Summary Counter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sportsGreen-dark" />
            <span>Present: {presentCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Absent: {absentCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Late: {lateCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-saffron-50 border border-saffron-200 text-xs font-black text-saffron-700 shadow-sm">
            Rate: {attendancePercentage}%
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>You have unsaved attendance changes for this session. Remember to save to update records.</span>
          </div>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary py-1 px-3 text-xs bg-amber-600 hover:bg-amber-700 shadow-none"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Session Configuration Card */}
      <div className="card-premium p-6">
        <h3 className="font-editorial text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-saffron-600" />
          Session Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Training Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy-900 outline-none focus:border-saffron-500"
            />
          </div>

          {/* Session Selector / Existing */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Session Label
            </label>
            {sessionsOnDate.length > 0 ? (
              <select
                value={activeSession?._id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'NEW') {
                    setActiveSession(null);
                    loadActivePlayersFresh();
                  } else {
                    loadSessionDetails(val);
                  }
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy-900 outline-none"
              >
                {sessionsOnDate.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.sessionLabel} ({s.status})
                  </option>
                ))}
                <option value="NEW">+ Create Another Session on this Date</option>
              </select>
            ) : (
              <select
                value={sessionLabel}
                onChange={(e) => setSessionLabel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-navy-900 outline-none"
              >
                {DEFAULT_SESSION_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
                <option value="CUSTOM">Custom Training Session...</option>
              </select>
            )}
          </div>

          {/* Session Status & Quick Action */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllPresent}
                className="flex-1 btn-secondary text-xs py-2 text-sportsGreen-dark hover:bg-emerald-50 border-emerald-200"
              >
                <Check className="w-3.5 h-3.5" />
                Select All Present
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex-1 btn-primary text-xs py-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Label input if chosen */}
        {sessionLabel === 'CUSTOM' && !activeSession && (
          <div className="mt-3">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Enter custom training session description..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-saffron-500"
            />
          </div>
        )}

        {/* Status Indicator Bar */}
        {activeSession && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Session Status:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                  activeSession.status === 'FINALIZED'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {activeSession.status === 'FINALIZED' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {activeSession.status}
              </span>
              {activeSession.recordedBy && (
                <span className="text-[11px] text-slate-400">
                  (Recorded by {activeSession.recordedBy.name || 'Admin'})
                </span>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-navy-900">
              <input
                type="checkbox"
                checked={finalizeOnSave}
                onChange={(e) => {
                  setFinalizeOnSave(e.target.checked);
                  setHasUnsavedChanges(true);
                }}
                className="rounded text-saffron-600 focus:ring-saffron-500"
              />
              <span>Mark Session as Finalized on Save</span>
            </label>
          </div>
        )}
      </div>

      {/* Players Attendance Entry List */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">Jersey</th>
                <th className="py-3.5 px-4">Athlete</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Attendance Status</th>
                <th className="py-3.5 px-4">Coaching Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading active athletes for this session...
                  </td>
                </tr>
              ) : playerRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No active athletes available. Please add players to the {team} roster first.
                  </td>
                </tr>
              ) : (
                playerRows.map((row) => {
                  const { player, status, notes } = row;
                  return (
                    <tr key={player._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-editorial font-black text-sm text-saffron-600">
                        #{player.jerseyNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-navy-900">{player.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{player.playerId}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="badge-tag bg-slate-100 text-slate-600">
                          {player.position}
                        </span>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(player._id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                              status === 'PRESENT'
                                ? 'bg-sportsGreen-dark text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(player._id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                              status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(player._id, 'LATE')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                              status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(player._id, 'EXCUSED')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                              status === 'EXCUSED'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>

                      {/* Notes / Remarks Input */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => handleNotesChange(player._id, e.target.value)}
                          placeholder="Optional remarks (e.g. academic leave, minor ankle strain)..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none text-navy-800"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Configured Policy: <strong>Excused</strong> sessions are excluded from the denominator. Missing sessions are never assumed to be absences.
          </p>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary py-2.5 px-6 text-sm shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to Database...' : 'Save Entire Attendance Batch'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Finalized Session Edits */}
      {confirmFinalizedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-navy-900">
              Confirm Finalized Session Edit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This attendance session has already been marked <strong>FINALIZED</strong>. Any modifications made now will be explicitly logged in the coaching security audit trail.
            </p>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to overwrite finalized attendance?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmFinalizedModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="btn-primary text-xs px-5 py-2 bg-amber-600 hover:bg-amber-700"
              >
                Confirm & Overwrite Finalized Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
