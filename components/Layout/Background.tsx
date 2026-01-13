import React from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Animated colorful blobs with Framer Motion */}
      <motion.div
        className="absolute w-96 h-96 bg-neon-cyan/25 rounded-full mix-blend-screen filter blur-[120px]"
        style={{ top: '0%', left: '25%' }}
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, 30, -30, 30, 0],
          scale: [1, 1.1, 1, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-neon-purple/25 rounded-full mix-blend-screen filter blur-[120px]"
        style={{ top: '0%', right: '25%' }}
        animate={{
          x: [0, -30, 50, -30, 0],
          y: [0, -40, 20, -40, 0],
          scale: [1, 0.95, 1.1, 0.95, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-neon-pink/25 rounded-full mix-blend-screen filter blur-[120px]"
        style={{ bottom: '-128px', left: '33%' }}
        animate={{
          x: [0, 40, -40, 40, 0],
          y: [0, -20, 40, -20, 0],
          scale: [1, 1.05, 0.95, 1.05, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-golden-400/20 rounded-full mix-blend-screen filter blur-[100px]"
        style={{ top: '50%', left: '50%' }}
        animate={{
          x: ['-50%', '-30%', '-50%', '-70%', '-50%'],
          y: ['-50%', '-30%', '-50%', '-70%', '-50%'],
          scale: [1, 1.15, 1, 0.85, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-neon-cyan/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-3xl" />

      {/* Subtle texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 brightness-100 contrast-150"></div>

      {/* Animated grid pattern for game feel */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px']
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(0, 243, 255, 0.02) 50%)',
          backgroundSize: '100% 4px'
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
};
