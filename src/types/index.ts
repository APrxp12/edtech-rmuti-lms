export type UserRole = 'student' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  studentId: string;
  role: UserRole;
  status: UserStatus;
  isProfileCompleted: boolean;
  firstLoginAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
}

export type LessonStatus = 'draft' | 'published' | 'archived';
export type LearnerLessonStatus = 'not_started' | 'in_progress' | 'content_completed' | 'completed_not_passed' | 'passed';

export interface LessonVideo {
  id: string;
  title: string;
  provider: 'youtube' | 'gdrive' | 'direct';
  videoUrlOrId: string; // e.g. YouTube ID
  durationMinutes: string;
  durationSeconds: number;
  isRequired: boolean;
  sortOrder: number;
  status: 'published' | 'draft' | 'archived';
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'canva' | 'infographic' | 'pptx' | 'image' | 'document' | 'link';
  fileUrl: string;
  fileSize?: string;
  displayLocation: 'intro' | 'content' | 'both';
  sortOrder: number;
  status: 'published' | 'draft' | 'archived';
}

export interface LessonVersion {
  id: string;
  lessonId: string;
  versionTag: string; // e.g. "v1.0", "v1.1", "v2.0"
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedDurationMinutes: number;
  videos: LessonVideo[];
  resources: LessonResource[];
  preTestQuizId?: string;
  postTestQuizId?: string;
  status: 'draft' | 'published' | 'archived';
  changeNote?: string;
  publishedAt?: string;
  updatedAt: string;
  learnerCount: number;
}

export interface Lesson {
  id: string;
  code: string; // e.g. "RMUTI-001", "LT003"
  title: string;
  description: string;
  sortOrder: number;
  countsInCourseProgress: boolean;
  coverImageUrl?: string;
  introInfographicUrl?: string;
  status: LessonStatus;
  currentPublishedVersionId?: string;
  currentDraftVersionId?: string;
  versions: LessonVersion[];
  updatedAt: string;
}

export type QuizType = 'pre_test' | 'post_test';
export type ScorePolicy = 'highest' | 'latest' | 'first';

export interface QuizOption {
  id: string;
  optionText: string;
  isCorrect?: boolean; // Server secret (hidden on client tests before submit)
  sortOrder: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'single_choice' | 'true_false';
  points: number;
  explanation?: string;
  sortOrder: number;
  options: QuizOption[];
  status: 'active' | 'archived';
}

export interface QuizVersion {
  id: string;
  quizId: string;
  versionTag: string; // e.g. "v1.0"
  passScorePercent: number; // e.g. 60 or 70
  maxAttempts: number; // e.g. 3
  scorePolicy: ScorePolicy;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanation: boolean;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'archived';
  learnerCount: number;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  type: QuizType;
  title: string;
  currentPublishedVersionId?: string;
  currentDraftVersionId?: string;
  versions: QuizVersion[];
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizVersionId: string;
  quizType: QuizType;
  attemptNumber: number;
  scoreObtained: number;
  maxScore: number;
  scorePercent: number;
  isPassed: boolean;
  isCountedInFinal: boolean;
  submittedAt: string;
  answers: QuizAttemptAnswer[];
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  assignedVersionId: string; // Bound on first start
  status: LearnerLessonStatus;
  progressPercent: number;
  isPreTestCompleted: boolean;
  preTestScore?: { score: number; max: number; percent: number };
  isPostTestUnlocked: boolean;
  postTestAttempts: QuizAttempt[];
  preTestAttempts: QuizAttempt[];
  bestPostTestScorePercent?: number;
  watchedVideos: Record<string, {
    progressPercent: number;
    isCompleted: boolean;
    watchedSeconds: number;
    lastPositionSeconds: number;
    completedAt?: string;
  }>;
  firstStartedAt?: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface AccessRule {
  id: string;
  type: 'domain' | 'email';
  value: string;
  decision: 'allow' | 'deny';
  defaultRole: UserRole;
  isActive: boolean;
  note?: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'announcement' | 'update' | 'activity';
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  expiresAt: string;
  updatedAt: string;
}
