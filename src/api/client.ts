import {
  UserProfile,
  CompetencyCode,
  CompetencyScoreRecord,
  RankedResource,
  PublicResource,
  DocumentRecord,
  GeneratedQuestion,
  QuizAttempt,
  ChatCitation,
  ChatMessage,
} from '../../server/types.ts';

const BASE_URL = '/api';

export const TOKEN_STORAGE_KEY = 'skillsetu_auth_token';
export const SAVED_CREDENTIALS_KEY = 'skillsetu_saved_credentials';

export interface SavedCredentials {
  email: string;
  password?: string;
  rememberMe: boolean;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getSavedCredentials(): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: SavedCredentials | null): void {
  try {
    if (creds && creds.rememberMe) {
      localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(creds));
    } else {
      localStorage.removeItem(SAVED_CREDENTIALS_KEY);
    }
  } catch {
    // ignore
  }
}

export interface CompetenciesResponse {
  user: UserProfile;
  overallReadiness: number;
  scores: Record<CompetencyCode, CompetencyScoreRecord>;
  competenciesMeta: Record<CompetencyCode, {
    code: CompetencyCode;
    name: string;
    description: string;
    targetRoleRelevance: string;
    searchQueries: string[];
  }>;
  primaryGap: CompetencyScoreRecord;
  strongestCompetency: CompetencyScoreRecord;
  summary: {
    highGaps: number;
    mediumGaps: number;
    lowGaps: number;
  };
}

export interface AssessmentQuestionPublic {
  id: string;
  competencyCode: CompetencyCode;
  competencyName: string;
  question: string;
  options: [string, string, string, string];
  difficulty: string;
}

export interface AssessmentQuestionsResponse {
  totalQuestions: number;
  questionsPerCompetency: number;
  questions: AssessmentQuestionPublic[];
}

export interface AssessmentAttemptResponse {
  id: string;
  userId: string;
  status: string;
  answers: Record<string, number>;
  startedAt: string;
}

export interface AssessmentCompleteResponse {
  attemptId: string;
  completedAt: string;
  competencyStats: Record<CompetencyCode, { correct: number; total: number; score: number }>;
  updatedScores: Record<CompetencyCode, CompetencyScoreRecord>;
  detailedResults: Array<{
    questionId: string;
    competencyCode: CompetencyCode;
    question: string;
    options: [string, string, string, string];
    userAnswer: number | null;
    correctOption: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface LearningPlanResponse {
  userId: string;
  targetRole: string;
  learningGoal: string;
  primaryGap: CompetencyScoreRecord & {
    name: string;
    description: string;
    targetRoleRelevance: string;
  };
  prioritizedGaps: Array<CompetencyScoreRecord & { name: string; priorityRank: number }>;
  actionableAdvice: string;
  topResources: RankedResource[];
}

export interface QuizGeneratedResponse {
  quizId: string;
  competency: CompetencyCode;
  competencyName: string;
  difficulty: string;
  providerUsed: string;
  retrievedChunksCount: number;
  questions: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
    sourcePage: number;
    competency: CompetencyCode;
    difficulty: string;
  }>;
}

export interface QuizSubmitResponse {
  quizId: string;
  competency: CompetencyCode;
  competencyName: string;
  previousScore: number;
  quizScore: number;
  newScore: number;
  improvement: number;
  questionsAttempted: number;
  correctAnswers: number;
  updatedCompetencyRecord: CompetencyScoreRecord;
  evaluation: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
    selectedOption: number | null;
    correctOption: number;
    isCorrect: boolean;
    explanation: string;
    sourceText: string;
    sourcePage: number;
  }>;
  nextRecommendedAction: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==========================================
// AUTHENTICATION & SESSION FUNCTIONS
// ==========================================

export async function registerLearner(params: {
  name: string;
  email: string;
  password: string;
  targetRole?: string;
  educationLevel?: string;
  learningGoal?: string;
  country?: string;
  rememberMe?: boolean;
}): Promise<{ user: UserProfile; token: string }> {
  const res = await request<{ message: string; user: UserProfile; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  setStoredToken(res.token);
  saveCredentials({
    email: params.email,
    password: params.password,
    rememberMe: !!params.rememberMe,
  });

  return { user: res.user, token: res.token };
}

export async function loginLearner(
  email: string,
  password: string,
  rememberMe = true
): Promise<{ user: UserProfile; token: string }> {
  const res = await request<{ message: string; user: UserProfile; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setStoredToken(res.token);
  saveCredentials({
    email,
    password,
    rememberMe,
  });

  return { user: res.user, token: res.token };
}

export async function getMe(): Promise<{ user: UserProfile; token: string } | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    return await request<{ user: UserProfile; token: string }>('/auth/me');
  } catch {
    setStoredToken(null);
    return null;
  }
}

export async function logoutLearner(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch {
      // ignore
    }
  }
  setStoredToken(null);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  return request<UserProfile>(`/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// API functions
export async function createUser(profile: {
  name: string;
  targetRole: string;
  learningGoal: string;
  country?: string;
}): Promise<UserProfile> {
  return request<UserProfile>('/users', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function resetAlexDemo(): Promise<void> {
  await request('/users/alex-demo-user/reset-alex', { method: 'POST' });
}

export async function getCompetencyScores(userId = 'alex-demo-user'): Promise<CompetenciesResponse> {
  return request<CompetenciesResponse>(`/users/${encodeURIComponent(userId)}/competencies`);
}

export async function getAssessmentQuestions(): Promise<AssessmentQuestionsResponse> {
  return request<AssessmentQuestionsResponse>('/assessment/questions');
}

export async function startAssessment(userId: string): Promise<AssessmentAttemptResponse> {
  return request<AssessmentAttemptResponse>('/assessment/attempts', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function submitAssessmentAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: number
): Promise<{ attemptId: string; answeredCount: number; totalQuestions: number }> {
  return request(`/assessment/attempts/${attemptId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedOption }),
  });
}

