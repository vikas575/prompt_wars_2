// src/services/firebase.ts
/**
 * @fileoverview Firebase Firestore and Auth service layer.
 *
 * Why Firebase?
 * - Firestore provides real-time persistence for quiz scores and civic readiness data
 * - Auth enables optional Google Sign-In for cross-device progress sync
 * - All operations are uid-scoped, matching Firestore security rules
 *
 * Pattern: thin service functions wrapping Firestore SDK calls,
 * making them easy to mock in tests and swap implementations.
 */

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { db, auth, googleProvider } from '@/firebase.config';
import type {
  FirestoreQuizSession,
  FirestoreUserProgress,
  CivicReadinessScore,
  Country,
  LanguageCode,
} from '@/types';
import { logger } from '@/utils/logger';

// ─── Auth ──────────────────────────────────────────────────────────────────

/**
 * Initiates Google Sign-In via popup.
 * @returns Firebase User object on success, null on failure
 */
export async function signInWithGoogle(): Promise<User | null> {
  const isDemo = import.meta.env.VITE_FIREBASE_API_KEY === 'dummy-key';
  
  if (isDemo) {
    logger.info('[Auth] Demo mode: simulating Google sign-in');
    // Return a mock Firebase User object
    return {
      uid: 'demo-user-123',
      displayName: 'Demo User',
      email: 'demo@civiciq.app',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CivicIQ',
    } as User;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    logger.error('[Auth] Google sign-in failed:', err);
    return null;
  }
}

/**
 * Signs out the current Firebase user.
 */
export async function signOutUser(): Promise<void> {
  const isDemo = import.meta.env.VITE_FIREBASE_API_KEY === 'dummy-key';
  if (isDemo) return;

  try {
    await signOut(auth);
  } catch (err: unknown) {
    logger.error('[Auth] Sign-out failed:', err);
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 * @param callback - Called with User or null on each auth state change
 * @returns Unsubscribe function
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── User Progress ─────────────────────────────────────────────────────────

/**
 * Retrieves the stored progress for a given user.
 * @param uid - Firebase user ID
 * @returns User progress document or null if not found
 */
export async function getUserProgress(uid: string): Promise<FirestoreUserProgress | null> {
  try {
    const ref = doc(db as Firestore, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as FirestoreUserProgress) : null;
  } catch (err: unknown) {
    logger.error('[Firestore] getUserProgress failed:', err);
    return null;
  }
}

/**
 * Saves or updates user progress in Firestore.
 * @param uid - Firebase user ID
 * @param data - Partial user progress data to merge
 */
export async function saveUserProgress(
  uid: string,
  data: Partial<FirestoreUserProgress>,
): Promise<void> {
  try {
    const ref = doc(db as Firestore, 'users', uid);
    await setDoc(ref, { ...data, uid, lastActive: Date.now() }, { merge: true });
  } catch (err: unknown) {
    logger.error('[Firestore] saveUserProgress failed:', err);
  }
}

// ─── Quiz Sessions ─────────────────────────────────────────────────────────

/**
 * Saves a completed quiz session to Firestore.
 * @param session - Completed quiz session data
 * @returns The new document ID, or null on failure
 */
export async function saveQuizSession(
  session: FirestoreQuizSession,
): Promise<string | null> {
  try {
    const ref = collection(db as Firestore, 'quizSessions');
    const docRef = await addDoc(ref, {
      ...session,
      completedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: unknown) {
    logger.error('[Firestore] saveQuizSession failed:', err);
    return null;
  }
}

// ─── Civic Readiness Score ─────────────────────────────────────────────────

/**
 * Retrieves the civic readiness score for a user.
 * @param uid - Firebase user ID
 * @returns CivicReadinessScore or null if not found
 */
export async function getCivicScore(uid: string): Promise<CivicReadinessScore | null> {
  try {
    const ref = doc(db as Firestore, 'civicScores', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as CivicReadinessScore) : null;
  } catch (err: unknown) {
    logger.error('[Firestore] getCivicScore failed:', err);
    return null;
  }
}

/**
 * Saves or updates a user's civic readiness score.
 * @param uid - Firebase user ID
 * @param score - CivicReadinessScore object to persist
 */
export async function saveCivicScore(uid: string, score: CivicReadinessScore): Promise<void> {
  try {
    const ref = doc(db as Firestore, 'civicScores', uid);
    await setDoc(ref, { ...score, lastUpdated: Date.now() }, { merge: true });
  } catch (err: unknown) {
    logger.error('[Firestore] saveCivicScore failed:', err);
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────

/**
 * Creates a new user progress document for first-time users.
 * @param uid - Firebase user ID
 * @param country - User's selected country
 * @param preferredLanguage - User's preferred language
 */
export async function initUserProgress(
  uid: string,
  country: Country,
  preferredLanguage: LanguageCode,
): Promise<void> {
  const initial: FirestoreUserProgress = {
    uid,
    country,
    preferredLanguage,
    civicScore: {
      uid,
      timeline: 0,
      eligibility: 0,
      ballotKnowledge: 0,
      mythDebunking: 0,
      processKnowledge: 0,
      overallScore: 0,
      lastUpdated: Date.now(),
    },
    quizSessionIds: [],
    sectionsVisited: [],
    lastActive: Date.now(),
  };
  await saveUserProgress(uid, initial);
}
