export interface Word {
  id: string;
  english: string;
  turkish: string; // Or meaning in user's native language
  example: string;
  level: number;
  pronunciation?: string;
  type: string; // verb, noun, adj
}

export interface UserSavedWord {
  id: string; // Firestore Doc ID
  wordId: string;
  english: string;
  turkish: string;
  example?: string;
  type?: string;
  level?: number;
  pronunciation?: string;
  savedAt: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}