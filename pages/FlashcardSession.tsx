import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWordPool, getAllAvailableWords } from '../services/data';
import { getLanguageByCode } from '../services/languages';
import { useLocalFirst } from '../context/LocalFirstContext';
import { LocalStorage } from '../services/localStorage';
// Firebase imports kept for now - will use local storage as primary
import { db } from '../services/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, serverTimestamp } from 'firebase/firestore';
import { Background } from '../components/Layout/Background';
import { Navbar } from '../components/Layout/Navbar';
import { Card } from '../components/Flashcard/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { Word } from '../types';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, BookmarkCheck, CheckCircle, X, Database, Cloud, Sparkles, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const POOL_SIZE = 100;

// DEVICE-SPECIFIC USER ID - Each device gets unique ID to prevent data mixing
// This replaces the old 'local_user' which caused all guests to share the same Firebase path
const getLocalUser = () => ({ uid: LocalStorage.getDeviceId() });

// Cache configuration
const CACHE_KEY_SAVED = 'futurelex_saved_words_cache';
const CACHE_KEY_COMPLETED = 'futurelex_completed_words_cache';
const CACHE_KEY_DASHBOARD = 'futurelex_dashboard_words_cache'; // Same key as Dashboard.tsx
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache utility functions
function getCachedWordIds(key: string): { ids: string[], timestamp: number } | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return { ids: parsed.ids || [], timestamp: parsed.timestamp || 0 };
  } catch (err) {
    console.error(`[CACHE] Error reading cache for ${key}:`, err);
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
  } catch (err) {
    console.error(`[CACHE] Error writing cache for ${key}:`, err);
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Dashboard cache functions (stores full word objects, same format as Dashboard.tsx)
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
  } catch (err) {
    console.error('[CACHE] Error reading dashboard cache:', err);
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
    console.log('[CACHE] Dashboard cache updated:', { planId, count: words.length });
  } catch (err) {
    console.error('[CACHE] Error writing dashboard cache:', err);
  }
}

