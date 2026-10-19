import React from 'react';
import { ArrowUp, Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ onNavigateSection, onOpenLogin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0b1322] border-t border-slate-800 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-saffron-600 to-saffron-500 flex items-center justify-center text-white font-editorial font-black text-lg shadow-md shadow-saffron-500/20">
                KK
              </div>
              <span className="font-editorial font-black text-2xl text-white tracking-tight">
                KHO-KHO <span className="text-saffron-500">ARENA</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Official Sports Team Management System dedicated to preserving and professionalizing the high-speed indigenous Indian sport of Kho-Kho.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Full Role-Based Access Control • MongoDB Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-saffron-400 transition-colors">Home Court</a>
              </li>
              <li>
                <a href="#about-kho-kho" className="hover:text-saffron-400 transition-colors">Kho-Kho Rules & Laws</a>
              </li>
              <li>
                <a href="#about-us" className="hover:text-saffron-400 transition-colors">Academy Creed</a>
              </li>
              <li>
                <a href="#teams" className="hover:text-saffron-400 transition-colors">Boys & Girls Squads</a>
              </li>
              <li>
                <a href="#achievements" className="hover:text-saffron-400 transition-colors">Honors & Trophies</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-saffron-400 transition-colors">Action Gallery</a>
              </li>
              <li>
                <a href="#created-by" className="hover:text-saffron-300 text-saffron-400/90 font-medium transition-colors">
                  Created By (Dhyanesh.S.E)
                </a>
              </li>
            </ul>
          </div>

          {/* Team Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Team Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left text-saffron-400 hover:text-saffron-300 font-semibold transition-colors"
                >
                  Boys Team Portal (22 Roster)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                >
                  Girls Team Portal (13 Roster)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left hover:text-slate-200 transition-colors"
                >
                  Player Attendance History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-left hover:text-slate-200 transition-colors"
                >
                  Match Squad Selection Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us - Exactly matching user screenshot */}
          <div>
            <h4 className="text-base font-bold text-white mb-5 tracking-tight">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="mailto:dhyaneshdhyanesh739@gmail.com"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <Mail className="w-5 h-5 text-[#f87171] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="break-all">dhyaneshdhyanesh739@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+917550317811"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <Phone className="w-5 h-5 text-[#f87171] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+91-7550317811</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">
                  KIT-KalaignarKarunanidhi Institute of Technology, Kannampalayam Post, Coimbatore - 641402
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Built with 💖 by Dhyanesh S E */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} KHO-KHO ARENA. All rights reserved.</p>

          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span className="text-slate-400">Built with</span>
            <span className="inline-block text-base select-none transform hover:scale-125 transition-transform">💖</span>
            <span className="text-slate-400">by</span>
            <span className="text-[#f87171] font-bold tracking-wide hover:underline cursor-default">
              Dhyanesh S E
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
