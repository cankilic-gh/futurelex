import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LoadingStage {
  id: string;
  label: string;
  subLabel: string;
  completed: boolean;
}

interface AppLoaderProps {
  authLoading: boolean;
  planLoading: boolean;
  children: React.ReactNode;
}

const STAGES: LoadingStage[] = [
  { id: 'init', label: 'INITIALIZING', subLabel: 'Booting neural core...', completed: false },
  { id: 'auth', label: 'AUTHENTICATING', subLabel: 'Verifying identity...', completed: false },
  { id: 'data', label: 'SYNCING DATA', subLabel: 'Loading learning plans...', completed: false },
  { id: 'ready', label: 'READY', subLabel: 'System online', completed: false },
];

export const AppLoader: React.FC<AppLoaderProps> = ({
  authLoading,
  planLoading,
  children,
}) => {
  const [stages, setStages] = useState<LoadingStage[]>(STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Calculate current stage based on loading states
  useEffect(() => {
    let newIndex = 0;

    // Stage 0: Init (always completes quickly)
    if (currentStageIndex === 0) {
      const timer = setTimeout(() => {
        setCurrentStageIndex(1);
        setStages(prev => prev.map((s, i) => i === 0 ? { ...s, completed: true } : s));
      }, 500);
      return () => clearTimeout(timer);
    }

    // Stage 1: Auth
    if (!authLoading && currentStageIndex >= 1) {
      newIndex = 2;
      setStages(prev => prev.map((s, i) => i <= 1 ? { ...s, completed: true } : s));
    }

    // Stage 2: Data (Plans)
    if (!authLoading && !planLoading && currentStageIndex >= 1) {
      newIndex = 3;
      setStages(prev => prev.map((s, i) => i <= 2 ? { ...s, completed: true } : s));
    }

    if (newIndex > currentStageIndex) {
      setCurrentStageIndex(newIndex);
    }
  }, [authLoading, planLoading, currentStageIndex]);

  // Update progress bar
  useEffect(() => {
    const targetProgress = ((currentStageIndex + 1) / STAGES.length) * 100;

    // Animate to target
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [currentStageIndex]);

  // Complete and show content
  useEffect(() => {
    if (currentStageIndex === 3 && progress >= 100) {
      setStages(prev => prev.map(s => ({ ...s, completed: true })));
      setIsComplete(true);

      // Delay before showing content for smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStageIndex, progress]);

  // Notify HTML instant loader to hide
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('react-app-ready'));
    }
  }, []);

  const currentStage = stages[currentStageIndex] || stages[stages.length - 1];

  if (showContent) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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

      {/* Ambient glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">

        {/* Central Orb */}
        <div className="relative w-24 h-24 mb-8">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: 'rgba(0, 243, 255, 0.8)',
              borderRightColor: 'rgba(188, 19, 254, 0.5)',
              animation: 'spin 2s linear infinite',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(255, 0, 85, 0.6)',
              borderLeftColor: 'rgba(0, 243, 255, 0.3)',
              animation: 'spin 3s linear infinite reverse',
            }}
          />
          {/* Core */}
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #00f3ff, #bc13fe, #00f3ff)',
              animation: 'pulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 30px rgba(0, 243, 255, 0.5)',
            }}
          />
          {/* Glow center */}
          <div
            className="absolute inset-6 rounded-full bg-white"
            style={{
              animation: 'pulse 1s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
            }}
          />
        </div>

        {/* Stage Label */}
        <div className="text-center mb-6">
          <h2
            className="font-mono text-xl tracking-[0.2em] mb-2"
            style={{
              background: 'linear-gradient(90deg, #00f3ff, #bc13fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {currentStage.label}
          </h2>
          <p className="text-slate-500 text-sm font-mono">
            {currentStage.subLabel}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00f3ff, #bc13fe, #ff0055)',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-600 font-mono">{Math.round(progress)}%</span>
            <span className="text-xs text-slate-600 font-mono">
              Stage {currentStageIndex + 1}/{STAGES.length}
            </span>
          </div>
        </div>

        {/* Stage Checklist */}
        <div className="w-full space-y-2">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                index === currentStageIndex
                  ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                  : stage.completed
                  ? 'bg-slate-800/30'
                  : 'bg-slate-900/30 opacity-50'
              }`}
            >
              {/* Status Icon */}
              <div className="w-5 h-5 flex items-center justify-center">
                {stage.completed ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentStageIndex ? (
                  <div
                    className="w-3 h-3 rounded-full bg-neon-cyan"
                    style={{ animation: 'pulse 1s ease-in-out infinite' }}
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                )}
              </div>

              {/* Label */}
              <span
                className={`font-mono text-sm ${
                  stage.completed
                    ? 'text-slate-400'
                    : index === currentStageIndex
                    ? 'text-neon-cyan'
                    : 'text-slate-600'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-neon-cyan/20 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-neon-purple/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-neon-pink/20 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-golden-400/20 rounded-br-lg" />

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </motion.div>
  );
};

export default AppLoader;
