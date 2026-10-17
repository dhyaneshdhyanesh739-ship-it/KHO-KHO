import React from 'react';
import { Target, Compass, Heart, Users2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutUsSection() {
  const pillars = [
    {
      title: 'Our Mission',
      desc: 'To cultivate collegiate and national Kho-Kho excellence by developing physically robust, tactically astute, and ethically grounded student athletes.',
      icon: Target,
      color: 'text-saffron-600 bg-saffron-100',
    },
    {
      title: 'Our Vision',
      desc: 'To be India’s premier model Kho-Kho academy, inspiring the next generation of youth athletes to embrace indigenous sports at international standards.',
      icon: Compass,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Coaching Philosophy',
      desc: 'Scientific physical periodization, video analysis of chasing patterns, and merit-based squad selection anchored in transparent attendance metrics.',
      icon: Heart,
      color: 'text-rose-600 bg-rose-100',
    },
    {
      title: 'Team Culture',
      desc: 'Uncompromising mutual respect, selfless team-first commitment, and relentless pursuit of agility both on the mat and in academic life.',
      icon: Users2,
      color: 'text-emerald-600 bg-emerald-100',
    },
  ];

  const commitments = [
    'Strict equal resources and high-performance training for both Boys and Girls divisions.',
    'Daily biometric and digital attendance logging for transparent team accountability.',
    'Specialist fitness regimens focusing on ankle stability, knee conditioning, and pole turning velocity.',
    'Zero tolerance for academic neglect — balancing sporting honors with scholastic growth.',
  ];

  return (
    <section id="about-us" className="py-20 md:py-28 bg-court-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-navy-800 text-xs font-bold uppercase tracking-wider mb-3">
            Institution & Academy Values
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Built on Discipline, Guided by Honor
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            KHO-KHO ARENA represents our institution’s dedication to modernizing Indian sports management. We operate dedicated training programs for our Boys and Girls teams with full institutional transparency.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card-premium p-6 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Core Commitments Bar */}
        <div className="mt-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="badge-tag bg-saffron-100 text-saffron-800 mb-2">Our Operating Creed</span>
              <h3 className="font-editorial text-2xl font-bold text-navy-900 leading-snug">
                Transparent Team Management Without Compromise
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Every practice session is digitally recorded, giving athletes direct visibility into their consistency and match qualification.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {commitments.map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-sportsGreen-dark shrink-0 mt-0.5" />
                  <p className="text-xs text-navy-800 font-medium leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
