// src/services/firebase.test.ts
/**
 * @fileoverview Unit tests for the Firebase service layer.
 * All Firestore and Auth SDK calls are mocked to isolate business logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';

// ─── Mock firebase/firestore ────────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'doc-ref'),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(() => 'col-ref'),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('@/firebase.config', () => ({
  db: {},
  auth: {},
  googleProvider: {},
}));

import * as firestoreSDK from 'firebase/firestore';
import * as authSDK from 'firebase/auth';
import {
  signInWithGoogle,
  signOutUser,
  getUserProgress,
  saveUserProgress,
  saveQuizSession,
  getCivicScore,
  saveCivicScore,
} from './firebase';
import type { FirestoreQuizSession, CivicReadinessScore } from '@/types';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
});

// ─── Auth ───────────────────────────────────────────────────────────────────

describe('signInWithGoogle', () => {
  it('returns user on successful sign-in', async () => {
    const mockUser = { uid: 'user123' } as User;
    vi.mocked(authSDK.signInWithPopup).mockResolvedValueOnce({
      user: mockUser,
    } as Awaited<ReturnType<typeof authSDK.signInWithPopup>>);

    const result = await signInWithGoogle();
    expect(result).toEqual(mockUser);
  });

  it('returns null when sign-in fails', async () => {
    vi.mocked(authSDK.signInWithPopup).mockRejectedValueOnce(new Error('Popup closed'));
    const result = await signInWithGoogle();
    expect(result).toBeNull();
  });
});

describe('signOutUser', () => {
  it('calls Firebase signOut', async () => {
    vi.mocked(authSDK.signOut).mockResolvedValueOnce();
    await signOutUser();
    expect(authSDK.signOut).toHaveBeenCalledTimes(1);
  });

  it('does not throw when sign-out fails', async () => {
    vi.mocked(authSDK.signOut).mockRejectedValueOnce(new Error('Network error'));
    await expect(signOutUser()).resolves.toBeUndefined();
  });
});

// ─── User Progress ──────────────────────────────────────────────────────────

describe('getUserProgress', () => {
  it('returns user progress when document exists', async () => {
    const mockData = { uid: 'user123', country: 'IN', lastActive: 1234567890 };
    vi.mocked(firestoreSDK.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData,
    } as Awaited<ReturnType<typeof firestoreSDK.getDoc>>);

    const result = await getUserProgress('user123');
    expect(result).toEqual(mockData);
  });

  it('returns null when document does not exist', async () => {
    vi.mocked(firestoreSDK.getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as Awaited<ReturnType<typeof firestoreSDK.getDoc>>);

    const result = await getUserProgress('user123');
    expect(result).toBeNull();
  });

  it('returns null when Firestore throws an error', async () => {
    vi.mocked(firestoreSDK.getDoc).mockRejectedValueOnce(new Error('Network error'));
    const result = await getUserProgress('user123');
    expect(result).toBeNull();
  });
});

describe('saveUserProgress', () => {
  it('calls setDoc with merged data', async () => {
    vi.mocked(firestoreSDK.setDoc).mockResolvedValueOnce();
    await saveUserProgress('user123', { country: 'US' });
    expect(firestoreSDK.setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ uid: 'user123', country: 'US' }),
      { merge: true },
    );
  });

  it('does not throw when setDoc fails', async () => {
    vi.mocked(firestoreSDK.setDoc).mockRejectedValueOnce(new Error('Permission denied'));
    await expect(saveUserProgress('user123', {})).resolves.toBeUndefined();
  });
});

// ─── Quiz Sessions ──────────────────────────────────────────────────────────

describe('saveQuizSession', () => {
  it('returns new document ID on success', async () => {
    vi.mocked(firestoreSDK.addDoc).mockResolvedValueOnce({ id: 'session-abc' } as Awaited<ReturnType<typeof firestoreSDK.addDoc>>);
    const session: FirestoreQuizSession = {
      uid: 'user123', country: 'IN', score: 80,
      totalQuestions: 10, correctAnswers: 8, completedAt: Date.now(), answers: [],
    };
    const result = await saveQuizSession(session);
    expect(result).toBe('session-abc');
  });

  it('returns null when addDoc fails', async () => {
    vi.mocked(firestoreSDK.addDoc).mockRejectedValueOnce(new Error('Write failed'));
    const session: FirestoreQuizSession = {
      uid: 'user123', country: 'IN', score: 50,
      totalQuestions: 10, correctAnswers: 5, completedAt: Date.now(), answers: [],
    };
    const result = await saveQuizSession(session);
    expect(result).toBeNull();
  });
});

// ─── Civic Score ────────────────────────────────────────────────────────────

describe('getCivicScore', () => {
  it('returns civic score when document exists', async () => {
    const mockScore: CivicReadinessScore = {
      uid: 'user123', timeline: 80, eligibility: 90, ballotKnowledge: 70,
      mythDebunking: 85, processKnowledge: 75, overallScore: 80, lastUpdated: Date.now(),
    };
    vi.mocked(firestoreSDK.getDoc).mockResolvedValueOnce({
      exists: () => true, data: () => mockScore,
    } as Awaited<ReturnType<typeof firestoreSDK.getDoc>>);
    const result = await getCivicScore('user123');
    expect(result?.overallScore).toBe(80);
  });

  it('returns null when document does not exist', async () => {
    vi.mocked(firestoreSDK.getDoc).mockResolvedValueOnce({
      exists: () => false, data: () => undefined,
    } as Awaited<ReturnType<typeof firestoreSDK.getDoc>>);
    const result = await getCivicScore('user123');
    expect(result).toBeNull();
  });
});

describe('saveCivicScore', () => {
  it('calls setDoc with score data', async () => {
    vi.mocked(firestoreSDK.setDoc).mockResolvedValueOnce();
    const score: CivicReadinessScore = {
      uid: 'user123', timeline: 80, eligibility: 90, ballotKnowledge: 70,
      mythDebunking: 85, processKnowledge: 75, overallScore: 80, lastUpdated: Date.now(),
    };
    await saveCivicScore('user123', score);
    expect(firestoreSDK.setDoc).toHaveBeenCalled();
  });
});
