import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await api.content.getAchievements(categoryFilter === 'ALL' ? '' : categoryFilter);
        if (res && res.data) {
          setAchievements(res.data);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [categoryFilter]);

  return (
    <section id="achievements" className="py-20 md:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Competitive Honors & Medals
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Hall of Championship Glory
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            A testament to unwavering speed, relentless defense, and collegiate sportsmanship across zonal, university, and state stages.
          </p>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {['ALL', 'BOYS', 'GIRLS', 'COMBINED'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-navy-900'
                }`}
              >
                {cat === 'ALL' ? 'All Honors' : cat === 'BOYS' ? 'Boys Team' : cat === 'GIRLS' ? 'Girls Team' : 'Combined Squad'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 max-w-md mx-auto">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base">No achievements found</h3>
            <p className="text-xs text-slate-500 mt-1">Honors will appear here as tournaments conclude.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item) => (
              <div
                key={item._id}
                className="card-premium p-6 flex flex-col justify-between hover:border-amber-300 hover:shadow-highlight transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`badge-tag ${
                        item.category === 'BOYS'
                          ? 'bg-saffron-100 text-saffron-800'
                          : item.category === 'GIRLS'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.year}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                      <Medal className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                        {item.result}
                      </span>
                      <h3 className="font-editorial text-lg font-bold text-navy-900 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-500 mb-2">
                    <span className="font-bold text-slate-700">Tournament:</span> {item.event}
                  </p>

                  {item.description && (
                    <p className="text-sm text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Verified Sports Directorate Record</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
