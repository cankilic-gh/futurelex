import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDocsFromServer,
  getDoc,
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { LearningPlan } from '../types';
import { generatePlanName, isValidLanguagePair } from '../services/languages';
import { needsMigration, migrateUserToPlans } from '../services/migration';

interface PlanContextType {
  activePlan: LearningPlan | null;
  plans: LearningPlan[];
  loading: boolean;
  isReady: boolean;
  createPlan: (sourceLanguage: string, targetLanguage: string, name?: string) => Promise<LearningPlan>;
  deletePlan: (planId: string) => Promise<void>;
  setActivePlan: (planId: string) => Promise<void>;
  updatePlanProgress: (planId: string, progress: Partial<LearningPlan['progress']>) => void;
  refreshPlans: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | null>(null);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [activePlan, setActivePlanState] = useState<LearningPlan | null>(null);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const isCreatingPlanRef = useRef(false);

  // Load user's plans and active plan
  useEffect(() => {
    console.log('[PLAN] useEffect - authLoading:', authLoading, 'user:', user?.email || 'none');

    // Safety timeout - ensure loading becomes false within 10 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('[PLAN] Safety timeout triggered - forcing loading to false');
      setLoading(false);
    }, 10000);

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[PLAN] Waiting for auth...');
      return () => clearTimeout(safetyTimeout);
    }

    if (!user) {
      console.log('[PLAN] No user - clearing state');
      setPlans([]);
      setActivePlanState(null);
      setLoading(false);
      clearTimeout(safetyTimeout);
      return () => clearTimeout(safetyTimeout);
    }

    const loadPlans = async () => {
      console.log('[PLAN] loadPlans START for:', user.uid);
      try {
        // Skip if we're currently creating a plan (inside try so finally still runs)
        if (isCreatingPlanRef.current) {
          console.log('[PLAN] Skipped - plan creation in progress');
          return;
        }

        // Load all plans for user - use server directly to avoid cache issues
        const plansRef = collection(db, 'users', user.uid, 'plans');
        console.log('[PLAN] Fetching from Firebase server...');

        // Add timeout to Firebase call to catch hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout after 5s')), 5000)
        );

        const plansSnapshot = await Promise.race([
          getDocsFromServer(plansRef),
          timeoutPromise
        ]) as any;

        console.log('[PLAN] Firebase returned:', plansSnapshot.docs.length, 'plans');

        const loadedPlans: LearningPlan[] = plansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LearningPlan));

        console.log('[PLAN] Loaded', loadedPlans.length, 'plans:', loadedPlans.map(p => p.name));

        // If no plans exist, check if migration is needed
        if (loadedPlans.length === 0) {
          console.log('[PLAN] No plans, checking migration...');
          const shouldMigrate = await needsMigration(user.uid);
          if (shouldMigrate) {
            console.log('[PLAN] Migrating...');
            await migrateUserToPlans(user.uid);
            const plansSnapshotAfter = await getDocs(plansRef);
            const plansAfterMigration: LearningPlan[] = plansSnapshotAfter.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as LearningPlan));
            console.log('[PLAN] After migration:', plansAfterMigration.length, 'plans');
            setPlans(plansAfterMigration);
            const active = plansAfterMigration.find(p => p.isActive) || plansAfterMigration[0] || null;
            setActivePlanState(active);
            return;
          }
        }

        setPlans(loadedPlans);
        const active = loadedPlans.find(p => p.isActive) || loadedPlans[0] || null;
        console.log('[PLAN] Active plan:', active?.name || 'none');
        setActivePlanState(active);

        // If we had to use fallback (first plan), update Firebase in background
        if (active && !loadedPlans.find(p => p.isActive) && loadedPlans.length > 0) {
          const planRef = doc(db, 'users', user.uid, 'plans', active.id);
          updateDoc(planRef, { isActive: true }).catch(err => {
            console.warn('[PLAN CONTEXT] Failed to set isActive in Firebase:', err);
          });
        }
      } catch (error: any) {
        console.error('[PLAN] ERROR:', error?.message || error);
      } finally {
        console.log('[PLAN] loadPlans done - setting loading false');
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    console.log('[PLAN] Calling loadPlans...');
    loadPlans();

    return () => clearTimeout(safetyTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading]); // Depend on user.uid and authLoading
  const createPlan = async (
    sourceLanguage: string,
    targetLanguage: string,
    customName?: string
  ): Promise<LearningPlan> => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    isCreatingPlanRef.current = true;

    // Validate language pair
    if (!isValidLanguagePair(sourceLanguage, targetLanguage)) {
      throw new Error('Invalid language pair');
    }

    // Check if plan already exists
    const existingPlan = plans.find(
      p => p.sourceLanguage === sourceLanguage && p.targetLanguage === targetLanguage
    );
    if (existingPlan) {
      throw new Error('Plan with this language pair already exists');
    }

    // Generate client-side ID for instant response
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const planName = customName || generatePlanName(sourceLanguage, targetLanguage);
    const isFirstPlan = plans.length === 0;

    const newPlan: LearningPlan = {
      id: planId,
      userId: user.uid,
      sourceLanguage,
      targetLanguage,
      name: planName,
      createdAt: Timestamp.now(),
      isActive: isFirstPlan,
      progress: {
        wordsLearned: 0,
        currentLevel: 1,
        totalWords: 0,
      },
    };

    // OPTIMISTIC UI: Update local state immediately
    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);

    if (isFirstPlan) {
      setActivePlanState(newPlan);
    }

    // Firebase operation in background (don't await)
    const planDocRef = doc(db, 'users', user.uid, 'plans', planId);
    setDoc(planDocRef, {
      userId: user.uid,
      sourceLanguage,
      targetLanguage,
      name: planName,
      createdAt: serverTimestamp(),
      isActive: isFirstPlan,
      progress: {
        wordsLearned: 0,
        currentLevel: 1,
        totalWords: 0,
      },
    }).catch(err => {
      console.error('[PLAN CONTEXT] Create plan failed:', err);
    }).finally(() => {
      isCreatingPlanRef.current = false;
    });

    return newPlan;
  };

  const deletePlan = async (planId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    // Calculate remaining plans
    const remainingPlans = plans.filter(p => p.id !== planId);
    const wasActive = activePlan?.id === planId;

    // OPTIMISTIC UI: Update local state immediately
    setPlans(remainingPlans);

    if (wasActive && remainingPlans.length > 0) {
      setActivePlanState(remainingPlans[0]);
      setPlans(prev => prev.map(p => ({ ...p, isActive: p.id === remainingPlans[0].id })));
    } else if (wasActive) {
      setActivePlanState(null);
    }

    // Firebase operations in background (don't await)
    const planDocRef = doc(db, 'users', user.uid, 'plans', planId);
    deleteDoc(planDocRef).catch(err => {
      console.error('[PLAN CONTEXT] Delete failed:', err);
    });

    // Update active state for remaining plans in background
    if (wasActive && remainingPlans.length > 0) {
      remainingPlans.forEach(plan => {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        updateDoc(planRef, { isActive: plan.id === remainingPlans[0].id }).catch(err => {
          console.error('[PLAN CONTEXT] Update active failed:', err);
        });
      });
    }
  };

  const setActivePlan = async (planId: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in');

    try {
      // Update all plans: set the selected one as active, others as inactive
      const updates = plans.map(plan => {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        return updateDoc(planRef, {
          isActive: plan.id === planId,
        });
      });

      await Promise.all(updates);

      // Update local state
      const newActivePlan = plans.find(p => p.id === planId) || null;
      setActivePlanState(newActivePlan);
      setPlans(prev => prev.map(p => ({ ...p, isActive: p.id === planId })));
    } catch (error) {
      console.error('Error setting active plan:', error);
      throw error;
    }
  };

  const refreshPlans = async (): Promise<void> => {
    if (!user) return;

    try {
      const plansRef = collection(db, 'users', user.uid, 'plans');
      const plansSnapshot = await getDocs(plansRef);
      const loadedPlans: LearningPlan[] = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearningPlan));

      setPlans(loadedPlans);

      const active = loadedPlans.find(p => p.isActive) || null;
      setActivePlanState(active);
    } catch (error) {
      console.error('Error refreshing plans:', error);
    }
  };

  const updatePlanProgress = (
    planId: string,
    progress: Partial<LearningPlan['progress']>
  ): void => {
    if (!user) return;

    // Update local state immediately
    const newPlans = plans.map(p =>
      p.id === planId
        ? { ...p, progress: { ...p.progress, ...progress } }
        : p
    );
    setPlans(newPlans);

    // Update active plan if it's the one being updated
    if (activePlan?.id === planId) {
      setActivePlanState(prev => prev ? { ...prev, progress: { ...prev.progress, ...progress } } : null);
    }

    // Sync to Firebase in background (fire and forget)
    const planRef = doc(db, 'users', user.uid, 'plans', planId);
    updateDoc(planRef, {
      progress: { ...plans.find(p => p.id === planId)?.progress, ...progress }
    }).catch(error => {
      console.error('[PLAN CONTEXT] Error updating plan progress:', error);
    });
  };

  // isReady is true when auth is loaded and (user has plans OR no user)
  const isReady = !authLoading && !loading;

  const value: PlanContextType = {
    activePlan,
    plans,
    loading,
    isReady,
    createPlan,
    deletePlan,
    setActivePlan,
    updatePlanProgress,
    refreshPlans,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};

