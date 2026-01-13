import React, { createContext, useContext, useEffect, useState } from 'react';
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
  createPlan: (sourceLanguage: string, targetLanguage: string, name?: string) => Promise<LearningPlan>;
  deletePlan: (planId: string) => Promise<void>;
  setActivePlan: (planId: string) => Promise<void>;
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

  // Load user's plans and active plan
  useEffect(() => {
    console.log('[PLAN CONTEXT] ===== useEffect triggered =====');
    console.log('[PLAN CONTEXT] authLoading:', authLoading);
    console.log('[PLAN CONTEXT] user:', user ? { uid: user.uid, email: user.email } : 'null');
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[PLAN CONTEXT] Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('[PLAN CONTEXT] No user, clearing plans');
      setPlans([]);
      setActivePlanState(null);
      setLoading(false);
      return;
    }

    const loadPlans = async () => {
      // Skip if we're currently creating a plan
      if (isCreatingPlanRef.current) {
        console.log('[PLAN CONTEXT] loadPlans skipped - plan creation in progress');
        return;
      }
      
      console.log('[PLAN CONTEXT] loadPlans called for user:', user.uid);
      try {
        // Load all plans for user
        const plansRef = collection(db, 'users', user.uid, 'plans');
        console.log('[PLAN CONTEXT] Collection path:', plansRef.path);
        console.log('[PLAN CONTEXT] Fetching plans from Firestore...');
        
        // Use getDocs (will use cache if available, server if not)
        // This is faster and Firestore handles cache/server automatically
        const plansSnapshot = await getDocs(plansRef);
        console.log('[PLAN CONTEXT] Plans snapshot size:', plansSnapshot.docs.length);
        console.log('[PLAN CONTEXT] Plans snapshot empty:', plansSnapshot.empty);
        console.log('[PLAN CONTEXT] Plans snapshot metadata:', {
          fromCache: plansSnapshot.metadata.fromCache,
          hasPendingWrites: plansSnapshot.metadata.hasPendingWrites
        });
        
        // Log all document IDs
        if (plansSnapshot.docs.length > 0) {
          console.log('[PLAN CONTEXT] Found document IDs:', plansSnapshot.docs.map(d => d.id));
        } else {
          console.warn('[PLAN CONTEXT] ⚠️ No documents found in collection!');
          
          // If data came from cache and no plans found, try server once
          if (plansSnapshot.metadata.fromCache && plansSnapshot.docs.length === 0) {
            console.log('[PLAN CONTEXT] Cache returned 0 docs, checking server...');
            try {
              const serverSnapshot = await getDocsFromServer(plansRef);
              if (serverSnapshot.docs.length > 0) {
                console.log('[PLAN CONTEXT] ✅ Found plans on server!');
                const serverPlans: LearningPlan[] = serverSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                } as LearningPlan));
                setPlans(serverPlans);
                const active = serverPlans.find(p => p.isActive) || serverPlans[0] || null;
                setActivePlanState(active);
                setLoading(false);
                return;
              }
            } catch (serverError) {
              console.warn('[PLAN CONTEXT] Server check failed:', serverError);
            }
          }
        }
        
        const loadedPlans: LearningPlan[] = plansSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('[PLAN CONTEXT] Plan doc:', { id: doc.id, data });
          return {
            id: doc.id,
            ...data
          } as LearningPlan;
        });

        console.log('[PLAN CONTEXT] Loaded plans:', loadedPlans);

        // If no plans exist, check if migration is needed
        if (loadedPlans.length === 0) {
          console.log('[PLAN CONTEXT] No plans found, checking migration...');
          const shouldMigrate = await needsMigration(user.uid);
          if (shouldMigrate) {
            console.log('[PLAN CONTEXT] Migrating legacy data to plan structure...');
            const migrationResult = await migrateUserToPlans(user.uid);
            console.log('[PLAN CONTEXT] Migration result:', migrationResult);
            
            // Reload plans after migration
            const plansSnapshotAfter = await getDocs(plansRef);
            const plansAfterMigration: LearningPlan[] = plansSnapshotAfter.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as LearningPlan));
            
            console.log('[PLAN CONTEXT] Plans after migration:', plansAfterMigration);
            setPlans(plansAfterMigration);
            const active = plansAfterMigration.find(p => p.isActive) || plansAfterMigration[0] || null;
            setActivePlanState(active);
            setLoading(false);
            return;
          }
        }

        console.log('[PLAN CONTEXT] Setting plans state:', loadedPlans);
        console.log('[PLAN CONTEXT] Plans array length:', loadedPlans.length);
        setPlans(loadedPlans);
        
        // Force a state update check
        setTimeout(() => {
          console.log('[PLAN CONTEXT] State check - plans count after setPlans:', plans.length);
        }, 100);

        // Find active plan
        const active = loadedPlans.find(p => p.isActive) || loadedPlans[0] || null;
        console.log('[PLAN CONTEXT] Active plan found:', active ? { id: active.id, name: active.name } : 'null');
        setActivePlanState(active);

        // If no active plan but plans exist, set first one as active
        if (!active && loadedPlans.length > 0) {
          console.log('[PLAN CONTEXT] No active plan found, setting first plan as active...');
          try {
            await setActivePlan(loadedPlans[0].id);
            console.log('[PLAN CONTEXT] ✅ First plan set as active');
          } catch (setActiveError) {
            console.error('[PLAN CONTEXT] ❌ Error setting first plan as active:', setActiveError);
          }
        }
      } catch (error: any) {
        console.error('[PLAN CONTEXT] ===== ERROR loading plans =====');
        console.error('[PLAN CONTEXT] Error details:', error);
        console.error('[PLAN CONTEXT] Error name:', error?.name);
        console.error('[PLAN CONTEXT] Error message:', error?.message);
        console.error('[PLAN CONTEXT] Error code:', error?.code);
        console.error('[PLAN CONTEXT] Error stack:', error?.stack);
        console.error('[PLAN CONTEXT] ===== ERROR END =====');
        // Don't clear plans on error - keep existing state
      } finally {
        console.log('[PLAN CONTEXT] loadPlans completed, setting loading to false');
        setLoading(false);
      }
    };

    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading]); // Depend on user.uid and authLoading
  
  // Prevent loadPlans from running when plans are updated locally
  const isCreatingPlanRef = React.useRef(false);

  const createPlan = async (
    sourceLanguage: string, 
    targetLanguage: string, 
    customName?: string
  ): Promise<LearningPlan> => {
    console.log('[PLAN CONTEXT] createPlan called:', { sourceLanguage, targetLanguage, customName });
    
    if (!user) {
      console.error('[PLAN CONTEXT] No user found');
      throw new Error('User must be logged in');
    }
    
    // Set flag to prevent loadPlans from running
    isCreatingPlanRef.current = true;
    console.log('[PLAN CONTEXT] Set isCreatingPlanRef to true');

    // Validate language pair
    if (!isValidLanguagePair(sourceLanguage, targetLanguage)) {
      console.error('[PLAN CONTEXT] Invalid language pair');
      throw new Error('Invalid language pair');
    }

    // Check if plan already exists
    const existingPlan = plans.find(
      p => p.sourceLanguage === sourceLanguage && p.targetLanguage === targetLanguage
    );
    if (existingPlan) {
      console.error('[PLAN CONTEXT] Plan already exists');
      throw new Error('Plan with this language pair already exists');
    }

    // Generate plan name
    const planName = customName || generatePlanName(sourceLanguage, targetLanguage);
    console.log('[PLAN CONTEXT] Generated plan name:', planName);

    // Create plan document
    const planData = {
      userId: user.uid,
      sourceLanguage,
      targetLanguage,
      name: planName,
      createdAt: serverTimestamp(),
      isActive: plans.length === 0, // First plan is active by default
      progress: {
        wordsLearned: 0,
        currentLevel: 1,
        totalWords: 0,
      },
    };

    console.log('[PLAN CONTEXT] Creating plan in Firestore...');
    console.log('[PLAN CONTEXT] Plan data to save:', planData);
    console.log('[PLAN CONTEXT] User UID:', user.uid);
    
    let planRef;
    let planId: string | null = null;
    
    try {
      const collectionRef = collection(db, 'users', user.uid, 'plans');
      console.log('[PLAN CONTEXT] Collection ref created');
      console.log('[PLAN CONTEXT] Calling addDoc (no timeout)...');
      
      // Simple addDoc without timeout - let Firestore handle it
      planRef = await addDoc(collectionRef, planData);
      console.log('[PLAN CONTEXT] ✅ addDoc completed!');
      console.log('[PLAN CONTEXT] ✅ Plan created in Firestore with ID:', planRef.id);
      planId = planRef.id;
      
      console.log('[PLAN CONTEXT] Plan ref path:', planRef?.path);
    } catch (error: any) {
      console.error('[PLAN CONTEXT] ❌ Error creating plan in Firestore:', error);
      console.error('[PLAN CONTEXT] Error name:', error?.name);
      console.error('[PLAN CONTEXT] Error message:', error?.message);
      console.error('[PLAN CONTEXT] Error code:', error?.code);
      isCreatingPlanRef.current = false;
      throw error;
    }
    
    if (!planId) {
      console.error('[PLAN CONTEXT] ❌ planId is null');
      isCreatingPlanRef.current = false;
      throw new Error('Failed to create plan - no planId');
    }

    const newPlan: LearningPlan = {
      id: planId,
      ...planData,
      createdAt: Timestamp.now(), // Fallback for immediate use
    } as LearningPlan;

    console.log('[PLAN CONTEXT] New plan object created:', newPlan);
    console.log('[PLAN CONTEXT] Current plans array length:', plans.length);

    // Update local state first (add new plan to plans array)
    const updatedPlans = [...plans, newPlan];
    console.log('[PLAN CONTEXT] Updated plans array length:', updatedPlans.length);
    console.log('[PLAN CONTEXT] Calling setPlans with:', updatedPlans);
    setPlans(updatedPlans);
    console.log('[PLAN CONTEXT] setPlans called');

    // If this is the first plan or should be active, set it as active (async, don't block)
    if (newPlan.isActive) {
      console.log('[PLAN CONTEXT] Plan should be active, isActive:', newPlan.isActive);
      console.log('[PLAN CONTEXT] Setting plan as active in local state...');
      // Set local state immediately
      setActivePlanState(newPlan);
      console.log('[PLAN CONTEXT] setActivePlanState called');
      
      setPlans(prev => {
        console.log('[PLAN CONTEXT] setPlans callback - updating isActive flags');
        return prev.map(p => ({ ...p, isActive: p.id === newPlan.id }));
      });
      
      // Update Firestore in background (don't await - don't block plan creation)
      console.log('[PLAN CONTEXT] Updating Firestore active state (background, non-blocking)...');
      Promise.all(updatedPlans.map(plan => {
        const planDocRef = doc(db, 'users', user.uid, 'plans', plan.id);
        return updateDoc(planDocRef, {
          isActive: plan.id === newPlan.id,
        }).catch(error => {
          console.error('[PLAN CONTEXT] Error setting active plan in Firestore:', error);
          // Don't throw - plan is created, just active state update failed
        });
      })).then(() => {
        console.log('[PLAN CONTEXT] Firestore active state update completed (background)');
      });
    } else {
      console.log('[PLAN CONTEXT] Plan is not active, isActive:', newPlan.isActive);
    }

    console.log('[PLAN CONTEXT] ✅ About to return newPlan:', newPlan);
    console.log('[PLAN CONTEXT] ===== createPlan SUCCESS END =====');
    
    // Reset flag after a short delay to allow state updates
    setTimeout(() => {
      isCreatingPlanRef.current = false;
      console.log('[PLAN CONTEXT] Reset isCreatingPlanRef to false');
    }, 2000);
    
    console.log('[PLAN CONTEXT] Returning newPlan now...');
    return newPlan;
  };

  const deletePlan = async (planId: string): Promise<void> => {
    console.log('[PLAN CONTEXT] ===== deletePlan START =====');
    console.log('[PLAN CONTEXT] Plan ID to delete:', planId);
    console.log('[PLAN CONTEXT] User UID:', user?.uid);
    console.log('[PLAN CONTEXT] Current plans count:', plans.length);
    console.log('[PLAN CONTEXT] Current active plan ID:', activePlan?.id);
    
    if (!user) {
      console.error('[PLAN CONTEXT] ❌ User not logged in');
      throw new Error('User must be logged in');
    }

    try {
      // Delete plan document
      const planDocRef = doc(db, 'users', user.uid, 'plans', planId);
      console.log('[PLAN CONTEXT] Plan document path:', planDocRef.path);
      console.log('[PLAN CONTEXT] Calling deleteDoc...');
      
      // Try deleteDoc with timeout
      const deleteDocPromise = deleteDoc(planDocRef);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('deleteDoc took too long')), 5000)
      );
      
      try {
        await Promise.race([deleteDocPromise, timeoutPromise]);
        console.log('[PLAN CONTEXT] ✅ deleteDoc completed successfully');
      } catch (raceError: any) {
        console.warn('[PLAN CONTEXT] ⚠️ deleteDoc race failed, but document may still be deleted:', raceError.message);
        
        // Verify deletion by trying to read the document
        console.log('[PLAN CONTEXT] Verifying deletion by checking if document exists...');
        try {
          const docSnapshot = await getDoc(planDocRef);
          if (docSnapshot.exists()) {
            console.error('[PLAN CONTEXT] ❌ Document still exists after timeout');
            throw new Error('Plan deletion timed out and document still exists');
          } else {
            console.log('[PLAN CONTEXT] ✅ Document verified as deleted (does not exist)');
          }
        } catch (verifyError: any) {
          console.error('[PLAN CONTEXT] ❌ Error verifying deletion:', verifyError);
          // If verification fails, assume deletion succeeded and continue
          console.log('[PLAN CONTEXT] ⚠️ Continuing with deletion flow despite verification error');
        }
      }

      // Calculate remaining plans first
      const remainingPlans = plans.filter(p => p.id !== planId);
      console.log('[PLAN CONTEXT] Remaining plans count:', remainingPlans.length);
      console.log('[PLAN CONTEXT] Remaining plans:', remainingPlans.map(p => ({ id: p.id, name: p.name })));
      
      // Update local state immediately
      console.log('[PLAN CONTEXT] Updating local state with remaining plans');
      setPlans(remainingPlans);

      // If deleted plan was active, set another plan as active
      const wasActive = activePlan?.id === planId;
      console.log('[PLAN CONTEXT] Was deleted plan active?', wasActive);
      
      if (wasActive && remainingPlans.length > 0) {
        console.log('[PLAN CONTEXT] Deleted plan was active, setting first remaining plan as active');
        // Update all remaining plans: set the first one as active, others as inactive
        try {
          const updates = remainingPlans.map(plan => {
            const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
            const isActive = plan.id === remainingPlans[0].id;
            console.log(`[PLAN CONTEXT] Updating plan ${plan.id} isActive to ${isActive}`);
            return updateDoc(planRef, {
              isActive: isActive,
            });
          });

          console.log('[PLAN CONTEXT] Waiting for all Firestore updates...');
          await Promise.all(updates);
          console.log('[PLAN CONTEXT] ✅ All Firestore updates completed');

          // Update local state
          console.log('[PLAN CONTEXT] Setting new active plan in local state:', remainingPlans[0].id);
          setActivePlanState(remainingPlans[0]);
          setPlans(prev => prev.map(p => ({ ...p, isActive: p.id === remainingPlans[0].id })));
        } catch (error) {
          console.error('[PLAN CONTEXT] ❌ Error setting active plan after delete:', error);
          // Don't throw - plan is deleted, just active state update failed
          setActivePlanState(remainingPlans[0]);
        }
      } else if (wasActive) {
        console.log('[PLAN CONTEXT] Deleted plan was active, but no remaining plans. Setting activePlan to null');
        setActivePlanState(null);
      } else {
        console.log('[PLAN CONTEXT] Deleted plan was not active, no need to change active plan');
      }
      
      console.log('[PLAN CONTEXT] ===== deletePlan SUCCESS END =====');
    } catch (error: any) {
      console.error('[PLAN CONTEXT] ===== deletePlan ERROR =====');
      console.error('[PLAN CONTEXT] Error details:', error);
      console.error('[PLAN CONTEXT] Error name:', error?.name);
      console.error('[PLAN CONTEXT] Error message:', error?.message);
      console.error('[PLAN CONTEXT] Error code:', error?.code);
      console.error('[PLAN CONTEXT] Error stack:', error?.stack);
      console.error('[PLAN CONTEXT] ===== deletePlan ERROR END =====');
      throw error;
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

  const value: PlanContextType = {
    activePlan,
    plans,
    loading,
    createPlan,
    deletePlan,
    setActivePlan,
    refreshPlans,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};

