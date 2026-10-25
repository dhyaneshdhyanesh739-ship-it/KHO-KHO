import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, Download, Upload, Eye, CheckCircle2,
  XCircle, AlertCircle, Edit, Trash2, ArrowUpDown, Shield, Phone, Mail, FileText, Trophy
} from 'lucide-react';
import { api } from '../../services/api';

export default function RosterManager({ team }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('jerseyNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [deleteConfirmPlayer, setDeleteConfirmPlayer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Add Player Form state
  const [newPlayer, setNewPlayer] = useState({
    playerId: '',
    name: '',
    jerseyNumber: '',
    position: 'All-Rounder',
    bloodGroup: 'Unknown',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyPhone: '',
    notes: '',
  });

  // CSV Import state
  const [csvInput, setCsvInput] = useState('');

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const res = await api.players.getAll({
        team,
        search: searchTerm,
        position: positionFilter,
        status: statusFilter,
        sortBy: sortField,
        sortOrder,
      });
      if (res && res.data) {
        setPlayers(res.data);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [team, searchTerm, positionFilter, statusFilter, sortField, sortOrder]);

  const handleToggleStatus = async (playerId) => {
    try {
      setActionError('');
      const res = await api.players.toggleStatus(playerId);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
        loadPlayers();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const handleDeletePlayer = async (player) => {
    if (!player) return;
    setIsDeleting(true);
    setActionError('');
    try {
      const res = await api.players.delete(player._id);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
        setDeleteConfirmPlayer(null);
        setSelectedPlayer(null);
        loadPlayers();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message || 'Failed to remove team member.');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        team,
        playerId: newPlayer.playerId,
        name: newPlayer.name,
        jerseyNumber: newPlayer.jerseyNumber,
        position: newPlayer.position,
        bloodGroup: newPlayer.bloodGroup,
        contactInfo: {
          phone: newPlayer.phone,
          email: newPlayer.email,
          emergencyContactName: newPlayer.emergencyContactName,
          emergencyPhone: newPlayer.emergencyPhone,
        },
        notes: newPlayer.notes,
        createLogin: true,
      };

      const res = await api.players.create(payload);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
        setAddModalOpen(false);
        setNewPlayer({
          playerId: '',
          name: '',
          jerseyNumber: '',
          position: 'All-Rounder',
          bloodGroup: 'Unknown',
          phone: '',
          email: '',
          emergencyContactName: '',
          emergencyPhone: '',
          notes: '',
        });
        loadPlayers();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
    }
  };

  const handleViewProfile = async (player) => {
    setSelectedPlayer(player);
    try {
      const res = await api.players.getById(player._id);
      if (res.success) {
        setPlayerStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching player stats:', err);
    }
  };

  const handleImportCSV = async () => {
    setActionError('');
    try {
      const res = await api.players.importCSV(csvInput);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 4000);
        setImportModalOpen(false);
        setCsvInput('');
        loadPlayers();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
    }
  };

  const handleExportCSV = () => {
    window.open(api.players.exportCSVUrl(team), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`badge-tag ${
                team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {team} Roster
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Player Roster Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {team === 'BOYS' ? 'Standard 23-player expected contingent' : 'Configurable athlete roster'} • Active Player Accounts & Biometrics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary text-xs px-3.5 py-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="btn-secondary text-xs px-3.5 py-2"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="btn-primary text-xs px-4 py-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or Player ID (e.g. B-01)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Positions</option>
            <option value="Chaser">Chaser</option>
            <option value="Defender">Defender</option>
            <option value="Pole Diver">Pole Diver</option>
            <option value="Running Chaser">Running Chaser</option>
            <option value="All-Rounder">All-Rounder</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active Athletes</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Jersey #{sortOrder === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Jersey</th>
                <th className="py-3.5 px-4">Player ID</th>
                <th className="py-3.5 px-4">Athlete Name</th>
                <th className="py-3.5 px-4">Position</th>
                <th className="py-3.5 px-4">Account Reference</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading team roster records...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No players found in this roster</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Use "Add Player" or import CSV to populate records.</p>
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-editorial font-black text-sm text-saffron-600">
                      #{p.jerseyNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {p.playerId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge-tag bg-slate-100 text-slate-700">
                        {p.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {p.userRef?.username || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {p.bloodGroup || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewProfile(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        title="View Profile & Attendance"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.active
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={p.active ? 'Deactivate Athlete' : 'Activate Athlete'}
                      >
                        {p.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPlayer(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={`Remove ${p.name} from Roster`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{players.length}</strong> roster records for {team} Team</span>
          <span>{players.filter((p) => p.active).length} Active Athletes</span>
        </div>
      </div>

      {/* Add Player Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-navy-900">
                Register New {team} Athlete
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Player ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlayer.playerId}
                    onChange={(e) => setNewPlayer({ ...newPlayer, playerId: e.target.value })}
                    placeholder={team === 'BOYS' ? 'e.g. B-24' : 'e.g. G-19'}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Jersey Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="e.g. Rohan Chavan"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Playing Position *
                  </label>
                  <select
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="Chaser">Chaser</option>
                    <option value="Defender">Defender</option>
                    <option value="Pole Diver">Pole Diver</option>
                    <option value="Running Chaser">Running Chaser</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newPlayer.bloodGroup}
                    onChange={(e) => setNewPlayer({ ...newPlayer, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newPlayer.email}
                    onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                    placeholder="athlete@arena.org"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Coach / Technical Notes
                </label>
                <textarea
                  rows={2}
                  value={newPlayer.notes}
                  onChange={(e) => setNewPlayer({ ...newPlayer, notes: e.target.value })}
                  placeholder="Key strengths, tactical role, conditioning goals..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-saffron-50 rounded-xl border border-saffron-200 text-[11px] text-saffron-800">
                A secure player portal login account will be automatically generated with username matching Player ID.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2"
                >
                  Save Athlete to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-editorial text-xl font-bold text-navy-900">
              Bulk CSV Import ({team} Roster)
            </h3>
            <p className="text-xs text-slate-500">
              Paste standard comma-separated values. Header format: <code>Player ID, Name, Team, Jersey Number, Position, Status, Phone, Email, Blood Group</code>
            </p>

            <textarea
              rows={8}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Player ID,Name,Team,Jersey Number,Position,Status,Phone,Email,Blood Group
B-24,Suresh Patil,BOYS,24,Chaser,Active,+91 98200 10024,b24@arena.org,O+"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCSV}
                className="btn-primary text-xs px-5 py-2"
              >
                Import Athletes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Profile Drawer */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-saffron-100 text-saffron-700 font-editorial font-black text-xl flex items-center justify-center">
                    #{selectedPlayer.jerseyNumber}
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-navy-900">{selectedPlayer.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{selectedPlayer.playerId} • {selectedPlayer.team}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900"
                >
                  ✕
                </button>
              </div>

              {/* Attendance Stats Cards */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Attendance Metrics (Real Database)
                </h4>
                {playerStats ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>Match Attendance Standing</span>
                        </span>
                        <span className={`font-editorial font-black text-2xl ${
                          (playerStats.matchAttendancePercentage ?? Math.max(0, 100 - (playerStats.absentCount * 2) - (playerStats.excusedCount * 1))) >= 75
                            ? 'text-sportsGreen-dark'
                            : 'text-amber-600'
                        }`}>
                          {playerStats.matchAttendancePercentage ?? Math.max(0, 100 - (playerStats.absentCount * 2) - (playerStats.excusedCount * 1))}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Base 100% • Absent: -{playerStats.absentDeduction ?? (playerStats.absentCount * 2)}% ({playerStats.absentCount} × -2%) • Excused: -{playerStats.excusedDeduction ?? (playerStats.excusedCount * 1)}% ({playerStats.excusedCount} × -1%)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-saffron-50 border border-saffron-200 text-center">
                        <p className="font-editorial text-3xl font-black text-saffron-600">
                          {playerStats.attendancePercentage}%
                        </p>
                        <p className="text-xs font-bold text-navy-900 mt-1">Attendance Rate</p>
                        <p className="text-[10px] text-slate-500">{playerStats.presentCount} of {playerStats.eligibleSessions} Eligible</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <p className="font-editorial text-3xl font-black text-navy-800">
                          {playerStats.totalRecorded}
                        </p>
                        <p className="text-xs font-bold text-navy-900 mt-1">Total Sessions</p>
                        <p className="text-[10px] text-slate-500">{playerStats.absentCount} Abs • {playerStats.lateCount} Late</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 animate-pulse">
                    Loading attendance calculations...
                  </div>
                )}
              </div>

              {/* Detailed Specs */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Athlete Metadata
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Position</span>
                    <strong className="text-navy-900">{selectedPlayer.position}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group</span>
                    <strong className="text-navy-900">{selectedPlayer.bloodGroup || 'Not Recorded'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <strong className="text-navy-900">{selectedPlayer.contactInfo?.phone || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <strong className="text-navy-900">{selectedPlayer.contactInfo?.email || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <strong className={selectedPlayer.active ? 'text-sportsGreen-dark' : 'text-slate-400'}>
                      {selectedPlayer.active ? 'Active on Roster' : 'Inactive'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlayer(selectedPlayer)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Athlete from Roster</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="w-full btn-secondary py-2 text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-black text-navy-900 leading-tight">
                  Remove Team Member
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent roster removal confirmation
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800 space-y-1.5">
              <p className="font-bold">
                Are you sure you want to remove {deleteConfirmPlayer.name} (#{deleteConfirmPlayer.jerseyNumber})?
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                This will permanently remove athlete <strong>{deleteConfirmPlayer.playerId}</strong> from the <strong>{team}</strong> roster, delete their portal login account, and clear their attendance records. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlayer(null)}
                disabled={isDeleting}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePlayer(deleteConfirmPlayer)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-600/30 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Removing...' : 'Confirm Removal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
