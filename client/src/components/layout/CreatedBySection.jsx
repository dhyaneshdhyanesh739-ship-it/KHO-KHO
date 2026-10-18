import React from 'react';
import { ExternalLink, Mail, Phone, Award, Code2, Sparkles, MapPin, Briefcase } from 'lucide-react';

export default function CreatedBySection() {
  return (
    <section id="created-by" className="py-24 bg-gradient-to-b from-slate-950 via-[#0a1120] to-[#0b1322] text-white relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-500/15 border border-saffron-500/30 text-saffron-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span>Developer Profile & Attribution</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-black tracking-tight text-white">
            Created <span className="text-saffron-500">By</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            The visionary mind behind the KHO-KHO ARENA sports management platform.
          </p>
        </div>

        {/* Profile Card Container */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left: Creator Photo & Badge */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-sm">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-saffron-500 via-rose-500 to-blue-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950 aspect-[3/4]">
                  <img
                    src="/dhyanesh_se.jpg"
                    alt="Dhyanesh.S.E - Creator & Coach"
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Photo Gradient Overlay for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  
                  {/* Bottom Ribbon on Photo */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
                    <p className="text-xs font-bold text-saffron-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-saffron-400" />
                      Kho-Kho Champion & Head Coach
                    </p>
                    <p className="text-sm font-black text-white mt-0.5">Dhyanesh.S.E</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Bio, Details & Action Links */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold tracking-wide uppercase mb-3">
                  System Creator & Full-Stack Architect
                </span>
                <h3 className="font-editorial text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Dhyanesh.S.E
                </h3>
                <p className="text-saffron-400 text-sm font-semibold mt-1">
                  National Kho-Kho Athlete • Head Coach • Full-Stack Developer
                </p>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Passionate software developer and dedicated Kho-Kho sportsman who engineered the KHO-KHO ARENA system. Built to bridge elite sports administration with state-of-the-art web technology, empowering team management, real-time rosters, and athletic excellence.
              </p>

              {/* Call to action message requested by user */}
              <div className="p-4 sm:p-5 rounded-2xl bg-saffron-500/10 border border-saffron-500/20 text-saffron-200 text-sm">
                <p className="font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-saffron-400 shrink-0" />
                  Open for Opportunities & References:
                </p>
                <p className="mt-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  "Please contact me for your further reference, software engineering roles, technical collaborations, or sports advisory."
                </p>
              </div>

              {/* Key Highlights Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <Code2 className="w-4 h-4 text-saffron-400 mb-1" />
                  <p className="text-xs font-bold text-white">Full-Stack</p>
                  <p className="text-[11px] text-slate-400">MERN Stack Web Dev</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <Award className="w-4 h-4 text-rose-400 mb-1" />
                  <p className="text-xs font-bold text-white">Head Coach</p>
                  <p className="text-[11px] text-slate-400">Kho-Kho Boys Team</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 col-span-2 sm:col-span-1">
                  <MapPin className="w-4 h-4 text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-white">Location</p>
                  <p className="text-[11px] text-slate-400">India</p>
                </div>
              </div>

              {/* Action Buttons: Resume & Contacts */}
              <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Resume / Portfolio Link */}
                <a
                  href="https://dhyanesh-portfolio23012007.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-500 hover:from-saffron-500 hover:to-saffron-400 text-white font-bold text-sm shadow-lg shadow-saffron-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>View Resume & Portfolio</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Email Direct */}
                <a
                  href="mailto:dhyaneshdhyanesh739@gmail.com"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <Mail className="w-4 h-4 text-rose-400" />
                  <span>Email Me</span>
                </a>

                {/* Direct Phone / Contact */}
                <a
                  href="tel:+917550317811"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>+91-7550317811</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
