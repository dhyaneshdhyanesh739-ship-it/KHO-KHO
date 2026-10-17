import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Megaphone, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function AnnouncementsManager({ team }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'GENERAL',
    isUrgent: false,
    published: true,
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.announcements.getAll({ team });
      if (res && res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [team]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.announcements.create({
        team,
        ...formData,
      });
      if (res.success) {
        setActionSuccess('Announcement published.');
        setTimeout(() => setActionSuccess(''), 4000);
        setCreateModalOpen(false);
        setFormData({ title: '', message: '', category: 'GENERAL', isUrgent: false, published: true });
        loadAnnouncements();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.announcements.delete(id);
      if (res.success) {
        setActionSuccess('Announcement deleted.');
        setTimeout(() => setActionSuccess(''), 4000);
        loadAnnouncements();
      }
    } catch (err) {
      setActionError(err.data?.message || err.message);
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
              {team} Notices
            </span>
            <h2 className="font-editorial text-2xl font-black text-navy-900 tracking-tight">
              Team Announcements & Schedule
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish official practice timings, tournament notices, and squad briefings directly to player portals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary text-xs px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Notice</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-premium p-12 text-center text-slate-400 text-xs">
            Loading team announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="card-premium p-12 text-center text-slate-400 text-xs">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No active announcements</p>
            <p className="text-[11px] mt-0.5">Click "New Notice" to publish a schedule or briefing.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item._id}
              className={`card-premium p-6 transition-all ${
                item.isUrgent ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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

                    {item.isUrgent && (
                      <span className="badge-tag bg-rose-100 text-rose-800 font-bold">
                        Urgent Action
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-navy-900">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {item.message}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-400">
                    Issued by: <strong className="text-navy-900">{item.authorName}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-editorial text-xl font-bold text-navy-900">
              Publish Team Notice
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule Change: Tomorrow Morning Speed Drills"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="PRACTICE">Practice Schedule</option>
                    <option value="MATCH">Match Fixture</option>
                    <option value="TOURNAMENT">Tournament Brief</option>
                    <option value="SQUAD">Squad Announcement</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Mark as Urgent Notice</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notice details, instructions, required gear, reporting time..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-saffron-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
