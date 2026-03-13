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
import { LocalStorage } from '../services/localStorage';

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

// Helper: backup plans + active plan to localStorage
const backupToLocal = (plans: LearningPlan[], activePlan: LearningPlan | null) => {
  LocalStorage.savePlans(plans);
  LocalStorage.setActivePlanId(activePlan?.id || null);
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [activePlan, setActivePlanState] = useState<LearningPlan | null>(null);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const isCreatingPlanRef = useRef(false);

  // Load user's plans and active plan
  useEffect(() => {
    // Safety timeout - ensure loading becomes false within 10 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Wait for auth to finish loading
    if (authLoading) {
      return () => clearTimeout(safetyTimeout);
    }

    if (!user) {
      setPlans([]);
      setActivePlanState(null);
      setLoading(false);
      clearTimeout(safetyTimeout);
      return () => clearTimeout(safetyTimeout);
    }

    const loadPlans = async () => {
      try {
        // Skip if we're currently creating a plan
        if (isCreatingPlanRef.current) {
          return;
        }

        // Load all plans for user - use server directly to avoid cache issues
        const plansRef = collection(db, 'users', user.uid, 'plans');

        // Add timeout to Firebase call to catch hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout after 5s')), 5000)
        );

        const plansSnapshot = await Promise.race([
          getDocsFromServer(plansRef),
          timeoutPromise
        ]) as any;

        const loadedPlans: LearningPlan[] = plansSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        } as LearningPlan));

        // If no plans exist, check if migration is needed
        if (loadedPlans.length === 0) {
          const shouldMigrate = await needsMigration(user.uid);
          if (shouldMigrate) {
            await migrateUserToPlans(user.uid);
            const plansSnapshotAfter = await getDocs(plansRef);
            const plansAfterMigration: LearningPlan[] = plansSnapshotAfter.docs.map((doc: any) => ({
              id: doc.id,
              ...doc.data()
            } as LearningPlan));
            setPlans(plansAfterMigration);
            const active = plansAfterMigration.find(p => p.isActive) || plansAfterMigration[0] || null;
            setActivePlanState(active);
            backupToLocal(plansAfterMigration, active);
            return;
          }
        }

        setPlans(loadedPlans);
        const active = loadedPlans.find(p => p.isActive) || loadedPlans[0] || null;
        setActivePlanState(active);

        // Backup to localStorage after successful Firestore load
        backupToLocal(loadedPlans, active);
        LocalStorage.setLastSync();

        // If we had to use fallback (first plan), update Firebase in background
        if (active && !loadedPlans.find(p => p.isActive) && loadedPlans.length > 0) {
          const planRef = doc(db, 'users', user.uid, 'plans', active.id);
          updateDoc(planRef, { isActive: true }).catch((err) => {
            console.error('Failed to set fallback active plan:', err);
          });
        }
      } catch (err) {
        console.error('Failed to load plans from Firestore:', err);

        // FALLBACK: Load from localStorage if Firestore fails
        const cachedPlans = LocalStorage.getPlans();
        if (cachedPlans.length > 0) {
          console.warn('Using cached plans from localStorage');
          setPlans(cachedPlans);
          const cachedActive = LocalStorage.getActivePlan();
          setActivePlanState(cachedActive);
        }
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    loadPlans();

    return () => clearTimeout(safetyTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading]);
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

    // Backup to localStorage immediately (safety net)
    backupToLocal(updatedPlans, isFirstPlan ? newPlan : activePlan);

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
    }).then(() => {
      LocalStorage.setLastSync();
    }).catch((err) => {
      console.error('Failed to save plan to cloud:', err);
      // Plan is safe in localStorage — mark pending sync
      LocalStorage.markPendingSync({ type: 'create_plan', data: newPlan });
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
    const deletedPlan = plans.find(p => p.id === planId);

    // OPTIMISTIC UI: Update local state immediately
    setPlans(remainingPlans);

    if (wasActive && remainingPlans.length > 0) {
      setActivePlanState(remainingPlans[0]);
      setPlans(prev => prev.map(p => ({ ...p, isActive: p.id === remainingPlans[0].id })));
    } else if (wasActive) {
      setActivePlanState(null);
    }

    // Backup updated state to localStorage
    const newActive = wasActive ? (remainingPlans[0] || null) : activePlan;
    backupToLocal(remainingPlans, newActive);

    // Firebase operations in background (don't await)
    const planDocRef = doc(db, 'users', user.uid, 'plans', planId);
    deleteDoc(planDocRef).catch((err) => {
      console.error('Failed to delete plan from cloud:', err);
      // Rollback: re-add the plan to state and localStorage
      if (deletedPlan) {
        setPlans(prev => [...prev, deletedPlan]);
        LocalStorage.addPlan(deletedPlan);
      }
    });

    // Update active state for remaining plans in background
    if (wasActive && remainingPlans.length > 0) {
      remainingPlans.forEach(plan => {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        updateDoc(planRef, { isActive: plan.id === remainingPlans[0].id }).catch((err) => {
          console.error('Failed to update plan active state:', err);
        });
      });
    }
  };

  const setActivePlan = async (planId: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in');

    // Update local state + localStorage immediately (optimistic)
    const newActivePlan = plans.find(p => p.id === planId) || null;
    const updatedPlans = plans.map(p => ({ ...p, isActive: p.id === planId }));
    setActivePlanState(newActivePlan);
    setPlans(updatedPlans);
    backupToLocal(updatedPlans, newActivePlan);

    try {
      // Sync to Firebase
      const updates = plans.map(plan => {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        return updateDoc(planRef, { isActive: plan.id === planId });
      });
      await Promise.all(updates);
    } catch (error) {
      console.error('Failed to sync active plan to cloud:', error);
      // Local state and localStorage already updated — data is safe
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

      // Backup fresh data to localStorage
      backupToLocal(loadedPlans, active);
      LocalStorage.setLastSync();
    } catch (err) {
      console.error('Failed to refresh plans:', err);
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
    const newActive = activePlan?.id === planId
      ? { ...activePlan, progress: { ...activePlan.progress, ...progress } }
      : activePlan;
    if (activePlan?.id === planId) {
      setActivePlanState(newActive);
    }

    // Backup progress to localStorage
    backupToLocal(newPlans, newActive);

    // Sync to Firebase in background
    const planRef = doc(db, 'users', user.uid, 'plans', planId);
    updateDoc(planRef, {
      progress: { ...plans.find(p => p.id === planId)?.progress, ...progress }
    }).catch((err) => {
      console.error('Failed to sync plan progress:', err);
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
