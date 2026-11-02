import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({
  variant = 'icon', // 'icon' | 'pill' | 'badge'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  showLabel = false,
}) {
  const { theme, isDark, toggleTheme } = useTheme();

  // Size configurations
  const sizeClasses = {
    sm: {
      btn: 'p-1.5 rounded-lg text-xs',
      icon: 'w-4 h-4',
      pill: 'w-14 h-7 p-0.5',
      thumb: 'w-6 h-6',
      pillIcon: 'w-3 h-3',
    },
    md: {
      btn: 'p-2 rounded-xl text-sm',
      icon: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
      pill: 'w-16 h-8 p-1',
      thumb: 'w-6 h-6',
      pillIcon: 'w-3.5 h-3.5',
    },
    lg: {
      btn: 'p-2.5 rounded-2xl text-base',
      icon: 'w-5 h-5',
      pill: 'w-20 h-10 p-1',
      thumb: 'w-8 h-8',
      pillIcon: 'w-4 h-4',
    },
  }[size] || {
    btn: 'p-2 rounded-xl text-sm',
    icon: 'w-4.5 h-4.5',
    pill: 'w-16 h-8 p-1',
    thumb: 'w-6 h-6',
    pillIcon: 'w-3.5 h-3.5',
  };

  const tooltipText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  // 1. Sliding Pill Switch Variant (High Polish)
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tooltipText}
        title={tooltipText}
        className={`relative inline-flex items-center rounded-full transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500/50 shadow-inner ${
          isDark
            ? 'bg-slate-800 border border-slate-700/80 shadow-slate-950/40'
            : 'bg-amber-100/80 border border-amber-200/80 shadow-amber-900/10'
        } ${sizeClasses.pill} ${className}`}
      >
        {/* Background track icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs select-none pointer-events-none">
          <Sun className={`${sizeClasses.pillIcon} text-amber-500 transition-opacity ${isDark ? 'opacity-30' : 'opacity-100'}`} />
          <Moon className={`${sizeClasses.pillIcon} text-indigo-400 transition-opacity ${isDark ? 'opacity-100' : 'opacity-30'}`} />
        </div>

        {/* Sliding Thumb */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`flex items-center justify-center rounded-full shadow-md z-10 transition-colors ${
            isDark
              ? 'bg-indigo-600 text-white ml-auto shadow-indigo-900/50'
              : 'bg-white text-amber-500 mr-auto shadow-amber-500/20'
          } ${sizeClasses.thumb}`}
        >
          {isDark ? (
            <Moon className={`${sizeClasses.pillIcon} fill-current`} />
          ) : (
            <Sun className={`${sizeClasses.pillIcon} fill-current`} />
          )}
        </motion.div>

        {showLabel && (
          <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  }

  // 2. Badge / Textual Variant
  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tooltipText}
        title={tooltipText}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer border active:scale-95 ${
          isDark
            ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700 shadow-md shadow-black/20'
            : 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200 shadow-sm'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -10, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            )}
          </motion.div>
        </AnimatePresence>
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
    );
  }

  // 3. Icon Button Variant (Default, universally versatile for navbars & headers)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={tooltipText}
      title={tooltipText}
      className={`relative inline-flex items-center justify-center transition-all duration-200 cursor-pointer border active:scale-90 group focus:outline-none focus:ring-2 focus:ring-saffron-500/40 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-indigo-300 hover:text-amber-300 border-slate-700 shadow-sm shadow-black/40 hover:border-slate-600'
          : 'bg-white hover:bg-amber-50/70 text-slate-700 hover:text-amber-600 border-slate-200 shadow-xs hover:border-amber-300'
      } ${sizeClasses.btn} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ scale: 0.5, rotate: isDark ? -90 : 90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, rotate: isDark ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <div className="relative">
              <Moon className={`${sizeClasses.icon} text-indigo-300 group-hover:text-amber-300 transition-colors fill-indigo-300/10`} />
              <Sparkles className="w-2 h-2 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          ) : (
            <div className="relative">
              <Sun className={`${sizeClasses.icon} text-amber-500 group-hover:rotate-45 transition-transform duration-300 fill-amber-500/10`} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showLabel && (
        <span className="ml-2 font-bold text-xs">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
