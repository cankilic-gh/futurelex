import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Word } from '../../types';
import { Volume2, RotateCw, BookmarkCheck, CheckCircle } from 'lucide-react';

// Simple phonetic conversion helper
const getPhonetic = (word: string): string => {
  // Basic phonetic representation - in production, use a proper dictionary API
  const phoneticMap: { [key: string]: string } = {
    'ability': '/əˈbɪlɪti/',
    'access': '/ˈækses/',
    'action': '/ˈækʃən/',
    'active': '/ˈæktɪv/',
    'actual': '/ˈæktʃuəl/',
    'address': '/əˈdres/',
    'admit': '/ədˈmɪt/',
    'adult': '/ˈædʌlt/',
    'advance': '/ədˈvæns/',
    'advice': '/ədˈvaɪs/',
    'affect': '/əˈfekt/',
    'afford': '/əˈfɔːrd/',
    'afraid': '/əˈfreɪd/',
    'again': '/əˈɡen/',
    'against': '/əˈɡenst/',
    'age': '/eɪdʒ/',
    'agency': '/ˈeɪdʒənsi/',
    'agent': '/ˈeɪdʒənt/',
    'agree': '/əˈɡriː/',
    'ahead': '/əˈhed/',
    'aid': '/eɪd/',
    'aim': '/eɪm/',
    'air': '/er/',
    'airport': '/ˈerpɔːrt/',
    'alarm': '/əˈlɑːrm/',
    'album': '/ˈælbəm/',
    'alcohol': '/ˈælkəhɔːl/',
    'alert': '/əˈlɜːrt/',
    'alive': '/əˈlaɪv/',
    'all': '/ɔːl/',
    'judge': '/dʒʌdʒ/',
    'federal': '/ˈfedərəl/',
  };
  
  const lowerWord = word.toLowerCase();
  return phoneticMap[lowerWord] || `/${lowerWord}/`;
};

interface CardProps {
  word: Word;
  isSaved?: boolean;
  isCompleted?: boolean;
}

export const Card: React.FC<CardProps> = ({ word, isSaved = false, isCompleted = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.english);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-md h-[400px] cursor-pointer" 
      onClick={handleFlip}
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <motion.div 
            className="w-full h-full flex flex-col items-center justify-center backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: isCompleted
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.2) 100%)'
                : isSaved
                  ? 'linear-gradient(135deg, rgba(255, 77, 122, 0.15) 0%, rgba(230, 57, 107, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
              borderColor: isCompleted
                ? 'rgba(34, 197, 94, 0.6)'
                : isSaved
                  ? 'rgba(255, 77, 122, 0.6)'
                  : 'rgba(0, 243, 255, 0.5)',
              boxShadow: isCompleted
                ? '0 25px 70px rgba(34, 197, 94, 0.3), 0 0 50px rgba(34, 197, 94, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 0 100px rgba(34, 197, 94, 0.1)'
                : isSaved
                  ? '0 25px 70px rgba(255, 77, 122, 0.3), 0 0 50px rgba(255, 77, 122, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 0 100px rgba(255, 77, 122, 0.1)'
                  : '0 25px 70px rgba(0, 0, 0, 0.4), 0 0 50px rgba(0, 243, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.1), 0 0 100px rgba(0, 243, 255, 0.1)',
            }}
          >
            <span 
              className="absolute top-6 left-6 text-xs font-medium text-slate-400 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50"
            >
              Level {word.level}
            </span>
            <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5">
              {isCompleted && (
                <span className="text-xs font-mono text-green-400 border border-green-500/30 px-2 py-1 rounded-full bg-green-500/10 flex items-center gap-1">
                  <CheckCircle size={12} /> DONE
                </span>
              )}
              {isSaved && !isCompleted && (
                <span className="text-xs font-mono text-neon-pink border border-neon-pink/30 px-2 py-1 rounded-full bg-neon-pink/10 flex items-center gap-1">
                  <BookmarkCheck size={12} /> SAVED
                </span>
              )}
              <span className="text-xs font-medium text-slate-300 italic">
                {word.pronunciation || getPhonetic(word.english)}
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase">
                {word.type}
              </span>
            </div>
            
            <motion.h2 
              className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
            >
              {word.english}
            </motion.h2>
            
            {/* Subtle audio button - less prominent */}
            <motion.button 
              onClick={speak}
              className="mt-4 p-2.5 rounded-full relative overflow-hidden bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 size={20} className="relative z-10" />
            </motion.button>
            
            <motion.div 
              className="absolute bottom-6 flex items-center gap-2 text-slate-400 text-sm font-medium"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <RotateCw size={14} className="text-slate-500" /> Tap to reveal
            </motion.div>
          </motion.div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full"
          style={{ 
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div 
            className="w-full h-full flex flex-col items-center justify-center backdrop-blur-xl border-2 rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              borderColor: 'rgba(255, 215, 0, 0.4)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
             <h3 
              className="text-3xl font-bold mb-6 text-center"
              style={{
                background: 'linear-gradient(135deg, #FFE55C 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {word.turkish}
            </h3>
            
            <div 
              className="w-full rounded-xl p-6 border-2 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(230, 194, 0, 0.05) 100%)',
                borderColor: 'rgba(255, 215, 0, 0.3)',
              }}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #E6C200 100%)'
                }}
              />
              <p className="text-lg text-slate-200 italic font-light leading-relaxed relative z-10">
                "{word.example}"
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};