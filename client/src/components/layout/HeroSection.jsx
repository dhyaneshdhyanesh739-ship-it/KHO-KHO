import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn, Users, Zap, Shield, Trophy } from 'lucide-react';
import KhoKhoCourt3D from '../3d/KhoKhoCourt3D';

export default function HeroSection({ onOpenLogin, onExploreTeams }) {
  const quickStats = [
    { label: 'Boys Squad', value: '23', sub: 'Active Roster' },
    { label: 'Girls Squad', value: '18', sub: 'Active Roster' },
    { label: 'Regulation Match Squad', value: '15', sub: 'Max Selection Limit' },
    { label: 'Court Playing Nine', value: '9', sub: 'Chasers & Defenders' },
  ];

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-court-sand to-white">
      {/* Decorative Warm Saffron Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-saffron-200/30 to-amber-100/40 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider"
            >
              <Zap className="w-3.5 h-3.5 text-saffron-600 fill-saffron-600" />
              Official Kho-Kho Athletic Management System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-black text-navy-900 tracking-tight leading-[1.05]"
            >
              SPEED.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-saffron-500 to-amber-500">
                STRATEGY.
              </span><br />
              SPIRIT.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Empowering India's indigenous high-speed tag sport with unified team administration. Dedicated management for Boys and Girls squads, precision attendance tracking, and attendance-driven match squad selection.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={onExploreTeams}
                className="w-full sm:w-auto btn-primary px-7 py-3.5 text-base shadow-lg shadow-saffron-500/25"
              >
                <span>Explore Our Teams</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto btn-secondary px-7 py-3.5 text-base"
              >
                <LogIn className="w-4 h-4 text-saffron-600" />
                <span>Player & Coach Login</span>
              </button>
            </motion.div>

            {/* Micro Pillars */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
              <div className="text-left">
                <p className="text-xs font-bold text-navy-900">Isolated Portals</p>
                <p className="text-[11px] text-slate-500">Boys & Girls Admin RBAC</p>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-navy-900">Real-Time Data</p>
                <p className="text-[11px] text-slate-500">100% MongoDB Connected</p>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-navy-900">Fair Selection</p>
                <p className="text-[11px] text-slate-500">Attendance-Ranked Squad</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Court Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="relative">
              <KhoKhoCourt3D />

              {/* Floating Tactical Overlay Card */}
              <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sportsGreen-light text-sportsGreen-dark flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Regulation Kho-Kho Court</p>
                    <p className="text-[11px] text-slate-500">27m × 16m • 8 Cross Lanes • Dual Wooden Turn Poles</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {quickStats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-100 shadow-card hover:shadow-md transition-shadow text-center"
            >
              <p className="font-editorial text-3xl sm:text-4xl font-black text-saffron-600">{stat.value}</p>
              <p className="text-xs sm:text-sm font-bold text-navy-900 mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-400 font-medium">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
