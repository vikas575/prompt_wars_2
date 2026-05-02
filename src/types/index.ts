// src/types/index.ts
/**
 * @fileoverview Central TypeScript type definitions for the Election Process Education Assistant.
 * All interfaces and enums used across services, hooks, and components are declared here.
 * Strict mode enforced — no `any` types permitted.
 */

// ─── Country & Language ────────────────────────────────────────────────────

/** Supported countries for election content */
export type Country = 'IN' | 'US' | 'UK';

/** Supported language locale codes */
export type LanguageCode =
  | 'en'
  | 'hi'
  | 'es'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ar'
  | 'pt'
  | 'ru'
  | 'ja';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

// ─── User & Auth ───────────────────────────────────────────────────────────

/** Firebase authenticated user profile */
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  country: Country;
  preferredLanguage: LanguageCode;
  createdAt: number;
}

/** Civic readiness score broken into radar chart dimensions */
export interface CivicReadinessScore {
  uid: string;
  timeline: number;      // 0–100
  eligibility: number;   // 0–100
  ballotKnowledge: number; // 0–100
  mythDebunking: number; // 0–100
  processKnowledge: number; // 0–100
  overallScore: number;  // 0–100, weighted average
  lastUpdated: number;
}

// ─── Quiz ──────────────────────────────────────────────────────────────────

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: QuizDifficulty;
  category: QuizCategory;
  country: Country | 'global';
}

export type QuizCategory =
  | 'timeline'
  | 'eligibility'
  | 'ballot'
  | 'counting'
  | 'myths'
  | 'process';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface QuizSession {
  id: string;
  uid: string | null;
  country: Country;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startedAt: number;
  completedAt: number | null;
  score: number; // 0–100
}

export type QuizPhase = 'idle' | 'active' | 'feedback' | 'complete';

export interface QuizState {
  phase: QuizPhase;
  currentIndex: number;
  session: QuizSession | null;
  selectedOptionId: string | null;
}

// ─── Election Timeline ─────────────────────────────────────────────────────

export type TimelineStage =
  | 'filing'
  | 'primary'
  | 'campaign'
  | 'voting'
  | 'counting'
  | 'certification'
  | 'inauguration';

export interface TimelineEvent {
  id: string;
  stage: TimelineStage;
  title: string;
  description: string;
  daysRelativeToElection: number; // negative = before, 0 = election day, positive = after
  icon: string; // emoji or icon key
  country: Country | 'global';
}

// ─── Myths ─────────────────────────────────────────────────────────────────

export interface MythFact {
  id: string;
  myth: string;
  fact: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high'; // how dangerous/common the myth is
  country: Country | 'global';
}

// ─── Polling Station / Map ─────────────────────────────────────────────────

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openTime: string;
  closeTime: string;
  accessibilityFeatures: string[];
}

export interface MapState {
  userLocation: google.maps.LatLngLiteral | null;
  nearbyStations: PollingStation[];
  selectedStation: PollingStation | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Translation ───────────────────────────────────────────────────────────

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export interface TranslationCache {
  [key: string]: string; // "text:targetLang" -> translatedText
}

// ─── TTS ───────────────────────────────────────────────────────────────────

export interface TTSOptions {
  languageCode: string;
  ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE';
  speakingRate?: number; // 0.25 – 4.0
  pitch?: number; // -20.0 – 20.0
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSectionId: string | null;
}

// ─── Election Data (Country-specific) ─────────────────────────────────────

export interface VoterEligibility {
  country: Country;
  minimumAge: number;
  citizenshipRequired: boolean;
  residencyRequirement: string;
  registrationDeadlineDays: number; // days before election
  additionalRequirements: string[];
}

export interface BallotType {
  id: string;
  name: string;
  description: string;
  usedIn: Country[];
  pros: string[];
  cons: string[];
}

export interface ElectionData {
  country: Country;
  countryName: string;
  flag: string;
  timeline: TimelineEvent[];
  eligibility: VoterEligibility;
  ballotTypes: BallotType[];
  myths: MythFact[];
  quizQuestions: QuizQuestion[];
}

// ─── Firestore Document Shapes ─────────────────────────────────────────────

export interface FirestoreQuizSession {
  uid: string;
  country: Country;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: number;
  answers: QuizAnswer[];
}

export interface FirestoreUserProgress {
  uid: string;
  country: Country;
  preferredLanguage: LanguageCode;
  civicScore: CivicReadinessScore;
  quizSessionIds: string[];
  sectionsVisited: string[];
  lastActive: number;
}

// ─── UI / Store ────────────────────────────────────────────────────────────

export interface AppStore {
  user: UserProfile | null;
  selectedCountry: Country;
  selectedLanguage: LanguageCode;
  ttsState: TTSState;
  isDemoMode: boolean;
  setUser: (user: UserProfile | null) => void;
  setCountry: (country: Country) => void;
  setLanguage: (lang: LanguageCode) => void;
  setTTSState: (state: Partial<TTSState>) => void;
}
