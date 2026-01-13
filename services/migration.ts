import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  query,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { LearningPlan, UserSavedWord } from '../types';

/**
 * Migration script to migrate existing English-Turkish data to plan structure
 * 
 * This script:
 * 1. Detects existing saved_words and completed_words in legacy location
 * 2. Creates a default English-Turkish plan for users
 * 3. Migrates saved_words to plan-specific collection
 * 4. Migrates completed_words to plan-specific collection
 * 5. Sets the default plan as active
 */

interface MigrationResult {
  userId: string;
  planCreated: boolean;
  planId?: string;
  savedWordsMigrated: number;
  completedWordsMigrated: number;
  errors: string[];
}

/**
 * Migrate a single user's data to plan structure
 */
export const migrateUserToPlans = async (userId: string): Promise<MigrationResult> => {
  const result: MigrationResult = {
    userId,
    planCreated: false,
    savedWordsMigrated: 0,
    completedWordsMigrated: 0,
    errors: [],
  };

  try {
    // Check if user already has plans
    const plansRef = collection(db, 'users', userId, 'plans');
    const existingPlans = await getDocs(plansRef);
    
    if (existingPlans.docs.length > 0) {
      // User already has plans, skip migration
      result.errors.push('User already has plans, skipping migration');
      return result;
    }

    // Check for legacy saved_words
    const legacySavedRef = collection(db, 'users', userId, 'saved_words');
    const legacySavedSnapshot = await getDocs(legacySavedRef);
    
    // Check for legacy completed_words
    const legacyCompletedRef = collection(db, 'users', userId, 'completed_words');
    const legacyCompletedSnapshot = await getDocs(legacyCompletedRef);

    // If no legacy data, skip migration
    if (legacySavedSnapshot.docs.length === 0 && legacyCompletedSnapshot.docs.length === 0) {
      result.errors.push('No legacy data found, skipping migration');
      return result;
    }

    // Create default English-Turkish plan
    const defaultPlan: Omit<LearningPlan, 'id'> = {
      userId,
      sourceLanguage: 'en',
      targetLanguage: 'tr',
      name: 'English from Turkish',
      createdAt: serverTimestamp() as any,
      isActive: true,
      progress: {
        wordsLearned: 0,
        currentLevel: 1,
        totalWords: 0,
      },
    };

    const planRef = doc(collection(db, 'users', userId, 'plans'));
    await setDoc(planRef, defaultPlan);
    result.planCreated = true;
    result.planId = planRef.id;

    // Migrate saved_words
    for (const savedDoc of legacySavedSnapshot.docs) {
      try {
        const data = savedDoc.data();
        const migratedData: UserSavedWord = {
          id: savedDoc.id,
          wordId: data.wordId || savedDoc.id,
          planId: planRef.id,
          sourceText: data.english || data.sourceText || '',
          targetText: data.turkish || data.targetText || '',
          example: data.example || '',
          type: data.type || 'noun',
          level: data.level || 1,
          pronunciation: data.pronunciation,
          savedAt: data.savedAt || serverTimestamp(),
          // Legacy fields for backward compatibility
          english: data.english,
          turkish: data.turkish,
        };

        await setDoc(
          doc(db, 'users', userId, 'plans', planRef.id, 'saved_words', savedDoc.id),
          migratedData
        );
        result.savedWordsMigrated++;
      } catch (error: any) {
        result.errors.push(`Error migrating saved word ${savedDoc.id}: ${error.message}`);
      }
    }

    // Migrate completed_words
    for (const completedDoc of legacyCompletedSnapshot.docs) {
      try {
        const data = completedDoc.data();
        const migratedData = {
          wordId: data.wordId || completedDoc.id,
          planId: planRef.id,
          sourceText: data.english || data.sourceText || '',
          targetText: data.turkish || data.targetText || '',
          sourceLanguage: 'en',
          targetLanguage: 'tr',
          completedAt: data.completedAt || serverTimestamp(),
          // Legacy fields for backward compatibility
          english: data.english,
          turkish: data.turkish,
        };

        await setDoc(
          doc(db, 'users', userId, 'plans', planRef.id, 'completed_words', completedDoc.id),
          migratedData
        );
        result.completedWordsMigrated++;
      } catch (error: any) {
        result.errors.push(`Error migrating completed word ${completedDoc.id}: ${error.message}`);
      }
    }

    return result;
  } catch (error: any) {
    result.errors.push(`Migration failed: ${error.message}`);
    return result;
  }
};

/**
 * Migrate all users (admin function - use with caution)
 * This should be run from an admin context
 */
export const migrateAllUsers = async (): Promise<MigrationResult[]> => {
  const results: MigrationResult[] = [];
  
  try {
    // Get all users (this requires admin access)
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`Migrating user: ${userId}`);
      const result = await migrateUserToPlans(userId);
      results.push(result);
      console.log(`Migration result for ${userId}:`, result);
    }

    return results;
  } catch (error: any) {
    console.error('Error in migrateAllUsers:', error);
    throw error;
  }
};

/**
 * Check if user needs migration
 */
export const needsMigration = async (userId: string): Promise<boolean> => {
  try {
    // Check if user has plans
    const plansRef = collection(db, 'users', userId, 'plans');
    const plansSnapshot = await getDocs(plansRef);
    
    if (plansSnapshot.docs.length > 0) {
      return false; // User already has plans
    }

    // Check for legacy data
    const legacySavedRef = collection(db, 'users', userId, 'saved_words');
    const legacySavedSnapshot = await getDocs(legacySavedRef);
    
    const legacyCompletedRef = collection(db, 'users', userId, 'completed_words');
    const legacyCompletedSnapshot = await getDocs(legacyCompletedRef);

    // Needs migration if legacy data exists
    return legacySavedSnapshot.docs.length > 0 || legacyCompletedSnapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};


