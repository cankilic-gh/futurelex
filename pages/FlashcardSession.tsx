import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWordPool, getAllAvailableWords } from '../services/data';
import { getLanguageByCode } from '../services/languages';
import { usePlan } from '../context/PlanContext';
import { LocalStorage } from '../services/localStorage';
import { db } from '../services/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, serverTimestamp } from 'firebase/firestore';
import { Card } from '../components/Flashcard/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { Word } from '../types';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, BookmarkCheck, CheckCircle, X, Database, Cloud, Sparkles, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const POOL_SIZE = 30;

const CACHE_KEY_SAVED = 'futurelex_saved_words_cache';
const CACHE_KEY_COMPLETED = 'futurelex_completed_words_cache';
const CACHE_KEY_DASHBOARD = 'futurelex_dashboard_words_cache';
const CACHE_TTL = 5 * 60 * 1000;

function getCachedWordIds(key: string): { ids: string[], timestamp: number } | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return { ids: parsed.ids || [], timestamp: parsed.timestamp || 0 };
  } catch {
    return null;
  }
}

function setCachedWordIds(key: string, ids: string[]): void {
  try {
    const data = {
      ids,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

interface DashboardWord {
  id: string;
  wordId?: string;
  planId: string;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  example?: string;
  type?: string;
  level?: number;
  pronunciation?: string;
  english?: string;
  turkish?: string;
}

function getDashboardCache(planId: string): { words: DashboardWord[], timestamp: number } | null {
  try {
    const cacheKey = `${CACHE_KEY_DASHBOARD}_${planId}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return { words: parsed.words || [], timestamp: parsed.timestamp || 0 };
  } catch {
    return null;
  }
}

function setDashboardCache(planId: string, words: DashboardWord[]): void {
  try {
    const cacheKey = `${CACHE_KEY_DASHBOARD}_${planId}`;
    const data = {
      words,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

function addWordToDashboardCache(planId: string, word: Word, activePlan: any): void {
  const cached = getDashboardCache(planId);
  const existingWords = cached?.words || [];

  const exists = existingWords.some(w => w.id === word.id || w.wordId === word.id);
  if (exists) {
    return;
  }

  const dashboardWord: DashboardWord = {
    id: word.id,
    wordId: word.id,
    planId: planId,
    sourceText: word.sourceText || word.english || '',
    targetText: word.targetText || word.turkish || '',
    sourceLanguage: activePlan.sourceLanguage,
    targetLanguage: activePlan.targetLanguage,
    example: word.example || '',
    type: word.type || 'noun',
    level: word.level || 1,
    english: word.english || word.sourceText,
    turkish: word.turkish || word.targetText,
  };

  if (word.pronunciation) {
    dashboardWord.pronunciation = word.pronunciation;
  }

  const updatedWords = [...existingWords, dashboardWord];
  setDashboardCache(planId, updatedWords);
}

function removeWordFromDashboardCache(planId: string, wordId: string): void {
  const cached = getDashboardCache(planId);
  if (!cached) return;

  const updatedWords = cached.words.filter(w => w.id !== wordId && w.wordId !== wordId);
  setDashboardCache(planId, updatedWords);
}

export const FlashcardSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === 'true';

  const { activePlan, updatePlanProgress } = usePlan();
  const { user: authUser } = useAuth();
  const user = useMemo(() => {
    if (authUser) {
      return { uid: authUser.uid };
    }
    return { uid: LocalStorage.getDeviceId() };
  }, [authUser]);

  const [savedWordIds, setSavedWordIds] = useState<string[]>(() => {
    if (!activePlan) return [];
    const cached = getCachedWordIds(`${CACHE_KEY_SAVED}_${activePlan.id}`);
    return cached?.ids || [];
  });

  const [completedWordIds, setCompletedWordIds] = useState<string[]>(() => {
    if (!activePlan) return [];
    const cached = getCachedWordIds(`${CACHE_KEY_COMPLETED}_${activePlan.id}`);
    return cached?.ids || [];
  });

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'init' | 'cache' | 'firebase' | 'pool' | 'done'>('init');

  useEffect(() => {
    if (!activePlan) return;

    const cachedSaved = getCachedWordIds(`${CACHE_KEY_SAVED}_${activePlan.id}`);
    const cachedCompleted = getCachedWordIds(`${CACHE_KEY_COMPLETED}_${activePlan.id}`);

    if (cachedSaved?.ids) {
      setSavedWordIds(cachedSaved.ids);
    }
    if (cachedCompleted?.ids) {
      setCompletedWordIds(cachedCompleted.ids);
    }
  }, [activePlan?.id]);

  useEffect(() => {
    if (!user || !activePlan) {
      setIsLoading(false);
      return;
    }

    const fetchUserWords = async () => {
      setLoadingStage('init');
      try {
        if (isReviewMode) {
          const reviewWordsStr = sessionStorage.getItem('reviewWords');
          if (reviewWordsStr) {
            try {
              const reviewWords: Word[] = JSON.parse(reviewWordsStr);
              if (reviewWords.length > 0) {
                setWords(reviewWords);
                setIsLoading(false);
                sessionStorage.removeItem('reviewWords');
                return;
              }
            } catch {
              // Continue with normal loading
            }
          }
        }

        setLoadingStage('cache');
        const planCacheKeySaved = `${CACHE_KEY_SAVED}_${activePlan.id}`;
        const planCacheKeyCompleted = `${CACHE_KEY_COMPLETED}_${activePlan.id}`;
        const cachedSaved = getCachedWordIds(planCacheKeySaved);
        const cachedCompleted = getCachedWordIds(planCacheKeyCompleted);

        let savedIds: string[] = [];
        let completedIds: string[] = [];

        if (cachedSaved && isCacheValid(cachedSaved.timestamp)) {
          savedIds = cachedSaved.ids;
        }
        if (cachedCompleted && isCacheValid(cachedCompleted.timestamp)) {
          completedIds = cachedCompleted.ids;
        }

        setSavedWordIds(savedIds);
        setCompletedWordIds(completedIds);

        if (!isReviewMode) {
          const completedIdsSet = new Set(completedIds);
          const pool = getWordPool(
            activePlan.sourceLanguage,
            activePlan.targetLanguage,
            completedIdsSet,
            POOL_SIZE
          );
          setWords(pool);
          setIsLoading(false);
        }

        setLoadingStage('firebase');
        Promise.all([
          getDocs(query(collection(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words'))),
          getDocs(query(collection(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words')))
        ]).then(([savedSnapshot, completedSnapshot]) => {
          const freshSavedIds: string[] = [];
          savedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.wordId && !freshSavedIds.includes(data.wordId)) {
              freshSavedIds.push(data.wordId);
            }
          });

          const freshCompletedIds: string[] = [];
          completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.wordId && !freshCompletedIds.includes(data.wordId)) {
              freshCompletedIds.push(data.wordId);
            }
          });

          setCachedWordIds(planCacheKeySaved, freshSavedIds);
          setCachedWordIds(planCacheKeyCompleted, freshCompletedIds);

          setSavedWordIds(freshSavedIds);
          setCompletedWordIds(freshCompletedIds);

          if (!isReviewMode && freshCompletedIds.length !== completedIds.length) {
            const freshCompletedIdsSet = new Set(freshCompletedIds);
            const pool = getWordPool(
              activePlan.sourceLanguage,
              activePlan.targetLanguage,
              freshCompletedIdsSet,
              POOL_SIZE
            );
            setWords(pool);
          }
        }).catch(() => {
          // Background sync failed - UI is already showing
        });
      } catch {
        if (!isReviewMode && activePlan) {
          const pool = getWordPool(
            activePlan.sourceLanguage,
            activePlan.targetLanguage,
            new Set(),
            POOL_SIZE
          );
          setWords(pool);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchUserWords();
  }, [user?.uid, activePlan?.id, isReviewMode]);

  const refillPool = (currentWords: Word[], completedIds: string[]) => {
    if (!activePlan) return currentWords;

    const completedIdsSet = new Set(completedIds);
    const currentWordIds = new Set(currentWords.map(w => w.id));
    const availableWords = getAllAvailableWords(
      activePlan.sourceLanguage,
      activePlan.targetLanguage,
      completedIdsSet
    );

    const newWords = availableWords.filter(w => !currentWordIds.has(w.id));

    const shuffled = [...newWords].sort(() => Math.random() - 0.5);
    const needed = POOL_SIZE - currentWords.length;

    if (needed > 0 && shuffled.length > 0) {
      const toAdd = shuffled.slice(0, Math.min(needed, shuffled.length));
      return [...currentWords, ...toAdd];
    }

    return currentWords;
  };

  const paginate = async (newDirection: number) => {
    if (words.length === 0) {
      return;
    }

    if (!currentWord) {
      return;
    }

    setIsSaving(false);
    setIsCompleting(false);

    const isCurrentlySaved = savedWordIds.includes(currentWord.id);
    const isCurrentlyCompleted = completedWordIds.includes(currentWord.id);

    if (isCurrentlyCompleted && user && activePlan) {
      const completedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', currentWord.id);
      setDoc(completedWordRef, {
        wordId: currentWord.id,
        planId: activePlan.id,
        sourceText: currentWord.sourceText || currentWord.english || '',
        targetText: currentWord.targetText || currentWord.turkish || '',
        sourceLanguage: activePlan.sourceLanguage,
        targetLanguage: activePlan.targetLanguage,
        english: currentWord.english || currentWord.sourceText,
        turkish: currentWord.turkish || currentWord.targetText,
        completedAt: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } else if (isCurrentlySaved && user && activePlan) {
      const savedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', currentWord.id);
      const wordData: any = {
        wordId: currentWord.id,
        planId: activePlan.id,
        sourceText: currentWord.sourceText || currentWord.english || '',
        targetText: currentWord.targetText || currentWord.turkish || '',
        sourceLanguage: activePlan.sourceLanguage,
        targetLanguage: activePlan.targetLanguage,
        example: currentWord.example || '',
        type: currentWord.type || 'noun',
        level: currentWord.level || 1,
        savedAt: serverTimestamp(),
        english: currentWord.english || currentWord.sourceText,
        turkish: currentWord.turkish || currentWord.targetText,
      };
      if (currentWord.pronunciation) {
        wordData.pronunciation = currentWord.pronunciation;
      }
      setDoc(savedWordRef, wordData, { merge: true }).catch(() => {});
    }

    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = words.length - 1;
    if (nextIndex >= words.length) nextIndex = 0;

    if (isCurrentlyCompleted) {
      const filteredWords = words.filter(w => w.id !== currentWord.id);

      const adjustedIndex = filteredWords.length > 0
        ? Math.max(0, Math.min(nextIndex > currentIndex ? nextIndex - 1 : nextIndex, filteredWords.length - 1))
        : 0;

      setWords(filteredWords);
      setCurrentIndex(adjustedIndex);

      if (!isReviewMode && filteredWords.length < 15) {
        const allCompletedIds = [...completedWordIds, currentWord.id];
        const refilledWords = refillPool(filteredWords, allCompletedIds);
        if (refilledWords.length > filteredWords.length) {
          setWords(refilledWords);
        }
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const toggleSaveWord = async () => {
    if (!user || !currentWord || !activePlan || isSaving || isCompleting) {
      return;
    }

    const word = currentWord;
    const isCurrentlySaved = savedWordIds.includes(word.id);

    const wordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', word.id);
    const completedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', word.id);

    setIsSaving(true);

    const resetLoading = () => {
      setIsSaving(false);
    };

    try {
      if (isCurrentlySaved) {
        setSavedWordIds(prev => prev.filter(id => id !== word.id));

        removeWordFromDashboardCache(activePlan.id, word.id);

        resetLoading();

        deleteDoc(wordRef).catch(() => {
          setSavedWordIds(prev => {
            if (!prev.includes(word.id)) {
              return [...prev, word.id];
            }
            return prev;
          });
        });
      } else {
        setSavedWordIds(prev => {
          if (!Array.isArray(prev)) {
            return [word.id];
          }

          if (prev.includes(word.id)) {
            return prev;
          }

          return [...prev, word.id];
        });

        addWordToDashboardCache(activePlan.id, word, activePlan);

        if (completedWordIds.includes(word.id)) {
          setCompletedWordIds(prev => prev.filter(id => id !== word.id));
          deleteDoc(completedWordRef).catch(() => {});
        }

        const wordData: any = {
          wordId: word.id,
          planId: activePlan.id,
          sourceText: word.sourceText || word.english || '',
          targetText: word.targetText || word.turkish || '',
          sourceLanguage: activePlan.sourceLanguage,
          targetLanguage: activePlan.targetLanguage,
          example: word.example || '',
          type: word.type || 'noun',
          level: word.level || 1,
          savedAt: serverTimestamp(),
          english: word.english || word.sourceText,
          turkish: word.turkish || word.targetText,
        };

        if (word.pronunciation) {
          wordData.pronunciation = word.pronunciation;
        }

        resetLoading();

        setDoc(wordRef, wordData)
          .catch(() => {
            setSavedWordIds(prev => prev.filter(id => id !== word.id));
          });
      }
    } catch {
      resetLoading();
    }
  };

  const toggleCompleteWord = async () => {
    if (!user || !currentWord || !activePlan || words.length === 0 || isSaving || isCompleting) {
      return;
    }

    const word = currentWord;
    const isCurrentlyCompleted = completedWordIds.includes(word.id);

    const wordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', word.id);
    const savedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', word.id);

    setIsCompleting(true);

    const resetLoading = () => {
      setIsCompleting(false);
    };

    try {
      if (isCurrentlyCompleted) {
        setCompletedWordIds(prev => prev.filter(id => id !== word.id));

        resetLoading();

        setWords(prev => {
          const isInPool = prev.some(w => w.id === word.id);
          if (!isInPool) {
            return [...prev, word];
          }
          return prev;
        });

        deleteDoc(wordRef).catch(() => {
          setCompletedWordIds(prev => {
            if (!prev.includes(word.id)) {
              return [...prev, word.id];
            }
            return prev;
          });
        });
      } else {
        const newCompletedIds = [...completedWordIds, word.id];
        setCompletedWordIds(newCompletedIds);

        if (activePlan) {
          updatePlanProgress(activePlan.id, { wordsLearned: newCompletedIds.length });
        }

        if (savedWordIds.includes(word.id)) {
          setSavedWordIds(prev => prev.filter(id => id !== word.id));
          removeWordFromDashboardCache(activePlan.id, word.id);
          deleteDoc(savedWordRef).catch(() => {});
        }

        const completedData = {
          wordId: word.id,
          planId: activePlan.id,
          sourceText: word.sourceText || word.english || '',
          targetText: word.targetText || word.turkish || '',
          sourceLanguage: activePlan.sourceLanguage,
          targetLanguage: activePlan.targetLanguage,
          completedAt: serverTimestamp(),
          english: word.english || word.sourceText,
          turkish: word.turkish || word.targetText,
        };
        resetLoading();

        setDoc(wordRef, completedData)
          .catch(() => {
            setCompletedWordIds(prev => prev.filter(id => id !== word.id));
          });
      }
    } catch {
      resetLoading();
    }
  };

  const validIndex = words.length > 0
    ? Math.max(0, Math.min(currentIndex, words.length - 1))
    : 0;
  const currentWord = words.length > 0 && validIndex >= 0 && validIndex < words.length
    ? words[validIndex]
    : null;

  useEffect(() => {
    if (words.length > 0 && (currentIndex < 0 || currentIndex >= words.length)) {
      const newIndex = Math.max(0, Math.min(currentIndex, words.length - 1));
      setCurrentIndex(newIndex);
    }
  }, [words.length, currentIndex]);

  const isSaved = currentWord ? savedWordIds.includes(currentWord.id) : false;
  const isCompleted = currentWord ? completedWordIds.includes(currentWord.id) : false;

  const savedCount = savedWordIds.length;
  const completedCount = completedWordIds.length;

  useEffect(() => {
    if (activePlan && savedWordIds.length >= 0) {
      const cacheKey = `${CACHE_KEY_SAVED}_${activePlan.id}`;
      setCachedWordIds(cacheKey, savedWordIds);
    }
  }, [savedWordIds, activePlan?.id]);

  useEffect(() => {
    if (activePlan && completedWordIds.length >= 0) {
      const cacheKey = `${CACHE_KEY_COMPLETED}_${activePlan.id}`;
      setCachedWordIds(cacheKey, completedWordIds);
    }
  }, [completedWordIds, activePlan?.id]);

  useEffect(() => {
    if (words.length > 0 && currentIndex >= words.length) {
      setCurrentIndex(Math.max(0, words.length - 1));
    }
  }, [words.length, currentIndex]);

  if (isLoading || words.length === 0) {
    if (!isLoading && words.length === 0 && completedWordIds.length > 0 && !isReviewMode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
                    <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">All Words Completed!</h2>
            <p className="text-slate-400 mb-6">You've completed all available words. Great job!</p>
            <Link to="/dashboard">
              <GlassButton>
                View Saved Words
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      );
    }

    if (!isLoading && words.length === 0 && isReviewMode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
                    <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center flex flex-col items-center"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Review Complete!</h2>
            <p className="text-slate-400 mb-6">You've reviewed all your saved words.</p>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-all"
              >
                Back to Saved Words
              </motion.button>
            </Link>
          </motion.div>
        </div>
      );
    }

    if (!isLoading && words.length === 0 && completedWordIds.length === 0 && !isReviewMode) {
      const sourceLang = activePlan ? getLanguageByCode(activePlan.sourceLanguage) : null;
      const targetLang = activePlan ? getLanguageByCode(activePlan.targetLanguage) : null;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
                    <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <Database className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">No Words Available</h2>
            {activePlan && sourceLang && targetLang ? (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">{sourceLang.flag}</span>
                  <span className="text-slate-500">-</span>
                  <span className="text-3xl">{targetLang.flag}</span>
                </div>
                <p className="text-slate-400">
                  Currently, only <span className="text-neon-cyan">English - Turkish</span> vocabulary is available.
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Create a new plan with English - Turkish to start learning.
                </p>
              </div>
            ) : (
              <p className="text-slate-400 mb-6">Please select a learning plan first.</p>
            )}
            <Link to="/plans">
              <GlassButton>
                {activePlan ? 'Change Plan' : 'Select Plan'}
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center text-white">
                <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-72 h-96 mx-auto mb-8 rounded-3xl border backdrop-blur-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
              borderColor: 'rgba(0, 243, 255, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 243, 255, 0.1)',
            }}
            animate={{
              scale: [1, 1.015, 1],
              borderColor: ['rgba(0, 243, 255, 0.2)', 'rgba(0, 243, 255, 0.35)', 'rgba(0, 243, 255, 0.2)'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.p
            className="text-slate-400 text-sm"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Preparing your cards...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 relative">
        <div className="absolute top-24 left-0 w-full flex justify-center z-10">
          <motion.div
            className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan" />
              <span className="text-sm text-slate-300 font-medium">{completedCount} learned</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-neon-pink" />
              <span className="text-sm text-slate-300 font-medium">{savedCount} saved</span>
            </Link>
          </motion.div>
        </div>

        <div
          className="w-full max-w-md h-[min(450px,60vh)] min-h-[300px] relative flex items-center justify-center"
          style={{ position: 'relative', zIndex: 10 }}
        >
          {currentWord && (
            <Card
              key={currentWord.id}
              word={currentWord}
              isSaved={isSaved}
              isCompleted={isCompleted}
            />
          )}
        </div>

        <motion.div
          className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
              <motion.button
                onClick={() => words.length > 0 && paginate(-1)}
                disabled={words.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 flex flex-col items-center gap-1 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
              >
                <ArrowLeft size={18} />
                <span className="text-[9px] font-medium uppercase tracking-wider">Skip</span>
              </motion.button>

              <motion.button
                onClick={() => toggleSaveWord()}
                disabled={isSaving || isCompleting || !currentWord}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-16 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                  isSaved
                    ? 'text-neon-pink bg-neon-pink/10'
                    : 'text-slate-500 hover:text-neon-pink hover:bg-neon-pink/5'
                }`}
              >
                <motion.div
                  animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </motion.div>
                <span className="text-[9px] font-medium uppercase tracking-wider">Save</span>
              </motion.button>

              <motion.button
                onClick={() => {
                  if (!isCompleted) {
                    toggleCompleteWord();
                  }
                }}
                disabled={isSaving || isCompleting || !currentWord}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-20 flex flex-col items-center gap-1 py-2.5 mx-1 rounded-xl transition-all ${
                  isCompleted
                    ? 'text-green-400 bg-green-500/15'
                    : 'text-white bg-white/10 hover:bg-green-500/10 hover:text-green-400'
                }`}
              >
                <motion.div
                  animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle size={20} strokeWidth={isCompleted ? 2.5 : 1.5} />
                </motion.div>
                <span className="text-[9px] font-medium uppercase tracking-wider">
                  {isCompleted ? 'Known' : 'Know it'}
                </span>
              </motion.button>

              <motion.button
                onClick={() => words.length > 0 && paginate(1)}
                disabled={words.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 flex flex-col items-center gap-1 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
              >
                <ArrowRight size={18} />
                <span className="text-[9px] font-medium uppercase tracking-wider">Next</span>
              </motion.button>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};
