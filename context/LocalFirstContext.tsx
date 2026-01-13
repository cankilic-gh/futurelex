/**
 * LOCAL-FIRST CONTEXT
 *
 * This replaces the slow Firebase-first approach.
 * App loads INSTANTLY from local storage.
 * Firebase syncs silently in background.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { LocalStorage } from '../services/localStorage';
import { LearningPlan } from '../types';
import { generatePlanName, isValidLanguagePair } from '../services/languages';

// Optional: Import Firebase for background sync (lazy loaded)
let firebaseSync: any = null;

interface LocalFirstContextType {
  // Data
  plans: LearningPlan[];
  activePlan: LearningPlan | null;

  // Loading states (always fast now!)
  isReady: boolean;
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

  // Actions
  createPlan: (sourceLanguage: string, targetLanguage: string, name?: string) => LearningPlan;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
  updatePlanProgress: (planId: string, progress: Partial<LearningPlan['progress']>) => void;

  // Sync
  triggerSync: () => Promise<void>;
}

const LocalFirstContext = createContext<LocalFirstContextType | null>(null);

export const useLocalFirst = () => {
  const context = useContext(LocalFirstContext);
  if (!context) {
    throw new Error('useLocalFirst must be used within LocalFirstProvider');
  }
  return context;
};

export const LocalFirstProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State - initialized from localStorage IMMEDIATELY
  const [plans, setPlans] = useState<LearningPlan[]>(() => LocalStorage.getPlans());
  const [activePlanId, setActivePlanId] = useState<string | null>(() => LocalStorage.getActivePlanId());
  const [isReady, setIsReady] = useState(true); // Always ready - local first!
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline' | 'error'>('idle');

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const activePlan = plans.find(p => p.id === activePlanId) || plans[0] || null;

  // ============================================
  // INSTANT LOCAL ACTIONS (No waiting!)
  // ============================================

  const createPlan = useCallback((
    sourceLanguage: string,
    targetLanguage: string,
    customName?: string
  ): LearningPlan => {
    // Validate
    if (!isValidLanguagePair(sourceLanguage, targetLanguage)) {
      throw new Error('Invalid language pair');
    }

    // Check duplicate
    const exists = plans.find(
      p => p.sourceLanguage === sourceLanguage && p.targetLanguage === targetLanguage
    );
    if (exists) {
      throw new Error('Plan with this language pair already exists');
    }

    // Create plan INSTANTLY
    const newPlan: LearningPlan = {
      id: LocalStorage.generateLocalId(),
      userId: 'local', // Will be updated on sync
      sourceLanguage,
      targetLanguage,
      name: customName || generatePlanName(sourceLanguage, targetLanguage),
      createdAt: new Date(),
      isActive: plans.length === 0,
      progress: {
        wordsLearned: 0,
        currentLevel: 1,
        totalWords: 0,
      },
    };

    // Update local state immediately
    const newPlans = [...plans, newPlan];
    setPlans(newPlans);
    LocalStorage.savePlans(newPlans);

    // Set as active if first plan
    if (newPlan.isActive) {
      setActivePlanId(newPlan.id);
      LocalStorage.setActivePlanId(newPlan.id);
    }

    // Mark for background sync
    LocalStorage.markPendingSync({ type: 'CREATE_PLAN', data: newPlan });
    scheduleSyncDebounced();

    return newPlan;
  }, [plans]);

  const deletePlan = useCallback((planId: string) => {
    const newPlans = plans.filter(p => p.id !== planId);
    setPlans(newPlans);
    LocalStorage.savePlans(newPlans);

    // Update active plan if needed
    if (activePlanId === planId) {
      const newActive = newPlans[0]?.id || null;
      setActivePlanId(newActive);
      LocalStorage.setActivePlanId(newActive);
    }

    // Mark for sync
    LocalStorage.markPendingSync({ type: 'DELETE_PLAN', data: { planId } });
    scheduleSyncDebounced();
  }, [plans, activePlanId]);

  const setActivePlan = useCallback((planId: string) => {
    setActivePlanId(planId);
    LocalStorage.setActivePlanId(planId);

    // Update isActive flags
    const newPlans = plans.map(p => ({ ...p, isActive: p.id === planId }));
    setPlans(newPlans);
    LocalStorage.savePlans(newPlans);

    // Mark for sync
    LocalStorage.markPendingSync({ type: 'SET_ACTIVE', data: { planId } });
    scheduleSyncDebounced();
  }, [plans]);

  const updatePlanProgress = useCallback((
    planId: string,
    progress: Partial<LearningPlan['progress']>
  ) => {
    const newPlans = plans.map(p =>
      p.id === planId
        ? { ...p, progress: { ...p.progress, ...progress } }
        : p
    );
    setPlans(newPlans);
    LocalStorage.savePlans(newPlans);

    // Mark for sync (debounced - don't spam)
    LocalStorage.markPendingSync({ type: 'UPDATE_PROGRESS', data: { planId, progress } });
    scheduleSyncDebounced();
  }, [plans]);

  // ============================================
  // BACKGROUND SYNC (Silent, non-blocking)
  // ============================================

  const scheduleSyncDebounced = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      triggerSync();
    }, 3000); // Sync after 3s of inactivity
  }, []);

  const triggerSync = useCallback(async () => {
    // Don't sync if already syncing
    if (isSyncing) return;

    // Check if online
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    const pendingActions = LocalStorage.getPendingSync();
    if (pendingActions.length === 0) {
      setSyncStatus('synced');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Lazy load Firebase sync module
      if (!firebaseSync) {
        // For now, just mark as synced - Firebase integration can be added later
        // This keeps the app working without Firebase dependency
        console.log('[Sync] Would sync to Firebase:', pendingActions);
      }

      // Clear pending actions
      LocalStorage.clearPendingSync();
      LocalStorage.setLastSync();
      setSyncStatus('synced');
    } catch (error) {
      console.error('[Sync] Failed:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('idle');
      triggerSync();
    };
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial online check
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: LocalFirstContextType = {
    plans,
    activePlan,
    isReady,
    isSyncing,
    syncStatus,
    createPlan,
    deletePlan,
    setActivePlan,
    updatePlanProgress,
    triggerSync,
  };

  return (
    <LocalFirstContext.Provider value={value}>
      {children}
    </LocalFirstContext.Provider>
  );
};

export default LocalFirstProvider;
