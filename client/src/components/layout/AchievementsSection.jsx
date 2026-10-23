import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Calendar, Sparkles, Maximize2, X, MapPin } from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_ACHIEVEMENTS = [
  {
    _id: 'cit-championship',
    title: 'Championship Trophy — Coimbatore Institute of Technology',
    year: 2025,
    event: 'Coimbatore Institute of Technology (CIT) State Tournament',
    result: 'Champions & Gold Trophy',
    description: 'Unstoppable championship campaign by the team, clinching the prestigious trophy at Coimbatore Institute of Technology.',
    image: '/achievements/cit_champions_trophy.jpg',
    category: 'BOYS',
  },
  {
    _id: 'kit-runners',
    title: 'Runners-Up — Inter-Collegiate UDHAYAM Tournament',
    year: 2025,
    event: 'KIT - Kalaignarkarunanidhi Institute of Technology, Coimbatore',
    result: 'Runner-Up (Silver Trophy)',
    description: 'Tenacious defensive performance and runner-up podium finish in the prestigious state-level UDHAYAM tournament.',
    image: '/achievements/kit_udhayam_runners.jpg',
    category: 'BOYS',
  },
  {
    _id: 'floodlight-trophy',
    title: 'State Level Floodlight Trophy Winners',
    year: 2025,
    event: 'All-India Open Floodlight Night Kho-Kho Championship',
    result: 'Champions Under Floodlights',
    description: 'High-voltage night matches under arena floodlights, displaying electrifying pole turns and decisive match points.',
    image: '/achievements/floodlight_night_trophy.jpg',
    category: 'COMBINED',
  },
  {
    _id: 'titans-trophy',
    title: 'Winners 🥇 — Team Titans Championship',
    year: 2024,
    event: 'Team Titans Invitational Kho-Kho Trophy',
    result: 'Winners & Champions (Gold Medal)',
    description: 'Dominant all-out victories by the Team Titans squad with masterclass defensive running and offensive chases.',
    image: '/achievements/team_titans_winners.jpg',
    category: 'BOYS',
  },
  {
    _id: 'cit-ground-meet',
    title: 'Champions Lineup — CIT Annual Kho-Kho Meet',
    year: 2024,
    event: 'Coimbatore Institute of Technology Annual Tournament',
    result: 'Trophy Champions & Fair Play Award',
    description: 'Full tournament squad and coaches lined up on the court celebrating the coveted championship cup with coaches.',
    image: '/achievements/cit_ground_lineup.jpg',
    category: 'BOYS',
  },
];

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await api.content.getAchievements(categoryFilter === 'ALL' ? '' : categoryFilter);
        if (isMounted && res && res.data && res.data.length > 0) {
          setAchievements(res.data);
        } else if (isMounted) {
          setAchievements([]);
        }
      } catch (err) {
        console.warn('Using bundled honors archive:', err.message);
        if (isMounted) setAchievements([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAchievements();
    return () => {
      isMounted = false;
    };
  }, [categoryFilter]);

  const displayAchievements =
    achievements.length > 0
      ? achievements
      : DEFAULT_ACHIEVEMENTS.filter((item) => categoryFilter === 'ALL' || item.category === categoryFilter);

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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
        {loading && displayAchievements.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : displayAchievements.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 max-w-md mx-auto">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base">No achievements found</h3>
            <p className="text-xs text-slate-500 mt-1">Honors will appear here as tournaments conclude.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayAchievements.map((item) => (
              <div
                key={item._id}
                className="card-premium flex flex-col justify-between overflow-hidden group hover:border-amber-300 hover:shadow-xl transition-all duration-300 bg-white border border-slate-200 rounded-3xl"
              >
                <div>
                  {/* Real Tournament Image */}
                  {item.image && (
                    <div
                      className="relative w-full aspect-[16/11] sm:aspect-[4/3] overflow-hidden bg-slate-900 cursor-pointer group/img"
                      onClick={() => setSelectedPhoto(item)}
                      title="Click to view full photo"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5" /> Enlarge Photo
                        </span>
                        <span className="text-amber-300 text-[11px] font-bold">
                          {item.event}
                        </span>
                      </div>

                      {/* Top Right Result Pill */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-400/30 flex items-center gap-1.5 shadow-md">
                          <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{item.result}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
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

                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                        <Medal className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-editorial text-lg font-bold text-navy-900 leading-snug">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-500 mb-2 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{item.event}</span>
                    </p>

                    {item.description && (
                      <p className="text-sm text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100 font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-5 pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-50">
                  <span>Verified Sports Directorate Record</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Photo Inspection */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-white font-editorial text-base sm:text-lg font-bold">
                  {selectedPhoto.title}
                </h4>
                <p className="text-amber-400 text-xs font-medium flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {selectedPhoto.result} • {selectedPhoto.event}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-black/60 max-h-[75vh]">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
