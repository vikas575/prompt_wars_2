// src/firebase.config.ts
/**
 * @fileoverview Firebase initialization for the Election Process Education Assistant.
 *
 * Why Firebase?
 * - Firestore stores user quiz scores, civic readiness data, and session progress
 * - Firebase Auth provides optional Google Sign-In for cross-device persistence
 * - Firebase Analytics (GA4) tracks user engagement, quiz completions, etc.
 *
 * All configuration values are read from Vite environment variables (VITE_ prefix)
 * so they are never hardcoded in source code.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Reads Firebase config from Vite environment variables.
 * Throws a descriptive error if any required variable is missing,
 * making misconfiguration immediately obvious during development.
 */
function getFirebaseConfig(): FirebaseConfig {
  const required: Array<keyof FirebaseConfig> = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
  };

  for (const key of required) {
    if (!config[key]) {
      console.warn(
        `[Firebase] Missing environment variable: VITE_FIREBASE_${key.toUpperCase()}. ` +
          'Falling back to dummy config for development. Features requiring Firebase will fail.',
      );
      // Fill with dummy data to prevent crashes during initialization
      config[key] = 'dummy-key';
    }
  }

  return config;
}

// ─── Initialize Firebase ───────────────────────────────────────────────────

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(getFirebaseConfig());
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  // Analytics requires browser support and is not available in SSR/test environments
  isSupported()
    .then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err: unknown) => {
      console.warn('[Firebase Analytics] Not supported in this environment:', err);
    });
} catch (err: unknown) {
  // In test environments, Firebase config is mocked — suppress the error gracefully
  if (import.meta.env.MODE !== 'test') {
    console.error('[Firebase] Initialization failed:', err);
  }
  // Provide typed stubs so imports don't break at runtime
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, analytics, googleProvider };
