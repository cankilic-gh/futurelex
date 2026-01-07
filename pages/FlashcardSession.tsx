import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWordPool, getAllAvailableWords } from '../services/data';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, serverTimestamp } from 'firebase/firestore';
import { Background } from '../components/Layout/Background';
import { Navbar } from '../components/Layout/Navbar';
import { Card } from '../components/Flashcard/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { Word } from '../types';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, BookmarkCheck, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const POOL_SIZE = 100;

export const FlashcardSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === 'true';
  const [words, setWords] = useState<Word[]>([]);
  // CRITICAL: Use Array instead of Set - React doesn't detect Set changes properly
  const [savedWordIds, setSavedWordIds] = useState<string[]>([]);
  const [completedWordIds, setCompletedWordIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch saved and completed words, and initialize word pool
  useEffect(() => {
    if (!user) return;

    const fetchUserWords = async () => {
      try {
        // In review mode, load words from sessionStorage first
        if (isReviewMode) {
          const reviewWordsStr = sessionStorage.getItem('reviewWords');
          if (reviewWordsStr) {
            try {
              const reviewWords: Word[] = JSON.parse(reviewWordsStr);
              setWords(reviewWords);
              setIsLoading(false);
              // Clear sessionStorage after loading
              sessionStorage.removeItem('reviewWords');
              return; // Early return for review mode
            } catch (err) {
              console.error("Error parsing review words", err);
            }
          }
        }

        // Fetch saved and completed words in parallel for better performance
        const [savedSnapshot, completedSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'users', user.uid, 'saved_words'))),
          getDocs(query(collection(db, 'users', user.uid, 'completed_words')))
        ]);

        const savedIds: string[] = [];
        savedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.wordId && !savedIds.includes(data.wordId)) {
            savedIds.push(data.wordId);
          }
        });
        console.log("[FETCH] Loaded saved words:", { count: savedIds.length, ids: savedIds });
        setSavedWordIds(savedIds);

        const completedIds: string[] = [];
        completedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.wordId && !completedIds.includes(data.wordId)) {
            completedIds.push(data.wordId);
          }
        });
        console.log("[FETCH] Loaded completed words:", { count: completedIds.length, ids: completedIds });
        setCompletedWordIds(completedIds);

        // Load initial pool excluding completed words (only if not in review mode)
        // Do this before setting loading to false for immediate display
        if (!isReviewMode) {
          const completedIdsSet = new Set(completedIds); // getWordPool expects Set
          const pool = getWordPool(completedIdsSet, POOL_SIZE);
          setWords(pool);
          // Set loading false immediately after words are set
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user words", error);
        // Fallback: load words even if fetch fails
        if (!isReviewMode) {
          const pool = getWordPool(new Set(), POOL_SIZE);
          setWords(pool);
        }
        setIsLoading(false);
      }
    };

    fetchUserWords();
  }, [user, isReviewMode]);

  // Refill pool when it gets low
  const refillPool = (currentWords: Word[], completedIds: string[]) => {
    // Convert Array to Set for getAllAvailableWords (it expects Set)
    const completedIdsSet = new Set(completedIds);
    const currentWordIds = new Set(currentWords.map(w => w.id));
    const availableWords = getAllAvailableWords(completedIdsSet);
    
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
    
    // Save to Firestore in background (don't await)
    if (isCurrentlyCompleted && user) {
      const completedWordRef = doc(db, 'users', user.uid, 'completed_words', currentWord.id);
      setDoc(completedWordRef, {
        wordId: currentWord.id,
        english: currentWord.english,
        turkish: currentWord.turkish,
        completedAt: serverTimestamp()
      }, { merge: true }).catch(err => {
        console.error("[PAGINATE] Error saving completed word:", err);
      });
    } else if (isCurrentlySaved && user) {
      const savedWordRef = doc(db, 'users', user.uid, 'saved_words', currentWord.id);
      const wordData: any = {
        wordId: currentWord.id,
        english: currentWord.english,
        turkish: currentWord.turkish,
        example: currentWord.example || '',
        type: currentWord.type || 'noun',
        level: currentWord.level || 1,
        savedAt: serverTimestamp()
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
        
        // Refill pool asynchronously (only if not in review mode)
        if (!isReviewMode && filteredWords.length < POOL_SIZE) {
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
    console.log("[TOGGLE SAVE] Pre-check:", { user: !!user, currentWord: !!currentWord, isSaving, isCompleting });
    console.log("[TOGGLE SAVE] savedWordIds state:", savedWordIds);
    console.log("[TOGGLE SAVE] completedWordIds state:", completedWordIds);
    
    if (!user || !currentWord || isSaving || isCompleting) {
      console.log("[TOGGLE SAVE] Blocked:", { user: !!user, currentWord: !!currentWord, isSaving, isCompleting });
      return;
    }
    
    console.log("[TOGGLE SAVE] Pre-check passed, continuing...");
    
    const word = currentWord;
    const isCurrentlySaved = savedWordIds.includes(word.id);
    console.log("[TOGGLE SAVE] Start:", { wordId: word.id, isCurrentlySaved, savedSize: savedWordIds.length, completedSize: completedWordIds.length });
    
    const wordRef = doc(db, 'users', user.uid, 'saved_words', word.id);
    const completedWordRef = doc(db, 'users', user.uid, 'completed_words', word.id);
    
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
        
        // Add to saved - only include defined fields
        const wordData: any = {
          wordId: word.id,
          english: word.english,
          turkish: word.turkish,
          example: word.example || '',
          type: word.type || 'noun',
          level: word.level || 1,
          savedAt: serverTimestamp()
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
    if (!user || !currentWord || words.length === 0 || isSaving || isCompleting) {
      console.log("[TOGGLE COMPLETE] Blocked:", { user: !!user, currentWord: !!currentWord, wordsLength: words.length, isSaving, isCompleting });
      return;
    }
    
    const word = currentWord;
    const isCurrentlyCompleted = completedWordIds.includes(word.id);
    console.log("[TOGGLE COMPLETE] Start:", { wordId: word.id, isCurrentlyCompleted, savedSize: savedWordIds.length, completedSize: completedWordIds.length });
    
    const wordRef = doc(db, 'users', user.uid, 'completed_words', word.id);
    const savedWordRef = doc(db, 'users', user.uid, 'saved_words', word.id);
    
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
          // Firestore delete (async, don't await - fire and forget)
          deleteDoc(savedWordRef).catch(err => {
            console.error("[TOGGLE COMPLETE] Failed to delete from saved in Firestore:", err);
          });
        }
        
        // Mark as completed
        const completedData = {
          wordId: word.id,
          english: word.english,
          turkish: word.turkish,
          completedAt: serverTimestamp()
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
  if (isLoading || words.length === 0) {
    if (!isLoading && completedWordIds.length > 0 && !isReviewMode) {
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
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Background />
        <Navbar />
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-2xl font-bold mb-2 text-neon-cyan">Loading Matrix...</div>
          <div className="text-slate-400 text-sm">Initializing word pool...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Background />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 relative">
        <div className="absolute top-24 left-0 w-full flex justify-center z-10 gap-3">
            <motion.div 
              className="bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl px-5 py-2.5 rounded-full border-2 border-neon-cyan/40 text-sm font-bold"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={`learned-${completedCount}-${completedWordIdsKey}`}
              style={{
                boxShadow: '0 4px 20px rgba(0, 243, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-neon-cyan">Learned: {completedCount}</span>
            </motion.div>
            
            <Link to="/dashboard">
              <motion.div 
                className="bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl px-5 py-2.5 rounded-full border-2 border-neon-pink/40 text-sm font-bold cursor-pointer hover:border-neon-pink/70 transition-all"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={`saved-${savedCount}-${savedWordIdsKey}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '0 4px 20px rgba(255, 0, 85, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="text-neon-pink">Saved: {savedCount}</span>
              </motion.div>
            </Link>
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
                enter: (direction: number) => ({
                  x: direction > 0 ? 1000 : -1000,
                  opacity: 0,
                  scale: 0.8,
                  rotateY: direction > 0 ? 45 : -45,
                  filter: 'blur(10px)'
                }),
                center: {
                  zIndex: 10,
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  rotateY: 0,
                  filter: 'blur(0px)'
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 1000 : -1000,
                  opacity: 0,
                  scale: 0.8,
                  rotateY: direction < 0 ? 45 : -45,
                  filter: 'blur(10px)'
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full flex justify-center"
              style={{ position: 'absolute', zIndex: 10, pointerEvents: 'auto' }}
            >
              {currentWord && (
                <Card 
                  word={currentWord} 
                  isSaved={isSaved} 
                  isCompleted={isCompleted}
                  key={`card-${currentWord.id}-${isSaved}-${isCompleted}`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls - Check button is primary, larger and more prominent */}
        <div className="flex flex-col items-center gap-4 mt-12 w-full px-4 relative z-30" style={{ position: 'relative', zIndex: 30 }}>
          <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md relative z-30" style={{ position: 'relative', zIndex: 30 }}>
            {/* Prev Button - Smaller, less prominent */}
            <motion.button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[BUTTON] Prev clicked - BEFORE paginate call", { 
                  wordsLength: words.length, 
                  currentIndex, 
                  disabled: words.length === 0 
                });
                if (words.length === 0) {
                  console.log("[BUTTON] Prev blocked: words.length is 0");
                  return;
                }
                console.log("[BUTTON] Prev calling paginate(-1)");
                paginate(-1);
                console.log("[BUTTON] Prev paginate call completed");
              }}
              disabled={words.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl relative overflow-hidden transition-all duration-300 group bg-slate-800/40 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/60 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              style={{ position: 'relative', zIndex: 20 }}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 relative z-10" />
            </motion.button>

            {/* Save Button - Secondary action, medium size */}
            <motion.button
              onClick={() => {
                console.log("[BUTTON] Save clicked, current state:", { isSaved, isSaving, isCompleting, currentWordId: currentWord?.id });
                toggleSaveWord();
              }}
              disabled={isSaving || isCompleting || !currentWord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={`save-${currentWord?.id}-${isSaved}-${savedWordIdsKey}`}
              className={`flex-shrink-0 relative p-3.5 sm:p-4 rounded-2xl transition-all duration-300 overflow-hidden group border-2 ${
                isSaved
                  ? 'bg-neon-pink/20 border-neon-pink/70 text-neon-pink shadow-[0_0_20px_rgba(255,0,85,0.4)]'
                  : isSaving
                    ? 'bg-green-500/20 border-green-500/70 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-slate-800/50 border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink/80 hover:shadow-[0_0_20px_rgba(255,0,85,0.4)]'
              }`}
            >
              {isSaving ? (
                <CheckCircle2 size={22} className="relative z-10 sm:w-6 sm:h-6" />
              ) : isSaved ? (
                <BookmarkCheck size={22} className="relative z-10 sm:w-6 sm:h-6" />
              ) : (
                <Bookmark size={22} className="relative z-10 sm:w-6 sm:h-6" />
              )}
            </motion.button>

            {/* Complete Button - PRIMARY ACTION - Green tones with celebration effect */}
            <motion.button
              onClick={() => {
                console.log("[BUTTON] Complete clicked, current state:", { isCompleted, isSaving, isCompleting, currentWordId: currentWord?.id });
                toggleCompleteWord();
              }}
              disabled={isSaving || isCompleting || !currentWord}
              key={`complete-${currentWord?.id}-${isCompleted}-${completedWordIdsKey}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isCompleting ? {
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              } : {}}
              transition={{ 
                animate: { duration: 0.6, ease: "easeOut" }
              }}
              className={`flex-shrink-0 relative p-3.5 sm:p-4 rounded-2xl transition-all duration-300 overflow-hidden group border-2 ${
                isCompleted || isCompleting
                  ? 'bg-green-500/30 border-green-500/80 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                  : 'bg-gradient-to-br from-green-500/20 via-green-600/30 to-green-700/40 border-green-500/60 text-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:bg-green-500/10 hover:border-green-500/80 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              }`}
              style={isCompleted || isCompleting ? {} : {
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(21, 128, 61, 0.4) 100%)',
              }}
            >
              {/* Celebration particles effect when completing */}
              {isCompleting && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 1,
                        scale: 0
                      }}
                      animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                        opacity: [1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </>
              )}
              {isCompleting ? (
                <CheckCircle2 size={22} className="relative z-10 sm:w-6 sm:h-6" />
              ) : isCompleted ? (
                <CheckCircle size={22} className="relative z-10 sm:w-6 sm:h-6" />
              ) : (
                <CheckCircle size={22} className="relative z-10 sm:w-6 sm:h-6" />
              )}
            </motion.button>

            {/* Next Button - Smaller, less prominent */}
            <motion.button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[BUTTON] Next clicked - BEFORE paginate call", { 
                  wordsLength: words.length, 
                  currentIndex, 
                  disabled: words.length === 0 
                });
                if (words.length === 0) {
                  console.log("[BUTTON] Next blocked: words.length is 0");
                  return;
                }
                console.log("[BUTTON] Next calling paginate(1)");
                paginate(1);
                console.log("[BUTTON] Next paginate call completed");
              }}
              disabled={words.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl relative overflow-hidden transition-all duration-300 group bg-slate-800/40 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/60 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              style={{ position: 'relative', zIndex: 20 }}
            >
              <ArrowRight size={18} className="sm:w-5 sm:h-5 relative z-10" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};
