import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Sparkles,
  Zap,
  Target,
  Quote,
  Activity,
  Heart,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Layers,
  Upload,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SIGNATURE_MOVE_PRESETS = [
  'Pole Dive',
  'Sky Dive',
  'Running Chaser',
  'Snake Defender',
  'Chain Running',
  'Sudden Kho',
  'Late Kho',
  'Trapping & Ring Defense',
];

const BLOOD_GROUP_OPTIONS = ['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const AVATAR_PRESETS = [
  { id: 'avatar-saffron-runner', label: 'Saffron Chaser', bg: 'from-amber-500 to-orange-600', emoji: '🏃' },
  { id: 'avatar-rose-defender', label: 'Rose Defender', bg: 'from-rose-500 to-pink-600', emoji: '🛡️' },
  { id: 'avatar-lightning-diver', label: 'Pole Diver', bg: 'from-yellow-400 to-amber-600', emoji: '⚡' },
  { id: 'avatar-blue-anchor', label: 'Blue Anchor', bg: 'from-blue-500 to-indigo-600', emoji: '⚓' },
  { id: 'avatar-emerald-tactician', label: 'Tactician', bg: 'from-emerald-500 to-teal-700', emoji: '🎯' },
  { id: 'avatar-purple-striker', label: 'Speed Striker', bg: 'from-purple-500 to-indigo-700', emoji: '🚀' },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  initialUser,
  initialPlayer,
  onSaveSuccess,
  defaultTab = 'identity',
}) {
  const { updateCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'identity' | 'about' | 'vitals'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    aboutMe: '',
    signatureMove: 'Pole Dive',
    personalGoal: '',
    favoriteQuote: '',
    bloodGroup: 'Unknown',
    heightCm: '',
    weightKg: '',
    phone: '',
    emergencyContactName: '',
    emergencyPhone: '',
    photoUrl: '',
  });

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setActiveTab(defaultTab || 'identity');

      const contact = initialPlayer?.contactInfo || {};
      setFormData({
        username: initialUser?.username || '',
        name: initialUser?.name || initialPlayer?.name || '',
        email: initialUser?.email || contact.email || '',
        aboutMe: initialPlayer?.notes || contact.aboutMe || '',
        signatureMove: contact.signatureMove || 'Pole Dive',
        personalGoal: contact.personalGoal || '',
        favoriteQuote: contact.favoriteQuote || '',
        bloodGroup: initialPlayer?.bloodGroup || 'Unknown',
        heightCm: initialPlayer?.heightCm ? String(initialPlayer.heightCm) : '',
        weightKg: initialPlayer?.weightKg ? String(initialPlayer.weightKg) : '',
        phone: contact.phone || '',
        emergencyContactName: contact.emergencyContactName || '',
        emergencyPhone: contact.emergencyPhone || '',
        photoUrl: initialPlayer?.photoUrl || initialUser?.player?.photoUrl || '',
      });
    }
  }, [isOpen, initialUser, initialPlayer, defaultTab]);

  if (!isOpen) return null;

  const team = initialUser?.team || initialPlayer?.team || 'BOYS';
  const isBoys = team === 'BOYS';

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setErrorMessage('Failed to read image file.');
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => setErrorMessage('Invalid image file.');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.username.trim()) {
      setErrorMessage('Username is required.');
      setActiveTab('identity');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      setActiveTab('identity');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.updateProfile({
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        aboutMe: formData.aboutMe.trim(),
        signatureMove: formData.signatureMove.trim(),
        personalGoal: formData.personalGoal.trim(),
        favoriteQuote: formData.favoriteQuote.trim(),
        bloodGroup: formData.bloodGroup,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        phone: formData.phone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        photoUrl: formData.photoUrl.trim(),
      });

      if (res.success) {
        setSuccessMessage('Profile and About Me details updated successfully!');
        // Update auth context state and token immediately
        if (updateCurrentUser) {
          updateCurrentUser(res.user, res.token);
        }
        if (onSaveSuccess) {
          onSaveSuccess(res);
        }
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setErrorMessage(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'An error occurred while updating profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header Bar */}
        <div
          className={`px-6 py-4 text-white flex items-center justify-between border-b ${
            isBoys
              ? 'bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 border-amber-900/50'
              : 'bg-gradient-to-r from-slate-900 via-rose-950 to-pink-950 border-rose-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-editorial font-black shadow-md ${
                isBoys ? 'bg-saffron-600' : 'bg-rose-600'
              }`}
            >
              #{initialPlayer?.jerseyNumber || initialUser?.player?.jerseyNumber || '★'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-lg font-black tracking-tight">
                  Edit Athlete Profile & Bio
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    isBoys ? 'bg-amber-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                  }`}
                >
                  {team} Team
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Update your login username, personal bio, signature move, goals & vitals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'identity'
                ? isBoys
                  ? 'border-saffron-600 text-saffron-700 bg-white rounded-t-xl'
                  : 'border-rose-600 text-rose-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Account & Username</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'about'
                ? isBoys
                  ? 'border-saffron-600 text-saffron-700 bg-white rounded-t-xl'
                  : 'border-rose-600 text-rose-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. About Me & Style</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'vitals'
                ? isBoys
                  ? 'border-saffron-600 text-saffron-700 bg-white rounded-t-xl'
                  : 'border-rose-600 text-rose-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Vitals & Contact</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* TAB 1: IDENTITY & USERNAME */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              {/* Username Field with live help */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Portal Username *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Used to sign in</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })
                    }
                    placeholder="e.g. s.e.d or sed23"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Letters, numbers, dots, and underscores only. You will use this username to sign into your dashboard.
                </p>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Athlete Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. S.E.D"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="athlete@khokhoarena.org"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Avatar & Photo Upload */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Profile Photo & Avatar
                  </label>
                  <span className="text-[10px] text-slate-400 font-normal">JPG, PNG, WEBP</span>
                </div>

                {/* Photo Preview & Upload Controls */}
                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <div className="relative shrink-0">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Profile Preview"
                        className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-sm ${
                          isBoys ? 'border-saffron-500' : 'border-rose-500'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center font-editorial font-black text-xl text-white shadow-sm ${
                          isBoys
                            ? 'bg-gradient-to-tr from-saffron-600 to-amber-500'
                            : 'bg-gradient-to-tr from-rose-600 to-pink-500'
                        }`}
                      >
                        #{initialPlayer?.jerseyNumber || '—'}
                      </div>
                    )}
                  </div>

                  {/* Upload / Remove Actions */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          isBoys
                            ? 'bg-saffron-600 hover:bg-saffron-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                      </button>

                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                          className="py-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Upload a photo from your phone or PC, or paste an image link below.
                    </p>
                  </div>
                </div>

                {/* Optional URL Input */}
                <div className="relative pt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="Or paste photo link (https://...)"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-navy-900 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Fast Preset Avatars */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Or pick a sports avatar preset:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}&backgroundColor=ffdfbf`,
                        })
                      }
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 text-center transition-all flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">
                        {p.emoji}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 truncate w-full">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT ME & STYLE */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {/* "About Me" Bio Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>About Me / Athlete Story</span>
                  <span className="text-[10px] text-slate-400">{formData.aboutMe.length}/500</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Share your Kho-Kho journey, training mindset, playing experience, and what inspires you on court..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none resize-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  This bio will be proudly showcased on your dashboard and team roster.
                </p>
              </div>

              {/* Signature Kho-Kho Move */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Signature Kho-Kho Move ⚡</span>
                  <span className="text-[10px] text-slate-400 font-normal">Select or customize</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SIGNATURE_MOVE_PRESETS.map((move) => (
                    <button
                      key={move}
                      type="button"
                      onClick={() => setFormData({ ...formData, signatureMove: move })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        formData.signatureMove === move
                          ? isBoys
                            ? 'bg-saffron-600 text-white shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {move}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.signatureMove}
                  onChange={(e) => setFormData({ ...formData, signatureMove: e.target.value })}
                  placeholder="Or enter your custom specialty move"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-navy-900 transition-all outline-none"
                />
              </div>

              {/* Personal Season Goal & Athlete Motto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>Season Target / Goal</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalGoal}
                    onChange={(e) => setFormData({ ...formData, personalGoal: e.target.value })}
                    placeholder="e.g. 10+ pole dives & 95% attendance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Motto / Favorite Quote</span>
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteQuote}
                    onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })}
                    placeholder="e.g. Chase with heart, defend with pride."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VITALS & CONTACT */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              {/* Physical Vitals */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none bg-white cursor-pointer"
                  >
                    {BLOOD_GROUP_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    step="0.5"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    placeholder="172"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    step="0.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder="65"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Phone & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Athlete Contact Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Emergency Contact Name</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Parent / Guardian Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-navy-900 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'vitals' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'identity' ? 'about' : 'vitals')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Next Step →
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2.5 px-6 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                  isBoys
                    ? 'bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 shadow-saffron-500/25'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save My Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