function addWordToDashboardCache(planId: string, word: Word, activePlan: any): void {
  const cached = getDashboardCache(planId);
  const existingWords = cached?.words || [];

  // Check if word already exists
  const exists = existingWords.some(w => w.id === word.id || w.wordId === word.id);
  if (exists) {
    console.log('[CACHE] Word already in dashboard cache:', word.id);
    return;
  }

  // Create dashboard word object
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

  // LOCAL FIRST - Get activePlan first so we can initialize state from cache
  const { activePlan, updatePlanProgress } = useLocalFirst();
  // DEVICE-SPECIFIC: Each device gets unique user ID (prevents data mixing between guests)
  const user = useMemo(() => getLocalUser(), []);

  // CRITICAL FIX: Initialize state from cache to prevent data loss on refresh
  // This ensures saved/completed words are immediately available without waiting for Firebase
  const [savedWordIds, setSavedWordIds] = useState<string[]>(() => {
    if (!activePlan) return [];
    const cached = getCachedWordIds(`${CACHE_KEY_SAVED}_${activePlan.id}`);
    console.log('[INIT] Loaded savedWordIds from cache:', cached?.ids?.length || 0);
    return cached?.ids || [];
  });

  const [completedWordIds, setCompletedWordIds] = useState<string[]>(() => {
    if (!activePlan) return [];
    const cached = getCachedWordIds(`${CACHE_KEY_COMPLETED}_${activePlan.id}`);
    console.log('[INIT] Loaded completedWordIds from cache:', cached?.ids?.length || 0);
    return cached?.ids || [];
  });

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'init' | 'cache' | 'firebase' | 'pool' | 'done'>('init');

  // CRITICAL: Reload from cache when activePlan changes (useState initializer only runs once)
  useEffect(() => {
    if (!activePlan) return;

    const cachedSaved = getCachedWordIds(`${CACHE_KEY_SAVED}_${activePlan.id}`);
    const cachedCompleted = getCachedWordIds(`${CACHE_KEY_COMPLETED}_${activePlan.id}`);

    if (cachedSaved?.ids) {
      setSavedWordIds(cachedSaved.ids);
      console.log('[PLAN_CHANGE] Reloaded savedWordIds from cache:', cachedSaved.ids.length);
    }
    if (cachedCompleted?.ids) {
      setCompletedWordIds(cachedCompleted.ids);
      console.log('[PLAN_CHANGE] Reloaded completedWordIds from cache:', cachedCompleted.ids.length);
    }
  }, [activePlan?.id]);

  // Fetch saved and completed words, and initialize word pool
  useEffect(() => {
    if (!user || !activePlan) {
      setIsLoading(false);
      return;
    }

    const fetchUserWords = async () => {
      setLoadingStage('init');
      try {
        // In review mode, load words from sessionStorage first
        if (isReviewMode) {
          const reviewWordsStr = sessionStorage.getItem('reviewWords');
          if (reviewWordsStr) {
            try {
              const reviewWords: Word[] = JSON.parse(reviewWordsStr);
              if (reviewWords.length > 0) {
                setWords(reviewWords);
                setIsLoading(false);
                // Clear sessionStorage after loading
                sessionStorage.removeItem('reviewWords');
                return; // Early return for review mode
              }
            } catch (err) {
              console.error("Error parsing review words", err);
            }
          }
          // If no review words, fall through to normal loading
        }

        // PROGRESSIVE LOADING: Load from cache first for instant display (plan-specific)
        setLoadingStage('cache');
        const planCacheKeySaved = `${CACHE_KEY_SAVED}_${activePlan.id}`;
        const planCacheKeyCompleted = `${CACHE_KEY_COMPLETED}_${activePlan.id}`;
        const cachedSaved = getCachedWordIds(planCacheKeySaved);
        const cachedCompleted = getCachedWordIds(planCacheKeyCompleted);
        
        let savedIds: string[] = [];
        let completedIds: string[] = [];
        let useCache = false;

        // Use cache if valid
        if (cachedSaved && isCacheValid(cachedSaved.timestamp)) {
          savedIds = cachedSaved.ids;
          useCache = true;
          console.log("[CACHE] Using cached saved words:", { count: savedIds.length });
        }
        if (cachedCompleted && isCacheValid(cachedCompleted.timestamp)) {
          completedIds = cachedCompleted.ids;
          useCache = true;
          console.log("[CACHE] Using cached completed words:", { count: completedIds.length });
        }

        // Set cached data immediately for progressive loading
        if (useCache) {
          setSavedWordIds(savedIds);
          setCompletedWordIds(completedIds);
          
          // Load word pool immediately with cached data (plan-specific)
          if (!isReviewMode) {
            const completedIdsSet = new Set(completedIds);
            const pool = getWordPool(
              activePlan.sourceLanguage,
              activePlan.targetLanguage,
              completedIdsSet,
              POOL_SIZE
            );
            setWords(pool);
            setIsLoading(false); // Show words immediately
          }
        }

        // Fetch from Firebase in background (always fetch to keep cache fresh)
        // Plan-specific collections
        setLoadingStage('firebase');
        try {
          const [savedSnapshot, completedSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words'))),
            getDocs(query(collection(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words')))
          ]);

          // Optimization: Process only wordId field from documents (ignore other fields like timestamps)
          // This reduces memory usage and processing time
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

          console.log("[FETCH] Loaded saved words from Firebase:", { count: freshSavedIds.length });
          console.log("[FETCH] Loaded completed words from Firebase:", { count: freshCompletedIds.length });

          // Update cache (plan-specific)
          setCachedWordIds(planCacheKeySaved, freshSavedIds);
          setCachedWordIds(planCacheKeyCompleted, freshCompletedIds);

          // Update state with fresh data (may differ from cache)
          setSavedWordIds(freshSavedIds);
          setCompletedWordIds(freshCompletedIds);

          // If we used cache, update word pool with fresh completed IDs (plan-specific)
          setLoadingStage('pool');
          if (useCache && !isReviewMode) {
            const freshCompletedIdsSet = new Set(freshCompletedIds);
            const pool = getWordPool(
              activePlan.sourceLanguage,
              activePlan.targetLanguage,
              freshCompletedIdsSet,
              POOL_SIZE
            );
            setWords(pool);
          } else if (!isReviewMode) {
            // If no cache was used, set words now (plan-specific)
            const completedIdsSet = new Set(freshCompletedIds);
            const pool = getWordPool(
              activePlan.sourceLanguage,
              activePlan.targetLanguage,
              completedIdsSet,
              POOL_SIZE
            );
            setWords(pool);
            setLoadingStage('done');
            setIsLoading(false);
          } else {
            // Review mode: if no review words loaded, load normal pool as fallback (plan-specific)
            if (words.length === 0) {
              const completedIdsSet = new Set(freshCompletedIds);
              const pool = getWordPool(
                activePlan.sourceLanguage,
                activePlan.targetLanguage,
                completedIdsSet,
                POOL_SIZE
              );
              setWords(pool);
            }
            setLoadingStage('done');
            setIsLoading(false);
          }
        } catch (firebaseError) {
          console.error("Error fetching from Firebase:", firebaseError);
          // If cache was used, we already showed words, so just log error
          // If no cache, fall through to error handling below
          if (!useCache) {
            throw firebaseError;
          }
        }
      } catch (error) {
        console.error("Error fetching user words", error);
        // Fallback: load words even if fetch fails (plan-specific)
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
  }, [user, activePlan, isReviewMode]);

  // Refill pool when it gets low (plan-specific)
  const refillPool = (currentWords: Word[], completedIds: string[]) => {
    if (!activePlan) return currentWords;
    
    // Convert Array to Set for getAllAvailableWords (it expects Set)
    const completedIdsSet = new Set(completedIds);
    const currentWordIds = new Set(currentWords.map(w => w.id));
    const availableWords = getAllAvailableWords(
      activePlan.sourceLanguage,
      activePlan.targetLanguage,
      completedIdsSet
    );
    
    // Get words not in current pool and not completed
    const newWords = availableWords.filter(w => !currentWordIds.has(w.id));
    
    // Shuffle and add to pool
    const shuffled = [...newWords].sort(() => Math.random() - 0.5);
    const needed = POOL_SIZE - currentWords.length;
    
    if (needed > 0 && shuffled.length > 0) {
      const toAdd = shuffled.slice(0, Math.min(needed, shuffled.length));
      return [...currentWords, ...toAdd];
    }
    
    return currentWords;
  };

  const paginate = async (newDirection: number) => {
    console.log("[PAGINATE] ===== FUNCTION CALLED =====", { 
      direction: newDirection, 
      wordsLength: words.length, 
      currentIndex,
      currentWordId: currentWord?.id 
    });
    
    if (words.length === 0) {
      console.log("[PAGINATE] Blocked: words.length is 0");
      return;
    }
    
    if (!currentWord) {
      console.log("[PAGINATE] Blocked: no currentWord");
      return;
    }
    
    // Reset any stuck loading states first
    setIsSaving(false);
    setIsCompleting(false);
    
    // Save current word's state if it's saved or completed (async, don't block)
    const isCurrentlySaved = savedWordIds.includes(currentWord.id);
    const isCurrentlyCompleted = completedWordIds.includes(currentWord.id);
    
    console.log("[PAGINATE] Current word state:", {
      wordId: currentWord.id,
      isCurrentlySaved,
      isCurrentlyCompleted,
      savedSize: savedWordIds.length,
      completedSize: completedWordIds.length
    });
    
    // Save to Firestore in background (don't await) - plan-specific
    if (isCurrentlyCompleted && user && activePlan) {
      const completedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', currentWord.id);
      setDoc(completedWordRef, {
        wordId: currentWord.id,
        planId: activePlan.id,
        sourceText: currentWord.sourceText || currentWord.english || '',
        targetText: currentWord.targetText || currentWord.turkish || '',
        sourceLanguage: activePlan.sourceLanguage,
        targetLanguage: activePlan.targetLanguage,
        // Legacy fields for backward compatibility
        english: currentWord.english || currentWord.sourceText,
        turkish: currentWord.turkish || currentWord.targetText,
        completedAt: serverTimestamp()
      }, { merge: true }).catch(err => {
        console.error("[PAGINATE] Error saving completed word:", err);
      });
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
        // Legacy fields for backward compatibility
        english: currentWord.english || currentWord.sourceText,
        turkish: currentWord.turkish || currentWord.targetText,
      };
      if (currentWord.pronunciation) {
        wordData.pronunciation = currentWord.pronunciation;
      }
      setDoc(savedWordRef, wordData, { merge: true }).catch(err => {
        console.error("[PAGINATE] Error saving saved word:", err);
      });
    }
    
    // Calculate next index
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = words.length - 1;
    if (nextIndex >= words.length) nextIndex = 0;
    
    console.log("[PAGINATE] Calculated nextIndex:", { 
      currentIndex, 
      newDirection, 
      nextIndex,
      nextWordId: words[nextIndex]?.id 
    });
    
    // Remove completed word from pool if needed, then update index
    if (isCurrentlyCompleted) {
      setWords(prevWords => {
        const filteredWords = prevWords.filter(w => w.id !== currentWord.id);
        console.log("[PAGINATE] Filtered words:", {
          prevLength: prevWords.length,
          newLength: filteredWords.length,
          removedWordId: currentWord.id
        });
        
        // Adjust nextIndex for filtered array
        const adjustedIndex = filteredWords.length > 0 
          ? Math.max(0, Math.min(nextIndex, filteredWords.length - 1))
          : 0;
        
        // Update index after words are filtered
        setTimeout(() => {
          setDirection(newDirection);
          setCurrentIndex(adjustedIndex);
          console.log("[PAGINATE] Index updated after filtering:", {
            adjustedIndex,
            nextWordId: filteredWords[adjustedIndex]?.id
          });
        }, 0);
        
        // Refill pool asynchronously when it drops below half (only if not in review mode)
        if (!isReviewMode && filteredWords.length < 50) {
          // CRITICAL: Capture completedWordIds at the time of setTimeout to avoid closure issues
          const currentCompletedIds = [...completedWordIds]; // Create a copy
          setTimeout(() => {
            setWords(prevWords2 => {
              console.log("[PAGINATE] Refilling pool with completedIds:", currentCompletedIds);
              const refilledWords = refillPool(prevWords2, currentCompletedIds);
              console.log("[PAGINATE] Pool refilled:", {
                prevLength: prevWords2.length,
                newLength: refilledWords.length,
                completedIdsLength: currentCompletedIds.length
              });
              return refilledWords;
            });
          }, 100);
        }
        
        return filteredWords;
      });
    } else {
      // Normal navigation - just update index and direction
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
      console.log("[PAGINATE] Normal navigation, index updated:", {
        nextIndex,
        nextWordId: words[nextIndex]?.id,
        nextWordEnglish: words[nextIndex]?.english
      });
    }
  };

  const toggleSaveWord = async () => {
    console.log("[TOGGLE SAVE] ===== FUNCTION CALLED =====");
    console.log("[TOGGLE SAVE] Pre-check:", { user: !!user, currentWord: !!currentWord, activePlan: !!activePlan, isSaving, isCompleting });
    console.log("[TOGGLE SAVE] savedWordIds state:", savedWordIds);
    console.log("[TOGGLE SAVE] completedWordIds state:", completedWordIds);
    
    if (!user || !currentWord || !activePlan || isSaving || isCompleting) {
      console.log("[TOGGLE SAVE] Blocked:", { user: !!user, currentWord: !!currentWord, activePlan: !!activePlan, isSaving, isCompleting });
      return;
    }
    
    console.log("[TOGGLE SAVE] Pre-check passed, continuing...");
    
    const word = currentWord;
    const isCurrentlySaved = savedWordIds.includes(word.id);
    console.log("[TOGGLE SAVE] Start:", { wordId: word.id, isCurrentlySaved, savedSize: savedWordIds.length, completedSize: completedWordIds.length });
    
    // Plan-specific collection paths
    const wordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', word.id);
    const completedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', word.id);
    
    console.log("[TOGGLE SAVE] About to set isSaving to true");
    setIsSaving(true);
    console.log("[TOGGLE SAVE] isSaving set to true");
    
    // Reset loading state - call immediately after state update, not after Firestore
    // This allows user to click again quickly
    const resetLoading = () => {
      console.log("[TOGGLE SAVE] Resetting isSaving to false");
      setIsSaving(false);
      console.log("[TOGGLE SAVE] isSaving reset complete");
    };
    
    console.log("[TOGGLE SAVE] Entering try block, isCurrentlySaved:", isCurrentlySaved);
    try {
      if (isCurrentlySaved) {
        // Remove from saved (toggle off)
        console.log("[TOGGLE SAVE] BRANCH: Removing from saved");
        console.log("[TOGGLE SAVE] Current savedWordIds before remove:", savedWordIds);
        // Update state first
        setSavedWordIds(prev => {
          console.log("[TOGGLE SAVE] ===== INSIDE setSavedWordIds callback (REMOVE) =====");
          console.log("[TOGGLE SAVE] prev array:", prev);
          console.log("[TOGGLE SAVE] word.id to remove:", word.id);
          const newArray = prev.filter(id => id !== word.id);
          console.log("[TOGGLE SAVE] ===== State updated - removed =====");
          console.log("[TOGGLE SAVE] prevSize:", prev.length, "newSize:", newArray.length);
          console.log("[TOGGLE SAVE] prevArray:", prev);
          console.log("[TOGGLE SAVE] newArray:", newArray);
          console.log("[TOGGLE SAVE] ===== END State update (REMOVE) =====");
          return newArray;
        });

        // CRITICAL: Also remove from Dashboard cache (sync immediately)
        removeWordFromDashboardCache(activePlan.id, word.id);

        // Reset loading immediately after state update (optimistic UI)
        resetLoading();
        
        // Firestore delete (async, don't await)
        deleteDoc(wordRef).then(() => {
          console.log("[TOGGLE SAVE] Firestore deleteDoc successful");
        }).catch(err => {
          console.error("[TOGGLE SAVE] Firestore deleteDoc failed:", err);
          // Rollback state on error
          setSavedWordIds(prev => {
            if (!prev.includes(word.id)) {
              return [...prev, word.id];
            }
            console.log("[TOGGLE SAVE] State rolled back due to Firestore error");
            return prev;
          });
        });
      } else {
        // Update state FIRST (optimistic update) - this ensures UI updates immediately
        console.log("[TOGGLE SAVE] BRANCH: Adding to saved (ELSE BLOCK)");
        console.log("[TOGGLE SAVE] Updating state FIRST (optimistic), current savedWordIds:", savedWordIds);
        console.log("[TOGGLE SAVE] About to call setSavedWordIds with word.id:", word.id);
        
        // CRITICAL: Force state update by creating completely new Array
        console.log("[TOGGLE SAVE] BEFORE setSavedWordIds, current savedWordIds:", savedWordIds, "word.id:", word.id);
        console.log("[TOGGLE SAVE] Checking if word.id is already in savedWordIds:", savedWordIds.includes(word.id));
        
        // CRITICAL: Use functional update to ensure we get the latest state
        // React state updates are batched, so we must use functional updates
        console.log("[TOGGLE SAVE] About to call setSavedWordIds with functional update...");
        console.log("[TOGGLE SAVE] Current savedWordIds before setSavedWordIds:", savedWordIds);
        console.log("[TOGGLE SAVE] Word.id to add:", word.id);
        
        // Use functional update - this ensures we get the latest state
        setSavedWordIds(prev => {
          console.log("[TOGGLE SAVE] ===== INSIDE setSavedWordIds callback =====");
          console.log("[TOGGLE SAVE] prev array received:", prev);
          console.log("[TOGGLE SAVE] prev array type:", typeof prev, Array.isArray(prev));
          console.log("[TOGGLE SAVE] prev array length:", prev?.length);
          console.log("[TOGGLE SAVE] word.id to add:", word.id);

          if (!Array.isArray(prev)) {
            console.error("[TOGGLE SAVE] ERROR: prev is not an array!", prev);
            return [word.id]; // Fallback
          }

          const alreadyIncluded = prev.includes(word.id);
          console.log("[TOGGLE SAVE] Word already in saved?", alreadyIncluded);

          if (alreadyIncluded) {
            console.log("[TOGGLE SAVE] Word already in saved - returning same array");
            return prev;
          }

          const newArray = [...prev, word.id];
          console.log("[TOGGLE SAVE] ===== State updated - added (optimistic) =====");
          console.log("[TOGGLE SAVE] prevSize:", prev.length, "newSize:", newArray.length);
          console.log("[TOGGLE SAVE] prevArray:", JSON.stringify(prev));
          console.log("[TOGGLE SAVE] newArray:", JSON.stringify(newArray));
          console.log("[TOGGLE SAVE] ===== END State update =====");
          return newArray;
        });

        // CRITICAL: Also add to Dashboard cache (sync immediately with full word data)
        addWordToDashboardCache(activePlan.id, word, activePlan);

        console.log("[TOGGLE SAVE] setSavedWordIds called, should trigger re-render");
        
        // If word is completed, remove it from completed first (mutual exclusivity)
        if (completedWordIds.includes(word.id)) {
          console.log("[TOGGLE SAVE] Removing from completed (mutual exclusivity)");
          setCompletedWordIds(prev => {
            const newArray = prev.filter(id => id !== word.id);
            console.log("[TOGGLE SAVE] Completed state updated - removed:", { newSize: newArray.length, prevSize: prev.length });
            return newArray;
          });
          // Firestore delete (async, don't await - fire and forget)
          deleteDoc(completedWordRef).catch(err => {
            console.error("[TOGGLE SAVE] Failed to delete from completed in Firestore:", err);
          });
        }
        
        // Add to saved - plan-specific with new structure
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
          // Legacy fields for backward compatibility
          english: word.english || word.sourceText,
          turkish: word.turkish || word.targetText,
        };
        
        // Only add pronunciation if it's defined
        if (word.pronunciation) {
          wordData.pronunciation = word.pronunciation;
        }
        
        // Reset loading immediately after state update (optimistic UI)
        resetLoading();
        
        console.log("[TOGGLE SAVE] Saving to Firestore, wordData:", wordData);
        // Firestore save (async, don't await - fire and forget for better UX)
        setDoc(wordRef, wordData)
          .then(() => {
            console.log("[TOGGLE SAVE] Firestore setDoc successful");
          })
          .catch(firestoreError => {
            console.error("[TOGGLE SAVE] Firestore setDoc failed:", firestoreError);
            // Rollback state on error
            setSavedWordIds(prev => {
              const newArray = prev.filter(id => id !== word.id);
              console.log("[TOGGLE SAVE] State rolled back due to Firestore error");
              return newArray;
            });
          });
      }
    } catch (error) {
      console.error("[TOGGLE SAVE] Error:", error);
      console.error("[TOGGLE SAVE] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      resetLoading();
    }
  };

  const toggleCompleteWord = async () => {
    if (!user || !currentWord || !activePlan || words.length === 0 || isSaving || isCompleting) {
      console.log("[TOGGLE COMPLETE] Blocked:", { user: !!user, currentWord: !!currentWord, activePlan: !!activePlan, wordsLength: words.length, isSaving, isCompleting });
      return;
    }
    
    const word = currentWord;
    const isCurrentlyCompleted = completedWordIds.includes(word.id);
    console.log("[TOGGLE COMPLETE] Start:", { wordId: word.id, isCurrentlyCompleted, savedSize: savedWordIds.length, completedSize: completedWordIds.length });
    
    // Plan-specific collection paths
    const wordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'completed_words', word.id);
    const savedWordRef = doc(db, 'users', user.uid, 'plans', activePlan.id, 'saved_words', word.id);
    
    setIsCompleting(true);
    
    // Reset loading state - call immediately after state update, not after Firestore
    // This allows user to click again quickly
    const resetLoading = () => {
      console.log("[TOGGLE COMPLETE] Resetting isCompleting to false");
      setIsCompleting(false);
      console.log("[TOGGLE COMPLETE] isCompleting reset complete");
    };
    
    try {
      if (isCurrentlyCompleted) {
        console.log("[TOGGLE COMPLETE] Removing from completed");
        console.log("[TOGGLE COMPLETE] Current completedWordIds before remove:", completedWordIds);
        // Update state first
        setCompletedWordIds(prev => {
          console.log("[TOGGLE COMPLETE] ===== INSIDE setCompletedWordIds callback (REMOVE) =====");
          console.log("[TOGGLE COMPLETE] prev array:", prev);
          console.log("[TOGGLE COMPLETE] word.id to remove:", word.id);
          const newArray = prev.filter(id => id !== word.id);
          console.log("[TOGGLE COMPLETE] ===== State updated - removed =====");
          console.log("[TOGGLE COMPLETE] prevSize:", prev.length, "newSize:", newArray.length);
          console.log("[TOGGLE COMPLETE] prevArray:", prev);
          console.log("[TOGGLE COMPLETE] newArray:", newArray);
          console.log("[TOGGLE COMPLETE] ===== END State update (REMOVE) =====");
          return newArray;
        });
        
        // Reset loading immediately after state update (optimistic UI)
        resetLoading();
        
        // Add back to pool if not already there
        setWords(prev => {
          const isInPool = prev.some(w => w.id === word.id);
          if (!isInPool) {
            return [...prev, word];
          }
          return prev;
        });
        
        // Firestore delete (async, don't await)
        deleteDoc(wordRef).then(() => {
          console.log("[TOGGLE COMPLETE] Firestore deleteDoc successful");
        }).catch(err => {
          console.error("[TOGGLE COMPLETE] Firestore deleteDoc failed:", err);
          // Rollback state on error
          setCompletedWordIds(prev => {
            if (!prev.includes(word.id)) {
              return [...prev, word.id];
            }
            console.log("[TOGGLE COMPLETE] State rolled back due to Firestore error");
            return prev;
          });
        });
      } else {
        // Update state FIRST (optimistic update) - this ensures UI updates immediately
        console.log("[TOGGLE COMPLETE] Updating state FIRST (optimistic), current completedWordIds:", completedWordIds, "word.id:", word.id);
        setCompletedWordIds(prev => {
          console.log("[TOGGLE COMPLETE] INSIDE setCompletedWordIds callback, prev:", prev, "word.id:", word.id);
          const alreadyIncluded = prev.includes(word.id);
          console.log("[TOGGLE COMPLETE] Word already in completed?", alreadyIncluded);

          if (alreadyIncluded) {
            console.log("[TOGGLE COMPLETE] Word already in completed, but creating new array anyway for React");
            // CRITICAL: Always return a new array reference so React detects the change
            const newArray = [...prev];
            console.log("[TOGGLE COMPLETE] Returning new array (same content):", newArray);
            return newArray;
          }

          const newArray = [...prev, word.id];
          console.log("[TOGGLE COMPLETE] State updated - added (optimistic):", {
            newSize: newArray.length,
            wordId: word.id,
            prevSize: prev.length,
            prevArray: prev,
            newArrayContents: newArray
          });

          // Update plan progress with new count
          if (activePlan) {
            updatePlanProgress(activePlan.id, { wordsLearned: newArray.length });
          }

          return newArray;
        });
        
        // If word is saved, remove it from saved first (mutual exclusivity)
        if (savedWordIds.includes(word.id)) {
          console.log("[TOGGLE COMPLETE] Removing from saved (mutual exclusivity)");
          setSavedWordIds(prev => {
            const newArray = prev.filter(id => id !== word.id);
            console.log("[TOGGLE COMPLETE] Saved state updated - removed:", { newSize: newArray.length, prevSize: prev.length });
            return newArray;
          });
          // CRITICAL: Also remove from Dashboard cache (sync immediately)
          removeWordFromDashboardCache(activePlan.id, word.id);
          // Firestore delete (async, don't await - fire and forget)
          deleteDoc(savedWordRef).catch(err => {
            console.error("[TOGGLE COMPLETE] Failed to delete from saved in Firestore:", err);
          });
        }
        
        // Mark as completed - plan-specific with new structure
        const completedData = {
          wordId: word.id,
          planId: activePlan.id,
          sourceText: word.sourceText || word.english || '',
          targetText: word.targetText || word.turkish || '',
          sourceLanguage: activePlan.sourceLanguage,
          targetLanguage: activePlan.targetLanguage,
          completedAt: serverTimestamp(),
          // Legacy fields for backward compatibility
          english: word.english || word.sourceText,
          turkish: word.turkish || word.targetText,
        };
        // Reset loading immediately after state update (optimistic UI)
        resetLoading();
        
        console.log("[TOGGLE COMPLETE] Saving to Firestore, completedData:", completedData);
        // Firestore save (async, don't await - fire and forget for better UX)
        setDoc(wordRef, completedData)
          .then(() => {
            console.log("[TOGGLE COMPLETE] Firestore setDoc successful");
          })
          .catch(firestoreError => {
            console.error("[TOGGLE COMPLETE] Firestore setDoc failed:", firestoreError);
            // Rollback state on error
            setCompletedWordIds(prev => {
              const newArray = prev.filter(id => id !== word.id);
              console.log("[TOGGLE COMPLETE] State rolled back due to Firestore error");
              return newArray;
            });
          });
        
        // Don't remove from pool immediately - allow toggle until next/prev
        // The word will be removed when user navigates away via paginate()
      }
    } catch (error) {
      console.error("[TOGGLE COMPLETE] Error:", error);
      resetLoading();
    }
  };

  // Ensure currentIndex is valid - CRITICAL: Clamp index to valid range
  const validIndex = words.length > 0 
    ? Math.max(0, Math.min(currentIndex, words.length - 1)) 
    : 0;
  const currentWord = words.length > 0 && validIndex >= 0 && validIndex < words.length 
    ? words[validIndex] 
    : null;
  
  // Sync currentIndex if it's out of bounds (this ensures index is always valid)
  useEffect(() => {
    if (words.length > 0 && (currentIndex < 0 || currentIndex >= words.length)) {
      const newIndex = Math.max(0, Math.min(currentIndex, words.length - 1));
      console.log("[SYNC INDEX] Index out of bounds, correcting:", { 
        currentIndex, 
        wordsLength: words.length, 
        newIndex 
      });
      setCurrentIndex(newIndex);
    }
  }, [words.length, currentIndex]);
  
  // CRITICAL: Recalculate isSaved and isCompleted on every render with current word
  // Now using Array state, so React will detect changes properly
  // Create sorted string for key generation - use length and join for reliable comparison
  const savedWordIdsKey = `${savedWordIds.length}-${[...savedWordIds].sort().join(',')}`;
  const completedWordIdsKey = `${completedWordIds.length}-${[...completedWordIds].sort().join(',')}`;
  
  // CRITICAL: Calculate isSaved and isCompleted directly from arrays
  // Calculate on every render to ensure we always have the latest state
  const isSaved = currentWord ? savedWordIds.includes(currentWord.id) : false;
  const isCompleted = currentWord ? completedWordIds.includes(currentWord.id) : false;
  
  // Force log on every render to see state changes
  console.log("[CALC] isSaved/isCompleted calculated:", {
    currentWordId: currentWord?.id,
    isSaved,
    isCompleted,
    savedWordIds: [...savedWordIds],
    completedWordIds: [...completedWordIds],
    savedCount: savedWordIds.length,
    completedCount: completedWordIds.length,
    savedWordIdsKey,
    completedWordIdsKey
  });
  
  // Log for debugging
  useEffect(() => {
    if (currentWord) {
      console.log("[IS_SAVED] Recalculated:", { 
        wordId: currentWord.id, 
        isSaved, 
        savedWordIds: [...savedWordIds], 
        savedWordIdsKey,
        includes: savedWordIds.includes(currentWord.id)
      });
      console.log("[IS_COMPLETED] Recalculated:", { 
        wordId: currentWord.id, 
        isCompleted, 
        completedWordIds: [...completedWordIds], 
        completedWordIdsKey,
        includes: completedWordIds.includes(currentWord.id)
      });
    }
  }, [currentWord?.id, isSaved, isCompleted, savedWordIdsKey, completedWordIdsKey]);
  
  // Calculate counter values
  const savedCount = savedWordIds.length;
  const completedCount = completedWordIds.length;

  // CRITICAL: Sync state changes to localStorage cache
  // This ensures progress is persisted even when navigating away
  useEffect(() => {
    if (activePlan && savedWordIds.length >= 0) {
      const cacheKey = `${CACHE_KEY_SAVED}_${activePlan.id}`;
      setCachedWordIds(cacheKey, savedWordIds);
      console.log("[CACHE SYNC] Saved words cached:", savedWordIds.length);
    }
  }, [savedWordIds, activePlan?.id]);

  useEffect(() => {
    if (activePlan && completedWordIds.length >= 0) {
      const cacheKey = `${CACHE_KEY_COMPLETED}_${activePlan.id}`;
      setCachedWordIds(cacheKey, completedWordIds);
      console.log("[CACHE SYNC] Completed words cached:", completedWordIds.length);
    }
  }, [completedWordIds, activePlan?.id]);

  // Debug logging - log whenever currentWord or state changes
  useEffect(() => {
    if (currentWord) {
      const savedHasWord = savedWordIds.includes(currentWord.id);
      const completedHasWord = completedWordIds.includes(currentWord.id);
      console.log("[RENDER] State check:", {
        wordId: currentWord.id,
        english: currentWord.english,
        isSaved,
        isCompleted,
        savedHasWord,
        completedHasWord,
        savedSize: savedWordIds.length,
        completedSize: completedWordIds.length,
        currentIndex,
        wordsLength: words.length
      });
      
      // Also log in paginate format for consistency
      console.log("[PAGINATE] Current word state:", {
        wordId: currentWord.id,
        isCurrentlySaved: savedHasWord,
        isCurrentlyCompleted: completedHasWord,
        savedSize: savedWordIds.length,
        completedSize: completedWordIds.length
      });
    }
  }, [currentWord?.id, isSaved, isCompleted, savedWordIds.length, completedWordIds.length, currentIndex, words.length]);
  
  // Sync currentIndex if it's out of bounds
  useEffect(() => {
    if (words.length > 0 && currentIndex >= words.length) {
      setCurrentIndex(Math.max(0, words.length - 1));
    }
  }, [words.length, currentIndex]);

  // Show loading state while words are being loaded
  if (isLoading || (words.length === 0 && !isReviewMode)) {
    // Check if all words are completed (only if not in review mode and not currently loading)
    if (!isLoading && words.length === 0 && completedWordIds.length > 0 && !isReviewMode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Background />
          <Navbar />
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

    // No words available for this language pair
    if (!isLoading && words.length === 0 && completedWordIds.length === 0 && !isReviewMode) {
      const sourceLang = activePlan ? getLanguageByCode(activePlan.sourceLanguage) : null;
      const targetLang = activePlan ? getLanguageByCode(activePlan.targetLanguage) : null;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Background />
          <Navbar />
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
                  <span className="text-slate-500">→</span>
                  <span className="text-3xl">{targetLang.flag}</span>
                </div>
                <p className="text-slate-400">
                  Currently, only <span className="text-neon-cyan">English → Turkish</span> vocabulary is available.
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Create a new plan with English → Turkish to start learning.
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
    
    // GENTLE LOADING - Single breathing card, minimal and calm
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Background />
        <Navbar />
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Single Breathing Card */}
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
            {/* Subtle inner glow */}
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

          {/* Simple text */}
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
      <Background />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 relative">
        {/* Minimal Progress Bar */}
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
          className="w-full max-w-md h-[450px] relative flex items-center justify-center" 
          style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={{
                // GENTLE TRANSITIONS - softer, shorter, no rotation or blur
                enter: (direction: number) => ({
                  x: direction > 0 ? 200 : -200,
                  opacity: 0,
                  scale: 0.96,
                }),
                center: {
                  zIndex: 10,
                  x: 0,
                  opacity: 1,
                  scale: 1,
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 200 : -200,
                  opacity: 0,
                  scale: 0.96,
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.25, ease: "easeOut" },
                scale: { duration: 0.25, ease: "easeOut" }
              }}
              className="absolute w-full flex justify-center"
              style={{ position: 'absolute', zIndex: 10, pointerEvents: 'auto' }}
            >
              {currentWord && (
                <Card
                  key={`${currentWord.id}-${isSaved}-${isCompleted}`}
                  word={currentWord}
                  isSaved={isSaved}
                  isCompleted={isCompleted}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Control Bar - Fixed at bottom, centered */}
        <motion.div
          className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
              {/* Skip/Previous */}
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

              {/* Save for Later */}
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

              {/* Know It - Primary Action */}
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

              {/* Next */}
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
