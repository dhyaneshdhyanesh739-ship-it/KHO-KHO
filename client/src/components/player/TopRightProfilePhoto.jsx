import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, Pencil, ShieldCheck, LogOut, ChevronDown, Check, User, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TopRightProfilePhoto({
  user,
  player,
  onEditProfile,
  onOpenIdCard,
  onPhotoUpdated,
}) {
  const { logout, updateCurrentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const isBoys = user?.team === 'BOYS';
  const photoUrl = player?.photoUrl || user?.player?.photoUrl || '';
  const jerseyNumber = player?.jerseyNumber || user?.player?.jerseyNumber || '—';
  const athleteName = user?.name || player?.name || 'Athlete';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compress image to canvas data URL (max 400x400)
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP).'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image file.'));
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

          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressed);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    try {
      const dataUrl = await processImageFile(file);
      const res = await api.auth.updateProfile({
        photoUrl: dataUrl,
      });

      if (res.success) {
        if (updateCurrentUser) {
          updateCurrentUser(res.user, res.token);
        }
        if (onPhotoUpdated) {
          onPhotoUpdated(res);
        }
        setIsOpen(false);
      } else {
        setUploadError(res.message || 'Failed to update photo.');
      }
    } catch (err) {
      setUploadError(err.message || 'Error uploading photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    setUploadError('');
    setIsUploading(true);
    try {
      const res = await api.auth.updateProfile({
        photoUrl: '',
      });

      if (res.success) {
        if (updateCurrentUser) {
          updateCurrentUser(res.user, res.token);
        }
        if (onPhotoUpdated) {
          onPhotoUpdated(res);
        }
        setIsOpen(false);
      } else {
        setUploadError(res.message || 'Failed to remove photo.');
      }
    } catch (err) {
      setUploadError(err.message || 'Error removing photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Right Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? isBoys
              ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
              : 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
        }`}
        title="Athlete Profile & Photo Menu"
        aria-label="Athlete Profile & Photo Menu"
      >
        {/* Avatar Circle with Camera Overlay */}
        <div className="relative">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={athleteName}
              className={`w-8 h-8 rounded-full object-cover border-2 shadow-xs ${
                isBoys ? 'border-saffron-500' : 'border-rose-500'
              }`}
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-editorial font-black text-xs text-white shadow-xs ${
                isBoys
                  ? 'bg-gradient-to-tr from-saffron-600 to-amber-500'
                  : 'bg-gradient-to-tr from-rose-600 to-pink-500'
              }`}
            >
              #{jerseyNumber}
            </div>
          )}

          {/* Camera icon overlay badge on avatar */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-110 ${
              isBoys ? 'bg-slate-900 ring-1 ring-white' : 'bg-rose-900 ring-1 ring-white'
            }`}
          >
            <Camera className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Desktop Name & Jersey info */}
        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-navy-900 truncate max-w-[110px]">
            {athleteName}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 font-mono">
            #{jerseyNumber} • {user?.team}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-navy-900' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header Card: Large Profile Photo & Details */}
          <div
            className={`p-4 mx-3 mb-2 rounded-2xl border flex items-center gap-3.5 ${
              isBoys
                ? 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border-amber-200/80'
                : 'bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 border-rose-200/80'
            }`}
          >
            {/* Large Avatar with direct file upload overlay */}
            <div className="relative group/avatar shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={athleteName}
                  className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-md ${
                    isBoys ? 'border-saffron-500' : 'border-rose-500'
                  }`}
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-editorial font-black text-xl text-white shadow-md ${
                    isBoys
                      ? 'bg-gradient-to-tr from-saffron-600 to-amber-500'
                      : 'bg-gradient-to-tr from-rose-600 to-pink-500'
                  }`}
                >
                  #{jerseyNumber}
                </div>
              )}

              {/* Hover Camera Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                title="Click to change photo"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    isBoys ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {user?.team} Team
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  #{jerseyNumber}
                </span>
              </div>
              <h4 className="font-editorial text-base font-black text-navy-900 truncate mt-0.5">
                {athleteName}
              </h4>
              <p className="text-xs text-slate-500 truncate font-mono">
                @{user?.username}
              </p>
            </div>
          </div>

          {/* Photo Actions Section */}
          <div className="px-3 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                  isBoys
                    ? 'bg-saffron-600 hover:bg-saffron-700 active:scale-98'
                    : 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="py-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Remove custom photo and use jersey avatar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {uploadError && (
              <p className="mt-1.5 text-[11px] text-rose-600 font-semibold px-1">
                {uploadError}
              </p>
            )}
          </div>

          <div className="h-px bg-slate-100 my-1 mx-3" />

          {/* Navigation / Feature Menu Items */}
          <div className="px-2 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onEditProfile) onEditProfile();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-none">Edit Profile & Bio</span>
                  <span className="text-[10px] text-slate-400 font-normal">Change username, story & moves</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenIdCard) onOpenIdCard();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-none">Official Athlete Pass</span>
                  <span className="text-[10px] text-slate-400 font-normal">View & print 2026 digital ID</span>
                </div>
              </div>
            </button>
          </div>

          <div className="h-px bg-slate-100 my-1 mx-3" />

          {/* Sign Out Option */}
          <div className="px-2 pt-0.5">
            <button
              type="button"
              onClick={logout}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span>Sign Out of Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
