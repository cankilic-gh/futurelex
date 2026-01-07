import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  className, 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden px-6 py-3 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 border-0 whitespace-nowrap flex-nowrap";
  
  const variants = {
    primary: "bg-gradient-to-b from-golden-400 via-golden-500 to-golden-600 text-slate-900 shadow-[0_4px_20px_rgba(255,215,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_6px_30px_rgba(255,215,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95",
    secondary: "bg-gradient-to-b from-slate-700/80 via-slate-800/80 to-slate-900/80 text-slate-200 border border-slate-600/30 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:scale-105",
    danger: "bg-gradient-to-b from-red-500 via-red-600 to-red-700 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.6)] hover:scale-105",
    ghost: "bg-transparent border-transparent text-slate-400 hover:text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={twMerge(baseStyles, variants[variant], className)}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(135deg, #FFE55C 0%, #FFD700 50%, #E6C200 100%)'
          : undefined,
        boxShadow: variant === 'primary'
          ? '0 4px 20px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.3)'
          : undefined,
      }}
      {...props}
    >
      {/* Glossy highlight effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-2xl pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};