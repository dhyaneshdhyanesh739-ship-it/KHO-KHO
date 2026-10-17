import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, Plus, Users, CheckCircle2, AlertTriangle, Shield, Star,
  ArrowRight, Check, X, Lock, Globe, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function MatchSquadSelector({ team }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recommendations state
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Active squad builder state
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [reservePlayers, setReservePlayers] = useState([]);
  const [coachNotes, setCoachNotes] = useState('');

  // Modals & Notifications
  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Create match form state
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    competition: '',
    venue: '',
    matchDate: '',
    squadSize: team === 'BOYS' ? 15 : 14,
    eligibilityMinAttendancePct: 75,
  });

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await api.matches.getAll({ team });
      if (res && res.data) {
        setMatches(res.data);
        if (res.data.length > 0 && !selectedMatch) {
          handleSelectMatch(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [team]);

  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    setActionError('');
    setActionSuccess('');

    // If match already has a squad saved, load it
    try {
      const matchDetails = await api.matches.getById(match._id);
      if (matchDetails?.data?.squadRef) {
        const squad = matchDetails.data.squadRef;
        setSelectedPlayers(squad.selectedPlayers || []);
        setReservePlayers(squad.reservePlayers || []);
        setCoachNotes(squad.coachNotes || '');
      } else {
        // Otherwise generate fresh recommendations
        generateRecommendations(match._id, match.squadSize);
      }
    } catch (err) {
      console.error('Error loading match squad:', err);
    }
  };

  const generateRecommendations = async (matchId, maxSquadSize) => {
    setLoadingRecs(true);
    setActionError('');
    try {
      const res = await api.matches.getRecommendations(matchId, 30);
      if (res && res.data) {
        setRecommendations(res.data);

        // Pre-populate recommended starters into selectedPlayers state
        const initialSelected = res.data.recommendedSquad.map((r) => ({
          player: r.playerId,
          jerseyNumber: r.jerseyNumber,
          name: r.name,
          position: r.position,
          roleInMatch: 'Squad Member',
          attendancePercentage: r.attendancePercentage,
          attendanceSessionsPresent: r.sessionsPresent,
          attendanceSessionsTotal: r.sessionsEligible,
          recommendationScore: r.recommendationScore,
          rankingFactor: r.rankingFactor,
          exceptionApproved: !r.isEligible,
          exceptionReason: !r.isEligible ? 'Coach Tactical Selection Exception' : '',
        }));

        const initialReserves = res.data.recommendedReserves.map((r) => ({
          player: r.playerId,
          jerseyNumber: r.jerseyNumber,
          name: r.name,
          position: r.position,
          attendancePercentage: r.attendancePercentage,
          notes: 'Standby reserve',
        }));

        setSelectedPlayers(initialSelected);
        setReservePlayers(initialReserves);
      }
    } catch (err) {
      setActionError(err.data?.message || err.message || 'Failed to generate recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        team,
        ...newMatch,
        squadSize: Number(newMatch.squadSize),
        eligibilityMinAttendancePct: Number(newMatch.eligibilityMinAttendancePct),
      };

      const res = await api.matches.create(payload);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
        setCreateMatchModalOpen(false);
        setNewMatch({
          opponent: '',
          competition: '',
          venue: '',
          matchDate: '',
          squadSize: team === 'BOYS' ? 15 : 14,
          eligibilityMinAttendancePct: 75,
        });
        loadMatches();
        handleSelectMatch(res.data);
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
    }
  };

  // Toggle candidate from Reserve to Selected (enforcing max squad limit!)
  const handlePromoteToSquad = (playerObj) => {
    if (!selectedMatch) return;
    const maxLimit = selectedMatch.squadSize;

    if (selectedPlayers.length >= maxLimit) {
      setActionError(`Cannot add player: Squad has reached the maximum allowed limit of ${maxLimit} players.`);
      return;
    }

    const playerId = playerObj.player || playerObj.playerId || playerObj._id;
    // Remove from reserves
    setReservePlayers((prev) => prev.filter((p) => String(p.player || p.playerId || p._id) !== String(playerId)));

    // Add to selected
    setSelectedPlayers((prev) => [
      ...prev,
      {
        player: playerId,
        jerseyNumber: playerObj.jerseyNumber,
        name: playerObj.name,
        position: playerObj.position,
        roleInMatch: 'Squad Member',
        attendancePercentage: playerObj.attendancePercentage || 0,
        attendanceSessionsPresent: playerObj.sessionsPresent || playerObj.attendanceSessionsPresent || 0,
        attendanceSessionsTotal: playerObj.sessionsEligible || playerObj.attendanceSessionsTotal || 0,
        recommendationScore: playerObj.recommendationScore || 0,
        rankingFactor: playerObj.rankingFactor || '',
        exceptionApproved: (playerObj.attendancePercentage || 0) < selectedMatch.eligibilityMinAttendancePct,
        exceptionReason: (playerObj.attendancePercentage || 0) < selectedMatch.eligibilityMinAttendancePct ? 'Coach Discretion' : '',
      },
    ]);
    setActionError('');
  };

  // Demote from Selected to Reserve
  const handleDemoteToReserve = (playerObj) => {
    const playerId = playerObj.player || playerObj.playerId || playerObj._id;
    setSelectedPlayers((prev) => prev.filter((p) => String(p.player || p.playerId || p._id) !== String(playerId)));
    setReservePlayers((prev) => [
      ...prev,
      {
        player: playerId,
        jerseyNumber: playerObj.jerseyNumber,
        name: playerObj.name,
        position: playerObj.position,
        attendancePercentage: playerObj.attendancePercentage || 0,
        notes: 'Standby reserve',
      },
    ]);
  };

  // Exception Reason handler
  const handleExceptionReasonChange = (playerId, reason) => {
    setSelectedPlayers((prev) =>
      prev.map((p) => {
        if (String(p.player || p._id) === String(playerId)) {
          return { ...p, exceptionReason: reason, exceptionApproved: !!reason.trim() };
        }
        return p;
      })
    );
  };

  // Save Draft Squad
  const handleSaveSquad = async () => {
    if (!selectedMatch) return;
    setIsSaving(true);
    setActionError('');
    try {
      const res = await api.matches.saveSquad(selectedMatch._id, {
        selectedPlayers,
        reservePlayers,
        coachNotes,
      });
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.data?.message || err.message || 'Failed to save squad.');
    } finally {
      setIsSaving(false);
    }
  };

  // Finalize and Publish Squad (Celebration Confetti!)
  const handleFinalizeAndPublish = async () => {
    if (!selectedMatch) return;
    setIsSaving(true);
    setActionError('');
    try {
      const res = await api.matches.finalizeSquad(selectedMatch._id, true);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#f97316', '#10b981', '#3b82f6'],
        });
        setActionSuccess('🎉 Match squad officially finalized and published! Players have been notified via Team Announcements.');
        setTimeout(() => setActionSuccess(''), 6000);
        loadMatches();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message || 'Failed to finalize and publish squad.');
    } finally {
      setIsSaving(false);
    }
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
              {team} Match Selection
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Attendance-Based Match Squad Selection
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed merit ranking • Enforces strict {team === 'BOYS' ? '15' : 'configured'}-player maximum limit • Transparent coach exception audit
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateMatchModalOpen(true)}
          className="btn-primary text-xs px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Match</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Match Selector Strip */}
      <div className="card-premium p-4 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Fixtures:
        </span>
        {matches.map((m) => {
          const isSelected = selectedMatch?._id === m._id;
          return (
            <button
              key={m._id}
              type="button"
              onClick={() => handleSelectMatch(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 text-left border ${
                isSelected
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="leading-tight">vs {m.opponent}</p>
              <p className={`text-[10px] ${isSelected ? 'text-saffron-300' : 'text-slate-400'}`}>
                {new Date(m.matchDate).toLocaleDateString()} • {m.status}
              </p>
            </button>
          );
        })}
      </div>

      {selectedMatch ? (
        <div className="space-y-6">
          {/* Match Info & Squad Limit Counter Card */}
          <div className="card-premium p-6 bg-gradient-to-r from-white via-court-sand to-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="badge-tag bg-amber-100 text-amber-800">
                    {selectedMatch.competition}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(selectedMatch.matchDate).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-black text-navy-900">
                  vs {selectedMatch.opponent}
                </h3>
                <p className="text-xs text-slate-500">
                  Venue: <strong>{selectedMatch.venue}</strong> • Eligibility Threshold: <strong>{selectedMatch.eligibilityMinAttendancePct}%</strong> Attendance
                </p>
              </div>

              {/* Slot Counter & Progress */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Squad Limit
                  </p>
                  <p className="font-editorial text-3xl font-black text-navy-900">
                    <span className={selectedPlayers.length === selectedMatch.squadSize ? 'text-sportsGreen-dark' : 'text-saffron-600'}>
                      {selectedPlayers.length}
                    </span>
                    <span className="text-slate-400 text-xl font-medium"> / {selectedMatch.squadSize}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedMatch.squadSize - selectedPlayers.length === 0
                      ? 'Squad Full (Limit Enforced)'
                      : `${selectedMatch.squadSize - selectedPlayers.length} slots remaining`}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSquad}
                    disabled={isSaving}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Save Draft Squad
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalizeAndPublish}
                    disabled={isSaving || selectedPlayers.length === 0}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Finalize & Publish Squad
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Panel: Selected Squad vs Reserve Candidates */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Selected Match Squad (Up to Max Limit) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-editorial text-base font-bold text-navy-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-saffron-600" />
                  Official Match Squad ({selectedPlayers.length} of {selectedMatch.squadSize})
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  Playing 9 + Subs
                </span>
              </div>

              <div className="card-premium overflow-hidden divide-y divide-slate-100">
                {selectedPlayers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No players currently selected. Add athletes from the candidate list below.
                  </div>
                ) : (
                  selectedPlayers.map((p, idx) => {
                    const isBelowThreshold = (p.attendancePercentage || 0) < selectedMatch.eligibilityMinAttendancePct;
                    return (
                      <div key={p.player} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-saffron-100 text-saffron-700 font-editorial font-black text-xs flex items-center justify-center">
                              #{p.jerseyNumber}
                            </span>
                            <div>
                              <p className="font-bold text-navy-900 text-xs">{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {p.position} • {p.attendancePercentage}% Attendance
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="badge-tag bg-slate-100 text-slate-700 text-[10px]">
                              Slot #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDemoteToReserve(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Move to Reserves"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Explainable ranking indicator */}
                        {p.rankingFactor && (
                          <p className="text-[11px] text-slate-500 italic pl-10">
                            Reason: {p.rankingFactor}
                          </p>
                        )}

                        {/* Coach Exception Warning & Input if below threshold */}
                        {isBelowThreshold && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Below {selectedMatch.eligibilityMinAttendancePct}% threshold ({p.attendancePercentage}%) — Coach Exception Mandatory</span>
                            </div>
                            <input
                              type="text"
                              value={p.exceptionReason || ''}
                              onChange={(e) => handleExceptionReasonChange(p.player, e.target.value)}
                              placeholder="Reason (e.g. key pole diver tactical need, verified medical leave)..."
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white outline-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Available Reserves & Recommendation Rankings */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-editorial text-base font-bold text-navy-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Reserve Pool & Rankings
                </h4>
                <button
                  type="button"
                  onClick={() => generateRecommendations(selectedMatch._id, selectedMatch.squadSize)}
                  disabled={loadingRecs}
                  className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
                >
                  {loadingRecs ? 'Recalculating...' : 'Refresh AI Rankings'}
                </button>
              </div>

              <div className="card-premium overflow-hidden divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
                {reservePlayers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    All available athletes are currently assigned to the main squad.
                  </div>
                ) : (
                  reservePlayers.map((p) => (
                    <div key={p.player || p._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-editorial font-bold text-xs flex items-center justify-center">
                          #{p.jerseyNumber}
                        </span>
                        <div>
                          <p className="font-bold text-navy-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {p.position} • {p.attendancePercentage}% Attendance
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePromoteToSquad(p)}
                        disabled={selectedPlayers.length >= selectedMatch.squadSize}
                        className="btn-secondary py-1 px-2.5 text-[11px] disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3 text-saffron-600" />
                        Add to Squad
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-12 text-center text-slate-500 text-xs">
          No matches scheduled. Click "Schedule New Match" to begin.
        </div>
      )}

      {/* Schedule Match Modal */}
      {createMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-editorial text-xl font-bold text-navy-900">
              Schedule New {team} Fixture
            </h3>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Opponent Team *
                </label>
                <input
                  type="text"
                  required
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                  placeholder="e.g. Maharashtra Warriors Kho-Kho Club"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Tournament / Competition *
                </label>
                <input
                  type="text"
                  required
                  value={newMatch.competition}
                  onChange={(e) => setNewMatch({ ...newMatch, competition: e.target.value })}
                  placeholder="e.g. Inter-University West Zone Championship 2026"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Match Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newMatch.matchDate}
                    onChange={(e) => setNewMatch({ ...newMatch, matchDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatch.venue}
                    onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                    placeholder="e.g. Shivaji Park Court 1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Max Squad Limit (Rules: 9-18) *
                  </label>
                  <input
                    type="number"
                    min="9"
                    max="18"
                    required
                    value={newMatch.squadSize}
                    onChange={(e) => setNewMatch({ ...newMatch, squadSize: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {team === 'BOYS' ? 'Default 15 players for Boys' : 'Configurable limit for Girls'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Min Attendance % *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newMatch.eligibilityMinAttendancePct}
                    onChange={(e) => setNewMatch({ ...newMatch, eligibilityMinAttendancePct: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateMatchModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2"
                >
                  Create Match & Squad Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