export async function completeAssessment(attemptId: string): Promise<AssessmentCompleteResponse> {
  return request<AssessmentCompleteResponse>(`/assessment/attempts/${attemptId}/complete`, {
    method: 'POST',
  });
}

export async function getLearningPlan(userId = 'alex-demo-user'): Promise<LearningPlanResponse> {
  return request<LearningPlanResponse>(`/users/${encodeURIComponent(userId)}/learning-plan`);
}

export async function searchPublicResources(query: string): Promise<{
  resources: PublicResource[];
  isFallback: boolean;
  sourceProvider: string;
}> {
  return request(`/resources/search?q=${encodeURIComponent(query)}`);
}

export async function getRecommendedResources(userId = 'alex-demo-user', topN = 6): Promise<{
  recommendations: RankedResource[];
  primaryGap: CompetencyScoreRecord;
  isFallback: boolean;
}> {
  return request(`/resources/recommended?user_id=${encodeURIComponent(userId)}&top_n=${topN}`);
}

export async function getDocuments(): Promise<{ documents: DocumentRecord[]; sampleAvailable: boolean }> {
  return request('/documents');
}

export async function getDocumentStatus(docId: string): Promise<{
  document: DocumentRecord;
  chunkCount: number;
  chunks: Array<{
    id: string;
    chunkIndex: number;
    pageNumber: number;
    wordCount: number;
    snippet: string;
    fullContent: string;
  }>;
}> {
  return request(`/documents/${docId}`);
}

export async function uploadDocument(
  file: File | null,
  userId = 'alex-demo-user',
  useSample = false
): Promise<{ document: DocumentRecord; chunkCount: number; message: string }> {
  if (useSample || !file) {
    return request('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({ userId, useSample: true }),
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const response = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return response.json();
}

export async function generateQuiz(
  documentId: string,
  competencyCode: CompetencyCode,
  difficulty = 'intermediate',
  numberOfQuestions = 3,
  userId = 'alex-demo-user'
): Promise<QuizGeneratedResponse> {
  return request<QuizGeneratedResponse>(`/documents/${documentId}/generate-quiz`, {
    method: 'POST',
    body: JSON.stringify({
      competencyCode,
      difficulty,
      numberOfQuestions,
      userId,
    }),
  });
}

export async function getQuiz(quizId: string): Promise<QuizAttempt> {
  return request<QuizAttempt>(`/quizzes/${quizId}`);
}

export async function submitQuiz(quizId: string, answers: Record<string, number>): Promise<QuizSubmitResponse> {
  return request<QuizSubmitResponse>(`/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export interface ChatDoubtApiResponse {
  documentId?: string;
  documentTitle?: string;
  reply: string;
  citations: ChatCitation[];
  suggestedFollowUps: string[];
  providerUsed: string;
  timestamp: string;
}

export async function askDocumentDoubt(
  documentId: string,
  message: string,
  history: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<ChatDoubtApiResponse> {
  return request<ChatDoubtApiResponse>(`/documents/${documentId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function askGlobalResourceDoubt(
  message: string,
  userId = 'alex-demo-user',
  history: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<ChatDoubtApiResponse> {
  return request<ChatDoubtApiResponse>('/documents/chat/global', {
    method: 'POST',
    body: JSON.stringify({ message, history, userId }),
  });
}
