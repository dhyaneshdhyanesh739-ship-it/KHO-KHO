import React, { useState } from 'react';
import { Menu, X, Shield, LogIn, User, LogOut, ChevronRight, Activity, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenLogin, onNavigateSection }) {
  const { user, isAuthenticated, logout, isAdmin, isPlayer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Kho-Kho', href: '#about-kho-kho' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Teams', href: '#teams' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(href.replace('#', ''));
    } else {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-subtle transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('#home')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-saffron-600 to-saffron-500 flex items-center justify-center text-white shadow-md shadow-saffron-500/25">
              <span className="font-editorial text-xl font-black tracking-tighter">KK</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial font-black text-xl text-navy-900 tracking-tight">KHO-KHO</span>
                <span className="font-editorial font-black text-xl text-saffron-600 tracking-tight">ARENA</span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Boys & Girls Team Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-saffron-600 hover:bg-saffron-50/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* User Status / Portal Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-navy-900">{user.name}</p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.role === 'BOYS_ADMIN'
                        ? 'bg-saffron-100 text-saffron-800'
                        : user.role === 'GIRLS_ADMIN'
                        ? 'bg-rose-100 text-rose-800'
                        : user.role === 'PLAYER'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="btn-primary text-sm shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Team Portal Login
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-saffron-600 text-white shadow-sm"
              >
                Login
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-saffron-50 hover:text-saffron-600"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-navy-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full btn-primary py-3 text-sm"
              >
                <LogIn className="w-4 h-4" />
                Select Division & Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
