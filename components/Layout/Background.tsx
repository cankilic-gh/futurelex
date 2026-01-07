import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Animated colorful blobs - mobile game style */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/25 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/25 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-neon-pink/25 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-golden-400/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-1000" />
      
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-3xl" />
      
      {/* Subtle texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 brightness-100 contrast-150"></div>
      
      {/* Animated grid pattern for game feel */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};