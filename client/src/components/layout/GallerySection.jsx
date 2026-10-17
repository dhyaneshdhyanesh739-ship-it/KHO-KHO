import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';

export default function GallerySection() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const res = await api.content.getGallery(activeCategory === 'ALL' ? '' : activeCategory);
        if (res && res.data) {
          setGallery(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [activeCategory]);

  return (
    <section id="gallery" className="py-20 md:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5 text-saffron-600" />
            Visual Archive
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Arena in Motion
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Witness the raw intensity, lightning dives, and triumphant celebrations captured during state and national competitions.
          </p>

          {/* Category Filters */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
            {['ALL', 'Action', 'Training', 'Celebration', 'Trophies'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-saffron-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Moments' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 max-w-md mx-auto">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base">No photographs yet</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon for latest match action shots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gallery.map((item) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-card hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Light Gradient Overlay with Editorial Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="inline-block text-[10px] font-bold tracking-widest text-saffron-400 uppercase mb-1">
                    {item.category} • {item.team}
                  </span>
                  <h4 className="font-editorial text-base font-bold leading-tight mb-1">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
