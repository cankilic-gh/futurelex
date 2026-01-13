import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FuturisticLoaderProps {
  message?: string;
  subMessage?: string;
  progress?: number; // 0-100, if provided shows progress bar
  onComplete?: () => void;
}

// Memoized particle positions to prevent re-renders
const generateParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2,
    size: Math.random() * 2 + 1,
  }));

// Memoized orbital dots
const generateOrbitalDots = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    angle: (360 / count) * i,
  }));

export const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({
  message = 'INITIALIZING',
  subMessage = 'Neural pathways syncing...',
  progress,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  const particles = useMemo(() => generateParticles(30), []);
  const orbitalDots = useMemo(() => generateOrbitalDots(8), []);

  // Typewriter effect for message
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= message.length) {
        setDisplayText(message.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [message]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // Phase progression for visual variety
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Call onComplete when progress reaches 100
  useEffect(() => {
    if (progress === 100 && onComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Actual CSS colors for conic-gradient
  const phaseGradients = [
    'conic-gradient(from 0deg, #00f3ff, #bc13fe, #00f3ff)',
    'conic-gradient(from 0deg, #bc13fe, #ff0055, #bc13fe)',
    'conic-gradient(from 0deg, #ff0055, #FFD700, #ff0055)',
    'conic-gradient(from 0deg, #FFD700, #00f3ff, #FFD700)',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      }}
    >
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 20s linear infinite',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-neon-cyan"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              boxShadow: '0 0 6px rgba(0, 243, 255, 0.8)',
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Ambient Glow Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0, 243, 255, 0.3) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(188, 19, 254, 0.4) 0%, transparent 70%)',
          top: '30%',
          left: '30%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Central Orb with Orbital Ring */}
        <div className="relative w-32 h-32 mb-8">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: 'rgba(0, 243, 255, 0.8)',
              borderRightColor: 'rgba(188, 19, 254, 0.5)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          {/* Middle rotating ring (opposite direction) */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(255, 0, 85, 0.6)',
              borderLeftColor: 'rgba(0, 243, 255, 0.3)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner pulsing orb */}
          <motion.div
            className="absolute inset-4 rounded-full"
            style={{
              background: phaseGradients[currentPhase],
              boxShadow: '0 0 40px rgba(0, 243, 255, 0.5), 0 0 80px rgba(188, 19, 254, 0.3)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Core glow */}
          <motion.div
            className="absolute inset-8 rounded-full bg-white"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(0, 243, 255, 0.6)',
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Orbital dots - Pure CSS for smooth rotation */}
          <div
            className="absolute inset-0"
            style={{ animation: 'orbitSpin 4s linear infinite' }}
          >
            {orbitalDots.map((dot) => (
              <div
                key={dot.id}
                className="absolute w-2 h-2 rounded-full bg-neon-cyan"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px',
                  transform: `rotate(${dot.angle}deg) translateX(56px)`,
                  boxShadow: '0 0 10px rgba(0, 243, 255, 0.8)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Terminal-style text */}
        <div className="text-center mb-6">
          <div className="font-mono text-2xl tracking-[0.3em] mb-2">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              {displayText}
            </span>
            <span
              className={`text-neon-cyan transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
            >
              _
            </span>
          </div>

          <motion.p
            className="text-slate-500 text-sm font-mono tracking-wider"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {subMessage}
          </motion.p>
        </div>

        {/* Progress bar (if progress provided) */}
        {progress !== undefined && (
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00f3ff, #bc13fe, #ff0055)',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Scanning line effect - CSS animation to avoid unit mixing */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(0, 243, 255, 0.03), transparent)',
            height: '100px',
            animation: 'scanLine 3s linear infinite',
          }}
        />

        {/* Data stream effect on sides */}
        <div className="absolute left-4 top-0 bottom-0 w-px overflow-hidden opacity-20">
          <motion.div
            className="w-full h-full"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #00f3ff 10px, #00f3ff 20px)',
            }}
            animate={{ y: ['-100%', '0%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="absolute right-4 top-0 bottom-0 w-px overflow-hidden opacity-20">
          <motion.div
            className="w-full h-full"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #bc13fe 10px, #bc13fe 20px)',
            }}
            animate={{ y: ['0%', '-100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-purple/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-pink/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-golden-400/30 rounded-br-lg" />

      {/* Keyframe animations */}
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes scanLine {
          0% { top: -100px; }
          100% { top: 100%; }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default FuturisticLoader;
