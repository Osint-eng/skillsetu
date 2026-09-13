import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { db } from './storage/store.ts';
import {
  CompetencyCode,
  AssessmentAttempt,
  QuizAttempt,
  GeneratedQuestion,
} from './types.ts';
import {
  COMPETENCIES_DATA,
  ASSESSMENT_QUESTIONS,
  SAMPLE_LEARNING_DOCUMENT,
} from './data/seedData.ts';
import { resourceService } from './services/oerService.ts';
import { documentService } from './services/documentService.ts';
import { quizGeneratorService, GeminiLLMProvider, resourceChatService } from './services/geminiService.ts';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const apiRouter: Router = Router();

apiRouter.use(express.json({ limit: '15mb' }));

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'SkillSetu',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    oerCommonsConfigured: !!process.env.OER_COMMONS_API_TOKEN,
  });
});

// ==========================================
// 0. AUTHENTICATION & SESSION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, targetRole, educationLevel, learningGoal, country } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required to register.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const result = db.registerAccount({
      name,
      email,
      password,
      targetRole: targetRole || 'Junior Data Analyst',
      educationLevel: educationLevel || 'Undergraduate',
      learningGoal: learningGoal || 'Master core data analysis competencies and land a junior role',
      country: country || 'Global / International',
    });

    res.status(201).json({
      message: 'Account created successfully. Please begin your initial competency diagnostic.',
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = db.loginAccount(email, password);
    res.json({
      message: 'Logged in successfully.',
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }

  res.json({ user, token });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || (req.body.token as string);
  if (token) {
    db.tokens.delete(token);
  }
  res.json({ message: 'Logged out successfully.' });
});

// ==========================================
// 1. USER & COMPETENCY ENDPOINTS
// ==========================================

apiRouter.get('/users/:user_id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

apiRouter.patch('/users/:user_id', (req: Request, res: Response) => {
  try {
    const updated = db.updateUser(req.params.user_id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Failed to update profile' });
  }
});

apiRouter.post('/users', (req: Request, res: Response) => {
  const { name, email, targetRole, learningGoal, country, educationLevel } = req.body;
  const user = db.createUser({
    name,
    email,
    targetRole: targetRole || 'Junior Data Analyst',
    educationLevel: educationLevel || 'Undergraduate',
    learningGoal: learningGoal || 'Become job-ready for data-analysis projects',
    country: country || 'Global / International',
  });
  res.status(201).json(user);
});

apiRouter.post('/users/:user_id/reset-alex', (req: Request, res: Response) => {
  db.seedDemoUserAlex();
  res.json({ message: 'Reset to demo learner Alex successfully', user: db.getUser('alex-demo-user') });
});

apiRouter.get('/users/:user_id/competencies', (req: Request, res: Response) => {
  const userId = req.params.user_id;
  const user = db.getUser(userId) || db.createUser({ id: userId });
  const scores = db.getUserScores(userId);

  const scoresList = Object.values(scores);
  const totalScore = scoresList.reduce((acc, curr) => acc + curr.score, 0);
  const overallReadiness = Math.round(totalScore / scoresList.length);

  // Sort by score ascending to get highest priority gap
  const sortedByScore = [...scoresList].sort((a, b) => a.score - b.score);
  const primaryGap = sortedByScore[0];
  const strongestCompetency = sortedByScore[sortedByScore.length - 1];

  res.json({
    user,
    overallReadiness,
    scores,
    competenciesMeta: COMPETENCIES_DATA,
    primaryGap,
    strongestCompetency,
    summary: {
      highGaps: scoresList.filter(s => s.gapSeverity === 'High gap').length,
      mediumGaps: scoresList.filter(s => s.gapSeverity === 'Medium gap').length,
      lowGaps: scoresList.filter(s => s.gapSeverity === 'Low gap').length,
    },
  });
});

// ==========================================
// 2. DIAGNOSTIC ASSESSMENT ENDPOINTS
// ==========================================

apiRouter.get('/assessment/questions', (_req: Request, res: Response) => {
  // CRITICAL: Hide correct_option and explanation from the student before submission
  const sanitized = ASSESSMENT_QUESTIONS.map(q => ({
    id: q.id,
    competencyCode: q.competencyCode,
    competencyName: COMPETENCIES_DATA[q.competencyCode].name,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  }));

  res.json({
    totalQuestions: sanitized.length,
    questionsPerCompetency: 3,
    questions: sanitized,
  });
});

apiRouter.post('/assessment/attempts', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const attempt: AssessmentAttempt = {
    id: attemptId,
    userId,
    status: 'in_progress',
    answers: {},
    startedAt: new Date().toISOString(),
  };

  db.assessmentAttempts.set(attemptId, attempt);
  res.status(201).json(attempt);
});

apiRouter.post('/assessment/attempts/:attempt_id/answers', (req: Request, res: Response) => {
  const attempt = db.assessmentAttempts.get(req.params.attempt_id);
  if (!attempt) {
    return res.status(404).json({ error: 'Assessment attempt not found' });
  }

  if (attempt.status === 'completed') {
    return res.status(400).json({ error: 'Cannot submit answers for a completed assessment attempt' });
  }

  const { questionId, selectedOption } = req.body;

  // Validate question ID
  const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
  if (!question) {
    return res.status(400).json({ error: `Invalid questionId: ${questionId}` });
  }

  // Validate option index (0 - 3)
  if (typeof selectedOption !== 'number' || selectedOption < 0 || selectedOption > 3) {
    return res.status(400).json({ error: 'selectedOption must be an integer between 0 and 3' });
  }

  attempt.answers[questionId] = selectedOption;
  db.assessmentAttempts.set(attempt.id, attempt);

  res.json({
    attemptId: attempt.id,
    answeredCount: Object.keys(attempt.answers).length,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
  });
});

apiRouter.post('/assessment/attempts/:attempt_id/complete', (req: Request, res: Response) => {
  const attempt = db.assessmentAttempts.get(req.params.attempt_id);
  if (!attempt) {
    return res.status(404).json({ error: 'Assessment attempt not found' });
  }

  if (attempt.status === 'completed') {
    return res.status(400).json({ error: 'Assessment already completed. Duplicate submission prevented.' });
  }

  attempt.status = 'completed';
  attempt.completedAt = new Date().toISOString();

  // Calculate scores separately for each competency
  // score = 100 * correct_answers / attempted_questions
  const competencyStats: Record<CompetencyCode, { correct: number; total: number; score: number }> = {
    [CompetencyCode.PYTHON_BASICS]: { correct: 0, total: 3, score: 0 },
    [CompetencyCode.DATA_HANDLING]: { correct: 0, total: 3, score: 0 },
    [CompetencyCode.STATISTICS]: { correct: 0, total: 3, score: 0 },
    [CompetencyCode.DATA_VISUALIZATION]: { correct: 0, total: 3, score: 0 },
    [CompetencyCode.DATA_PRIVACY]: { correct: 0, total: 3, score: 0 },
  };

  const detailedResults = ASSESSMENT_QUESTIONS.map(q => {
    const userAnswer = attempt.answers[q.id];
    const isCorrect = userAnswer === q.correctOption;
    if (isCorrect) {
      competencyStats[q.competencyCode].correct += 1;
    }
    return {
      questionId: q.id,
      competencyCode: q.competencyCode,
      question: q.question,
      options: q.options,
      userAnswer: userAnswer !== undefined ? userAnswer : null,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const updatedScores: Record<CompetencyCode, any> = {} as any;

  // Update competency scores in database
  for (const code of Object.values(CompetencyCode)) {
    const stats = competencyStats[code];
    // Calculate raw score (percentage)
    const rawScore = Math.round((stats.correct / stats.total) * 100);
    stats.score = rawScore;

    const record = db.updateCompetencyScore(
      attempt.userId,
      code,
      rawScore,
      'diagnostic_assessment',
      `Diagnostic attempt ${attempt.id}: ${stats.correct}/${stats.total} correct`
    );
    updatedScores[code] = record;
  }

  attempt.competencyScores = {
    [CompetencyCode.PYTHON_BASICS]: competencyStats[CompetencyCode.PYTHON_BASICS].score,
    [CompetencyCode.DATA_HANDLING]: competencyStats[CompetencyCode.DATA_HANDLING].score,
    [CompetencyCode.STATISTICS]: competencyStats[CompetencyCode.STATISTICS].score,
    [CompetencyCode.DATA_VISUALIZATION]: competencyStats[CompetencyCode.DATA_VISUALIZATION].score,
    [CompetencyCode.DATA_PRIVACY]: competencyStats[CompetencyCode.DATA_PRIVACY].score,
  };
  db.assessmentAttempts.set(attempt.id, attempt);
  try {
    db.updateUser(attempt.userId, { hasCompletedDiagnostic: true });
  } catch (err) {
    // ignore if guest
  }

  const updatedUser = db.getUser(attempt.userId);

  res.json({
    attemptId: attempt.id,
    completedAt: attempt.completedAt,
    user: updatedUser,
    competencyStats,
    updatedScores,
    detailedResults,
  });
});

// ==========================================
// 3. PUBLIC RESOURCE & RECOMMENDATION ENDPOINTS
// ==========================================

apiRouter.get('/resources/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || 'data analysis';
  try {
    const result = await resourceService.search(query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Resource search failed' });
  }
});

apiRouter.get('/resources/recommended', async (req: Request, res: Response) => {
  const userId = (req.query.user_id as string) || 'alex-demo-user';
  const topN = parseInt(req.query.top_n as string, 10) || 5;

  try {
    const result = await resourceService.getRecommendedForUser(userId, topN);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Recommendation generation failed' });
  }
});

// ==========================================
// 4. DOCUMENT WORKFLOW & RAG ENDPOINTS
// ==========================================

apiRouter.get('/documents', (_req: Request, res: Response) => {
  const docs = Array.from(db.documents.values());
  res.json({
    documents: docs,
    sampleAvailable: true,
  });
});

apiRouter.get('/documents/:document_id', (req: Request, res: Response) => {
  const doc = db.documents.get(req.params.document_id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const chunks = db.documentChunks.get(doc.id) || [];
  res.json({
    document: doc,
    chunkCount: chunks.length,
    chunks: chunks.map(c => ({
      id: c.id,
      chunkIndex: c.chunkIndex,
      pageNumber: c.pageNumber,
      wordCount: c.wordCount,
      snippet: c.content.substring(0, 180) + '...',
      fullContent: c.content,
    })),
  });
});

// PDF Upload via multipart/form-data
apiRouter.post('/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'alex-demo-user';

    let buffer: Buffer;
    let filename: string;

    if (req.file) {
      buffer = req.file.buffer;
      filename = req.file.originalname;
    } else if (req.body.base64Content && req.body.filename) {
      // Allow base64 upload as well for client flexibility
      buffer = Buffer.from(req.body.base64Content, 'base64');
      filename = req.body.filename;
    } else if (req.body.useSample) {
      // Quick one-click use of the seeded sample document
      const sample = db.documents.get('sample-data-analyst-guide');
      const chunks = db.documentChunks.get('sample-data-analyst-guide') || [];
      return res.json({
        document: sample,
        chunkCount: chunks.length,
        message: 'Sample PDF document loaded ready for source-grounded practice.',
      });
    } else {
      return res.status(400).json({ error: 'No PDF file uploaded. Please provide a .pdf file.' });
    }

    const { document, chunks } = await documentService.processPdfBuffer(userId, filename, buffer);

    res.status(201).json({
      document,
      chunkCount: chunks.length,
      message: 'PDF processed and indexed successfully.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to process PDF' });
  }
});

// ==========================================
// 4B. INTERACTIVE RESOURCE CHATBOT (DOUBTS & Q&A)
// ==========================================

apiRouter.post('/documents/:document_id/chat', async (req: Request, res: Response) => {
  try {
    const { document_id } = req.params;
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A question or doubt message is required.' });
    }

    const doc = db.documents.get(document_id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Retrieve relevant chunks for this doubt
    let scoredChunks = documentService.searchSimilarChunks(document_id, message.trim(), 4);

    if (scoredChunks.length === 0) {
      const allChunks = db.documentChunks.get(document_id) || [];
      scoredChunks = allChunks.slice(0, 3).map(c => ({
        chunk: c,
        similarityScore: 0.15,
      }));
    }

    const answer = await resourceChatService.answerDoubt(
      scoredChunks,
      message.trim(),
      history,
      doc.filename
    );

    res.json({
      documentId: doc.id,
      documentTitle: doc.filename,
      reply: answer.reply,
      citations: answer.citations,
      suggestedFollowUps: answer.suggestedFollowUps,
      providerUsed: answer.providerUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to answer document doubt' });
  }
});

apiRouter.post('/documents/chat/global', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userId = 'alex-demo-user' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A question or doubt message is required.' });
    }

    const allDocs = Array.from(db.documents.values()).filter(
      d => d.userId === userId || d.id === 'sample-data-analyst-guide'
    );
    const docIds = allDocs.map(d => d.id);

    const scoredAcross = documentService.searchSimilarChunksAcrossDocs(docIds, message.trim(), 4);

    const answer = await resourceChatService.answerDoubt(
      scoredAcross,
      message.trim(),
      history,
      allDocs[0]?.filename || 'Uploaded Resources'
    );

    res.json({
      reply: answer.reply,
      citations: answer.citations,
      suggestedFollowUps: answer.suggestedFollowUps,
      providerUsed: answer.providerUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to answer doubt across resources' });
  }
});

// ==========================================
// 5. SOURCE-GROUNDED MCQ GENERATION & QUIZ
// ==========================================

apiRouter.post('/documents/:document_id/generate-quiz', async (req: Request, res: Response) => {
  const { document_id } = req.params;
  const doc = db.documents.get(document_id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const {
    competencyCode = CompetencyCode.STATISTICS,
    difficulty = 'intermediate',
    numberOfQuestions = 3,
    userId = 'alex-demo-user',
  } = req.body;

  // 1. RAG: Search relevant chunks based on target competency
  const query = COMPETENCIES_DATA[competencyCode as CompetencyCode]?.searchQueries[0] || competencyCode;
  const retrieved = documentService.searchSimilarChunks(document_id, query, 3);
  const chunks = retrieved.map(r => r.chunk);

  if (chunks.length === 0) {
    return res.status(400).json({ error: 'No text chunks available in document to generate questions from.' });
  }

  // 2. Generate structured source-grounded questions with AI / fallback
  try {
    const { questions, providerUsed } = await quizGeneratorService.generateQuiz(
      chunks,
      competencyCode as CompetencyCode,
      difficulty,
      numberOfQuestions
    );

    const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userScores = db.getUserScores(userId);
    const prevScore = userScores[competencyCode as CompetencyCode]?.score || 50;

    const quizAttempt: QuizAttempt = {
      id: quizId,
      documentId: document_id,
      userId,
      competency: competencyCode as CompetencyCode,
      difficulty,
      questions: questions.map(q => ({ ...q, quizId })),
      status: 'created',
      createdAt: new Date().toISOString(),
      previousCompetencyScore: prevScore,
    };

    db.quizzes.set(quizId, quizAttempt);

    // Return student-safe view (hide answers until completion)
    res.status(201).json({
      quizId,
      competency: competencyCode,
      competencyName: COMPETENCIES_DATA[competencyCode as CompetencyCode]?.name,
      difficulty,
      providerUsed,
      retrievedChunksCount: chunks.length,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        sourcePage: q.sourcePage,
        competency: q.competency,
        difficulty: q.difficulty,
        // Hide correctOption, explanation, and exact sourceText before submit
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
});

apiRouter.get('/quizzes/:quiz_id', (req: Request, res: Response) => {
  const quiz = db.quizzes.get(req.params.quiz_id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quiz.status === 'created') {
    // Hide answers if not yet submitted
    return res.json({
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        sourcePage: q.sourcePage,
        competency: q.competency,
        difficulty: q.difficulty,
      })),
    });
  }

  // Return full data if already submitted
  res.json(quiz);
});

apiRouter.post('/quizzes/:quiz_id/submit', async (req: Request, res: Response) => {
  const quiz = db.quizzes.get(req.params.quiz_id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quiz.status === 'submitted') {
    return res.status(400).json({ error: 'Quiz has already been submitted. Duplicate submission prevented.' });
  }

  const { answers } = req.body; // Record<string, number> questionId -> optionIndex
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers object is required' });
  }

  quiz.userAnswers = answers;
  quiz.status = 'submitted';
  quiz.submittedAt = new Date().toISOString();

  // Grade questions
  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  const evaluation = quiz.questions.map(q => {
    const userOption = answers[q.id];
    const isCorrect = userOption === q.correctOption;
    if (isCorrect) correctCount += 1;
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      selectedOption: userOption !== undefined ? userOption : null,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
      sourceText: q.sourceText,
      sourcePage: q.sourcePage,
    };
  });

  // Calculate quiz score (0 - 100)
  const quizScore = Math.round((correctCount / totalQuestions) * 100);
  quiz.score = quizScore;

  // Calculate updated competency score using required formula:
  // new_score = 0.40 * previous_score + 0.60 * quiz_score
  const previousScore = quiz.previousCompetencyScore || 40;
  const newScore = Math.round(0.40 * previousScore + 0.60 * quizScore);
  const improvement = newScore - previousScore;

  quiz.newCompetencyScore = newScore;
  quiz.improvement = improvement;

  // Persist updated competency score
  const updatedRecord = db.updateCompetencyScore(
    quiz.userId,
    quiz.competency,
    newScore,
    'generated_quiz',
    JSON.stringify({
      source: 'generated_quiz',
      quiz_id: quiz.id,
      questions_attempted: totalQuestions,
      correct_answers: correctCount,
      score: quizScore,
      previous_score: previousScore,
      new_score: newScore,
    })
  );

  // Generate next recommended action
  const compName = COMPETENCIES_DATA[quiz.competency].name;
  let nextAction = '';
  if (improvement > 0) {
    nextAction = `Great progress! Your ${compName} score improved from ${previousScore} to ${newScore} (+${improvement}%). Next, advance to the intermediate OER Commons lab on data handling, or tackle data visualization questions.`;
  } else {
    nextAction = `You scored ${quizScore}% on ${compName}. Review the highlighted source passages on Pages ${Array.from(new Set(quiz.questions.map(q => q.sourcePage))).join(', ')} before attempting the next practice round.`;
  }
  quiz.nextRecommendedAction = nextAction;

  db.quizzes.set(quiz.id, quiz);

  res.json({
    quizId: quiz.id,
    competency: quiz.competency,
    competencyName: compName,
    previousScore,
    quizScore,
    newScore,
    improvement,
    questionsAttempted: totalQuestions,
    correctAnswers: correctCount,
    updatedCompetencyRecord: updatedRecord,
    evaluation,
    nextRecommendedAction: nextAction,
  });
});

// ==========================================
// 6. PERSONALIZED LEARNING PLAN
// ==========================================

apiRouter.get('/users/:user_id/learning-plan', async (req: Request, res: Response) => {
  const userId = req.params.user_id;
  const user = db.getUser(userId) || db.createUser({ id: userId });
  const scores = db.getUserScores(userId);

  // Rank competencies by priority (lowest score = highest priority)
  const prioritized = Object.values(scores).sort((a, b) => a.score - b.score);
  const primaryGap = prioritized[0];

  const primaryCompInfo = COMPETENCIES_DATA[primaryGap.competencyCode];
  const { resources } = await resourceService.search(primaryCompInfo.searchQueries[0]);
  const rankedResources = resourceService.rankResources(resources, scores, user.targetRole);

  const llm = new GeminiLLMProvider();
  const actionableAdvice = await llm.generateActionPlan(
    primaryCompInfo.name,
    primaryGap.score,
    user.targetRole
  );

  res.json({
    userId,
    targetRole: user.targetRole,
    learningGoal: user.learningGoal,
    primaryGap: {
      ...primaryGap,
      name: primaryCompInfo.name,
      description: primaryCompInfo.description,
      targetRoleRelevance: primaryCompInfo.targetRoleRelevance,
    },
    prioritizedGaps: prioritized.map(p => ({
      ...p,
      name: COMPETENCIES_DATA[p.competencyCode].name,
      priorityRank: prioritized.indexOf(p) + 1,
    })),
    actionableAdvice,
    topResources: rankedResources.slice(0, 4),
  });
});
