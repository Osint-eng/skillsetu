export enum CompetencyCode {
  PYTHON_BASICS = 'PYTHON_BASICS',
  DATA_HANDLING = 'DATA_HANDLING',
  STATISTICS = 'STATISTICS',
  DATA_VISUALIZATION = 'DATA_VISUALIZATION',
  DATA_PRIVACY = 'DATA_PRIVACY',
}

export type CompetencyLevelName = 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
export type GapSeverity = 'High gap' | 'Medium gap' | 'Low gap';

export interface CompetencyInfo {
  code: CompetencyCode;
  name: string;
  description: string;
  targetRoleRelevance: string;
  searchQueries: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  targetRole: string;
  learningGoal: string;
  country: string;
  createdAt: string;
  hasCompletedDiagnostic?: boolean;
  educationLevel?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string; // Stored securely
  profile: UserProfile;
  token: string;
}

export interface CompetencyScoreRecord {
  competencyCode: CompetencyCode;
  score: number; // 0 - 100
  level: CompetencyLevelName;
  levelNumber: 1 | 2 | 3 | 4;
  gapSeverity: GapSeverity;
  previousScore?: number;
  lastUpdated: string;
  evidence: Array<{
    source: string;
    details: string;
    score: number;
    timestamp: string;
  }>;
}

export interface AssessmentQuestion {
  id: string;
  competencyCode: CompetencyCode;
  question: string;
  options: [string, string, string, string];
  correctOption?: number; // 0 - 3; hidden in student view
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed';
  answers: Record<string, number>; // questionId -> selectedOption (0-3)
  startedAt: string;
  completedAt?: string;
  competencyScores?: Record<CompetencyCode, number>;
}

export interface PublicResource {
  external_id: string;
  title: string;
  description: string;
  provider: string; // e.g. "OER Commons", "MIT OpenCourseWare", "OpenStax"
  provider_type: 'oer_commons' | 'mit_ocw' | 'openstax' | 'local_catalogue' | 'open_edx';
  resource_url: string;
  resource_type: 'Course' | 'Interactive Module' | 'Textbook' | 'Lab / Exercise' | 'Video Lecture';
  competencies: CompetencyCode[];
  level: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
  language: string;
  duration_minutes?: number;
  license_name?: string;
  license_url?: string;
  requires_login: boolean;
  country_scope?: string;
  source_metadata_url?: string;
  isFallback?: boolean;
}

export interface RankedResource extends PublicResource {
  matchScore: number; // 0 - 100
  matchBreakdown: {
    competencyRelevance: number; // 45%
    learnerLevelMatch: number;   // 20%
    targetRoleRelevance: number; // 15%
    metadataQuality: number;     // 10%
    languageMatch: number;       // 10%
  };
  whyRecommended: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  filesize: number;
  pageCount: number;
  uploadedAt: string;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  errorMessage?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  wordCount: number;
}

export interface GeneratedQuestion {
  id: string;
  quizId: string;
  question: string;
  options: [string, string, string, string];
  correctOption?: number; // 0 - 3
  explanation: string;
  sourceText: string;
  sourcePage: number;
  competency: CompetencyCode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizAttempt {
  id: string;
  documentId: string;
  userId: string;
  competency: CompetencyCode;
  difficulty: string;
  questions: GeneratedQuestion[];
  userAnswers?: Record<string, number>;
  score?: number;
  previousCompetencyScore?: number;
  newCompetencyScore?: number;
  improvement?: number;
  status: 'created' | 'submitted';
  createdAt: string;
  submittedAt?: string;
  nextRecommendedAction?: string;
}

export interface ChatCitation {
  pageNumber: number;
  snippet: string;
  chunkId?: string;
  documentId?: string;
  documentTitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  citations?: ChatCitation[];
  suggestedFollowUps?: string[];
}
