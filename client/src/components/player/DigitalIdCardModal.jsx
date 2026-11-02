import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, ShieldCheck, Trophy, Sparkles, Heart, Activity } from 'lucide-react';

export default function DigitalIdCardModal({ isOpen, onClose, user, player, attendancePercentage = 100 }) {
  const cardRef = useRef(null);

  if (!isOpen) return null;

  const team = user?.team || player?.team || 'BOYS';
  const isBoys = team === 'BOYS';
  const jersey = player?.jerseyNumber || user?.player?.jerseyNumber || '—';
  const position = player?.position || user?.player?.position || 'Athlete';
  const name = user?.name || player?.name || 'Athlete';
  const username = user?.username || player?.playerId || '';
  const bloodGroup = player?.bloodGroup || 'Unknown';
  const signatureMove = player?.contactInfo?.signatureMove || 'Pole Dive';
  const height = player?.heightCm ? `${player.heightCm} cm` : '—';
  const weight = player?.weightKg ? `${player.weightKg} kg` : '—';
  const photoUrl = player?.photoUrl || user?.player?.photoUrl || '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Official Digital Athlete Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Print Athlete ID Card"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Pass</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Pass Body */}
        <div ref={cardRef} className="p-6 bg-gradient-to-b from-slate-50 to-white">
          <div
            className={`relative rounded-3xl overflow-hidden border-2 shadow-xl ${
              isBoys
                ? 'border-saffron-300 bg-gradient-to-br from-amber-50 via-white to-orange-50'
                : 'border-rose-300 bg-gradient-to-br from-rose-50 via-white to-pink-50'
            }`}
          >
            {/* Header Ribbon */}
            <div
              className={`p-4 text-white flex items-center justify-between ${
                isBoys
                  ? 'bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-editorial font-black text-sm">
                  KK
                </div>
                <div>
                  <h3 className="font-editorial font-black text-sm tracking-wide leading-tight">
                    KHO-KHO ARENA
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                    Official Athlete Membership Pass
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-wider">
                2026 Season
              </span>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                {/* Photo or Jersey Box */}
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={name}
                      className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-md ${
                        isBoys ? 'border-saffron-400' : 'border-rose-400'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-editorial font-black text-3xl shadow-md border-2 ${
                        isBoys
                          ? 'bg-saffron-100 text-saffron-700 border-saffron-300'
                          : 'bg-rose-100 text-rose-700 border-rose-300'
                      }`}
                    >
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                        Jersey
                      </span>
                      <span>#{jersey}</span>
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase shadow-sm ${
                      isBoys ? 'bg-saffron-600' : 'bg-rose-600'
                    }`}
                  >
                    #{jersey}
                  </span>
                </div>

                {/* Athlete Core Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isBoys ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {team} SQUAD
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      @{username}
                    </span>
                  </div>

                  <h4 className="font-editorial text-xl font-black text-navy-900 truncate">
                    {name}
                  </h4>

                  <p className="text-xs font-bold text-slate-600">
                    Role: <span className="text-navy-900">{position}</span>
                  </p>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Blood Group
                  </span>
                  <span className="font-bold text-xs text-rose-600 font-editorial">
                    {bloodGroup}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Height
                  </span>
                  <span className="font-bold text-xs text-navy-900 font-editorial">
                    {height}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Weight
                  </span>
                  <span className="font-bold text-xs text-navy-900 font-editorial">
                    {weight}
                  </span>
                </div>
              </div>

              {/* Move & Standing Banner */}
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  isBoys
                    ? 'bg-amber-100/50 border-amber-200 text-amber-950'
                    : 'bg-rose-100/50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-[11px]">
                    Signature: <strong>{signatureMove}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Trophy className="w-3 h-3 text-emerald-600" />
                  <span>{attendancePercentage}% Match Rate</span>
                </div>
              </div>

              {/* Holographic Verification Footer */}
              <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-dashed border-slate-200">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Athlete Credentials</span>
                </div>
                <span className="font-mono tracking-wider">
                  AUTH-{username.toUpperCase()}-2026
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <p className="text-[10px] text-slate-400 text-center mt-3 print:hidden">
            Present this digital card to coaching staff during inter-college & state level match fixture verifications.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
