import React, { useState } from 'react';
import { LayoutGrid, BookMarked, Languages, User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: '/plans', label: 'Plans', icon: Languages },
    { path: '/learn', label: 'Learn', icon: LayoutGrid },
    { path: '/dashboard', label: 'Saved', icon: BookMarked },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Glass container */}
        <div className="backdrop-blur-2xl bg-slate-900/70 border border-white/5 rounded-2xl px-4 py-2.5 flex items-center justify-between">

          {/* Logo - minimal, no navigation to prevent refresh */}
          <div className="flex items-center gap-2 cursor-default">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-center">
              <Languages className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="text-base font-semibold text-white hidden sm:block">
              FutureLex
            </span>
          </div>

          {/* Center Navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - User Menu */}
          <div className="relative">
            {loading ? (
              <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
            ) : user ? (
              // Logged in user
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:block max-w-[100px] truncate">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              // Guest user
              <Link
                to="/auth"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm text-slate-400 hover:text-white"
              >
                <User size={14} />
                <span className="hidden sm:block">Guest</span>
                <LogIn size={14} />
              </Link>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};
