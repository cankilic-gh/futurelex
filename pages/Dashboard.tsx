import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import { LocalStorage } from '../services/localStorage';
import { db } from '../services/firebase';
import { collection, query, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { UserSavedWord, Word } from '../types';
import { Trash2, BookMarked, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLanguageByCode } from '../services/languages';
import { useAuth } from '../context/AuthContext';

// Cache configuration
const CACHE_KEY_DASHBOARD = 'futurelex_dashboard_words_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache utility functions (plan-specific)
function getCachedWordsForPlan(cacheKey: string): { words: UserSavedWord[], timestamp: number } | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return { words: parsed.words || [], timestamp: parsed.timestamp || 0 };
  } catch {
    return null;
  }
}

function setCachedWordsForPlan(cacheKey: string, words: UserSavedWord[]): void {
  try {
    const data = {
      words,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export const Dashboard: React.FC = () => {
  // Get activePlan from PlanContext (synced with Firebase)
  const { activePlan } = usePlan();
  // Use real Firebase auth user - this ensures data persists across sessions/devices
  const { user: authUser } = useAuth();
  // Fall back to device ID for guests (not logged in), but prefer real user UID
  const user = useMemo(() => {
    if (authUser) {
      return { uid: authUser.uid };
    }
    // Guest fallback - use device ID
    return { uid: LocalStorage.getDeviceId() };
  }, [authUser]);
  const navigate = useNavigate();
  const [savedWords, setSavedWords] = useState<UserSavedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !activePlan) {
      setLoading(false);
      return;
    }

    const fetchWords = async () => {
      // INSTANT LOADING: Show immediately, don't wait for Firebase
      const cacheKey = `${CACHE_KEY_DASHBOARD}_${activePlan.id}`;
      const cached = getCachedWordsForPlan(cacheKey);

      // Use cache if available (even expired), otherwise show empty
      const cachedWords = cached?.words || [];
      setSavedWords(cachedWords);
      setLoading(false); // Show immediately - don't wait for Firebase!

      // Fetch from Firebase in background (fire and forget)
      getDocs(query(collection(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words')))
        .then(querySnapshot => {
          const words = querySnapshot.docs.map(doc => ({
            id: doc.id,
            planId: activePlan.id,
            ...doc.data()
          })) as UserSavedWord[];

          setCachedWordsForPlan(cacheKey, words);
          setSavedWords(words);
        })
        .catch(() => {
          // Background sync failed - UI is already showing
        });
    };

    fetchWords();
  }, [user, activePlan]);

  const removeWord = async (id: string) => {
    if (!user || !activePlan) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', id));
      const updatedWords = savedWords.filter(w => w.id !== id);
      setSavedWords(updatedWords);
      // Update cache after removal
      const cacheKey = `${CACHE_KEY_DASHBOARD}_${activePlan.id}`;
      setCachedWordsForPlan(cacheKey, updatedWords);
    } catch {
      // Failed to remove word
    }
  };

  const startReview = () => {
    if (!activePlan) return;
    
    // Convert saved words to Word format for FlashcardSession
    const reviewWords: Word[] = savedWords.map(sw => ({
      id: sw.wordId || sw.id,
      sourceText: sw.sourceText || sw.english || '',
      targetText: sw.targetText || sw.turkish || '',
      sourceLanguage: activePlan.sourceLanguage,
      targetLanguage: activePlan.targetLanguage,
      example: sw.example || '',
      type: sw.type || 'noun',
      level: sw.level || 1,
      pronunciation: sw.pronunciation,
      // Legacy fields for backward compatibility
      english: sw.english || sw.sourceText,
      turkish: sw.turkish || sw.targetText,
    }));
    
    // Store review words in sessionStorage and navigate to review mode
    sessionStorage.setItem('reviewWords', JSON.stringify(reviewWords));
    navigate('/learn?review=true');
  };

  return (
    <div className="min-h-screen">

      <div className="max-w-4xl mx-auto pt-32 px-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Saved Words</h1>
            <p className="text-sm text-slate-500">
              {activePlan ? (
                <span className="flex items-center gap-2">
                  {getLanguageByCode(activePlan.sourceLanguage)?.flag} → {getLanguageByCode(activePlan.targetLanguage)?.flag}
                  <span className="text-slate-600">•</span>
                  {savedWords.length} words saved
                </span>
              ) : (
                'Words you want to review later'
              )}
            </p>
          </div>
          {savedWords.length > 0 && (
            <motion.button
              onClick={startReview}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-all"
            >
              <Play size={16} />
              Review All
            </motion.button>
          )}
        </div>

        {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm">Loading...</div>
        ) : savedWords.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-slate-900/60 border border-white/5">
                <BookMarked className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-1">No saved words yet</p>
                <p className="text-xs text-slate-600">Save words while learning to review them later</p>
            </div>
        ) : (
            <div className="space-y-2">
                <AnimatePresence>
                    {savedWords.map((word) => (
                        <motion.div
                            key={word.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900/60 border border-white/5 px-4 py-3 rounded-xl flex items-center justify-between group hover:bg-slate-800/60 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-8 rounded-full bg-neon-pink/50" />
                                <div>
                                    <h3 className="text-base font-medium text-white">{word.sourceText || word.english}</h3>
                                    <p className="text-sm text-slate-500">{word.targetText || word.turkish}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeWord(word.id)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
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