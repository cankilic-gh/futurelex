// Language definition
export interface Language {
  code: string; // ISO 639-1 code (e.g., 'en', 'tr', 'de', 'fr', 'it')
  name: string; // English name (e.g., 'English', 'Turkish')
  nativeName: string; // Native name (e.g., 'English', 'Türkçe')
  flag: string; // Flag emoji (e.g., '🇬🇧', '🇹🇷')
  rtl?: boolean; // Right-to-left text direction
}

// Learning Plan definition
export interface LearningPlan {
  id: string; // Firestore Doc ID
  userId: string;
  sourceLanguage: string; // Language code (e.g., 'en', 'tr', 'de')
  targetLanguage: string; // Language code
  name: string; // User-defined name (e.g., "English from Turkish")
  createdAt: any; // Firestore Timestamp
  isActive: boolean;
  progress?: {
    wordsLearned: number;
    currentLevel: number;
    totalWords: number;
  };
}

// Word definition - now supports dynamic language pairs
export interface Word {
  id: string;
  sourceText: string; // Text in source language (replaces 'english')
  targetText: string; // Text in target language (replaces 'turkish')
  example: string;
  level: number;
  pronunciation?: string;
  type: string; // verb, noun, adj, etc.
  sourceLanguage?: string; // Language code for source
  targetLanguage?: string; // Language code for target
  // Legacy fields for backward compatibility
  english?: string;
  turkish?: string;
}

// User saved word - now includes planId
export interface UserSavedWord {
  id: string; // Firestore Doc ID
  wordId: string;
  planId: string; // Reference to learning plan
  sourceText: string; // Text in source language
  targetText: string; // Text in target language
  example?: string;
  type?: string;
  level?: number;
  pronunciation?: string;
  savedAt: any; // Firestore Timestamp
  // Legacy fields for backward compatibility
  english?: string;
  turkish?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  activePlanId?: string; // Reference to active learning plan
}