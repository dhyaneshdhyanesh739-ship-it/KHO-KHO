import React from 'react';
import { ArrowUp, Heart, Shield, Globe, Award } from 'lucide-react';

export default function Footer({ onNavigateSection, onOpenLogin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-saffron-600 to-saffron-500 flex items-center justify-center text-white font-editorial font-black text-lg shadow-md shadow-saffron-500/20">
                KK
              </div>
              <span className="font-editorial font-black text-2xl text-navy-900 tracking-tight">
                KHO-KHO <span className="text-saffron-600">ARENA</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Official Sports Team Management System dedicated to preserving and professionalizing the high-speed indigenous Indian sport of Kho-Kho.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Shield className="w-4 h-4 text-sportsGreen-dark" />
              <span>Full Role-Based Access Control • MongoDB Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-saffron-600 transition-colors">Home Court</a>
              </li>
              <li>
                <a href="#about-kho-kho" className="hover:text-saffron-600 transition-colors">Kho-Kho Rules & Laws</a>
              </li>
              <li>
                <a href="#about-us" className="hover:text-saffron-600 transition-colors">Academy Creed</a>
              </li>
              <li>
                <a href="#teams" className="hover:text-saffron-600 transition-colors">Boys & Girls Squads</a>
              </li>
              <li>
                <a href="#achievements" className="hover:text-saffron-600 transition-colors">Honors & Trophies</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-saffron-600 transition-colors">Action Gallery</a>
              </li>
            </ul>
          </div>

          {/* Division Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Team Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left text-saffron-600 hover:text-saffron-700 font-semibold"
                >
                  Boys Team Portal (23 Roster)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Girls Team Portal (18 Roster)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left hover:text-navy-900"
                >
                  Player Attendance History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left hover:text-navy-900"
                >
                  Match Squad Selection Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Regulation Standards
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Compliant with Kho Kho Federation of India (KKFI) playing dimension laws and AIU inter-university tournament guidelines.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
              Regulation 27m × 16m
            </span>
          </div>
        </div>

        {/* Bottom Bar with Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} KHO-KHO ARENA. All rights reserved. Built with precision for Indian sports.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
