import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Background } from '../components/Layout/Background';
import { Navbar } from '../components/Layout/Navbar';
import { UserSavedWord, Word } from '../types';
import { Trash2, BookMarked, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedWords, setSavedWords] = useState<UserSavedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWords = async () => {
      try {
        const q = query(collection(db, 'users', user.uid, 'saved_words'));
        const querySnapshot = await getDocs(q);
        const words = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserSavedWord[];
        setSavedWords(words);
      } catch (err) {
        console.error("Failed to fetch saved words", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [user]);

  const removeWord = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved_words', id));
      setSavedWords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error("Failed to remove word", err);
    }
  };

  const startReview = () => {
    // Convert saved words to Word format for FlashcardSession
    const reviewWords: Word[] = savedWords.map(sw => ({
      id: sw.wordId || sw.id,
      english: sw.english,
      turkish: sw.turkish,
      example: sw.example || '',
      type: sw.type || 'noun',
      level: sw.level || 1,
      pronunciation: sw.pronunciation
    }));
    
    // Store review words in sessionStorage and navigate to review mode
    sessionStorage.setItem('reviewWords', JSON.stringify(reviewWords));
    navigate('/learn?review=true');
  };

  return (
    <div className="min-h-screen">
      <Background />
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 px-4 pb-20">
        <div className="flex items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-pink/10 rounded-xl border border-neon-pink/30">
              <BookMarked className="w-8 h-8 text-neon-pink" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Neural Archive</h1>
              <p className="text-slate-400">Words saved for retraining.</p>
            </div>
          </div>
          {savedWords.length > 0 && (
            <motion.button
              onClick={startReview}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-neon-cyan/20 via-neon-cyan/30 to-neon-cyan/40 text-neon-cyan border-2 border-neon-cyan/60 rounded-2xl font-semibold shadow-[0_4px_20px_rgba(0,243,255,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-neon-cyan/30 hover:border-neon-cyan/80 hover:shadow-[0_6px_30px_rgba(0,243,255,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all whitespace-nowrap relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 243, 255, 0.3) 50%, rgba(0, 243, 255, 0.4) 100%)',
                boxShadow: '0 4px 20px rgba(0, 243, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 30px rgba(0, 243, 255, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <Play size={20} className="flex-shrink-0 relative z-10" />
              <span className="relative z-10">Review Words</span>
            </motion.button>
          )}
        </div>

        {loading ? (
            <div className="text-center text-slate-500 font-mono animate-pulse">Synchronizing database...</div>
        ) : savedWords.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-slate-400 mb-4">No data found in archive.</p>
                <p className="text-sm text-slate-600">Start a session to save difficult words.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {savedWords.map((word) => (
                        <motion.div
                            key={word.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-white">{word.english}</h3>
                                <p className="text-neon-cyan text-sm">{word.turkish}</p>
                            </div>
                            <button
                                onClick={() => removeWord(word.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>
    </div>
  );
};