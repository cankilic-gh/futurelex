import React from 'react';
import { LEVELS } from '../services/data';
import { Link } from 'react-router-dom';
import { Background } from '../components/Layout/Background';
import { Navbar } from '../components/Layout/Navbar';
import { useLocalFirst } from '../context/LocalFirstContext';
import { getLanguageByCode } from '../services/languages';
import { motion } from 'framer-motion';
import { Database, Unlock } from 'lucide-react';

export const LevelSelect: React.FC = () => {
  const { activePlan } = useLocalFirst();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pb-20">
      <Background />
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 px-4 md:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-4">
            Select Data Stream
          </h1>
          {activePlan && (
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="text-2xl">{getLanguageByCode(activePlan.sourceLanguage)?.flag}</span>
              <span className="text-slate-500">→</span>
              <span className="text-2xl">{getLanguageByCode(activePlan.targetLanguage)?.flag}</span>
              <span className="text-slate-400 text-sm ml-2">{activePlan.name}</span>
            </div>
          )}
          <p className="text-slate-400 max-w-lg mx-auto">
            Access specific vocabulary matrices based on proficiency level. All sectors are unlocked for free roaming.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {LEVELS.map((level) => (
            <motion.div key={level} variants={item}>
              <Link to={`/learn/${level}`}>
                <div className="group relative h-40 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-neon-cyan/50 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] overflow-hidden">
                  <div className="absolute top-3 right-3 text-neon-cyan/50">
                    <Unlock size={16} />
                  </div>
                  
                  <div className="p-4 bg-slate-900/50 rounded-full border border-white/5 mb-3 group-hover:scale-110 transition-transform">
                    <Database size={24} className="text-slate-300 group-hover:text-neon-cyan transition-colors" />
                  </div>
                  
                  <span className="text-2xl font-bold font-mono text-white">Lvl {level}</span>
                  <span className="text-xs text-slate-500 mt-1 uppercase tracking-widest">300 Words</span>
                  
                  {/* Hover glow effect */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};