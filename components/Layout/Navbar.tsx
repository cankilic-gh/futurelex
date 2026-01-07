import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassButton } from '../ui/GlassButton';
import { LogOut, LayoutGrid, BookMarked, Cpu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/20">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20 group-hover:bg-neon-cyan/20 transition-colors">
            <Cpu className="w-6 h-6 text-neon-cyan" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            FutureLex
          </span>
        </Link>

        {/* Desktop Menu */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/learn">
              <GlassButton variant={location.pathname === '/learn' ? 'primary' : 'secondary'} className="h-10 px-4">
                <LayoutGrid size={16} /> Learn
              </GlassButton>
            </Link>
            <Link to="/dashboard">
              <GlassButton variant={location.pathname === '/dashboard' ? 'primary' : 'secondary'} className="h-10 px-4">
                <BookMarked size={16} /> My Dictionary
              </GlassButton>
            </Link>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-xs font-mono text-slate-400">{user.email?.split('@')[0]}</span>
              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500 font-mono">SYSTEM: GUEST</span>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Nav Placeholder could go here */}
    </nav>
  );
};