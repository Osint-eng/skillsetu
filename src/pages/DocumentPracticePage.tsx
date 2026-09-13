import React, { useState, useEffect } from 'react';
import {
  getDocuments,
  getDocumentStatus,
  uploadDocument,
  generateQuiz,
  submitQuiz,
  QuizGeneratedResponse,
  QuizSubmitResponse,
} from '../api/client.ts';
import {
  FileCheck2,
  Upload,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileText,
  Clock,
  RotateCcw,
  Check,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { CompetencyCode, DocumentRecord } from '../../server/types.ts';
import { ResourceChatbot } from '../components/ResourceChatbot.tsx';

interface DocumentPracticePageProps {
  userId: string;
  initialCompetency?: CompetencyCode;
  onCompetencyUpdated: () => void;
}

export const DocumentPracticePage: React.FC<DocumentPracticePageProps> = ({
  userId,
  initialCompetency,
  onCompetencyUpdated,
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('sample-data-analyst-guide');
  const [targetCompetency, setTargetCompetency] = useState<CompetencyCode>(
    initialCompetency || CompetencyCode.STATISTICS
  );
  const [difficulty, setDifficulty] = useState('intermediate');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizData, setQuizData] = useState<QuizGeneratedResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<QuizSubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [viewChunksModal, setViewChunksModal] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'quiz'>('chat');

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    if (initialCompetency) {
      setTargetCompetency(initialCompetency);
    }
  }, [initialCompetency]);

  useEffect(() => {
    if (selectedDocId) {
      loadDocChunks(selectedDocId);
    }
  }, [selectedDocId]);

  const loadDocs = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDocId) {
        setSelectedDocId(res.documents[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDocChunks = async (docId: string) => {
    try {
      const res = await getDocumentStatus(docId);
      setChunks(res.chunks || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await uploadDocument(file, userId, false);
      await loadDocs();
      setSelectedDocId(res.document.id);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setError(null);
    try {
      const res = await uploadDocument(null, userId, true);
      await loadDocs();
      setSelectedDocId(res.document.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample guide');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    setError(null);
    setQuizData(null);
    setResults(null);
    setUserAnswers({});

    try {
      const res = await generateQuiz(
        selectedDocId,
        targetCompetency,
        difficulty,
        3,
        userId
      );
      setQuizData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate source-grounded quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (results) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || submitting) return;

    // Verify all questions have an answer
    const unanswered = quizData.questions.some(q => userAnswers[q.id] === undefined);
    if (unanswered) {
      setError('Please answer all practice questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitQuiz(quizData.quizId, userAnswers);
      setResults(res);
      onCompetencyUpdated(); // Refresh global scores
    } catch (err: any) {
      setError(err.message || 'Failed to grade quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Source-Grounded Practice & Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Practice & Prove Improvement
            </h1>
            <p className="text-sm text-slate-500">
              Extract knowledge from permitted PDF guides, answer source-grounded questions, and verify measurable score gains.
            </p>
          </div>
        </div>

        {/* Mandatory Privacy Notice */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Document Processing & Ethics Notice:</strong> Uploaded documents are processed to extract text and generate source-grounded practice questions. Users should upload only material they are permitted to process.
          </p>
        </div>
      </div>

      {/* Document Selection & Upload Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          Step 1: Choose Source Material
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Use Seeded Verified Guide */}
          <div
            onClick={handleLoadSample}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedDocId === 'sample-data-analyst-guide'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-indigo-700 uppercase tracking-wider">
                Pre-Loaded Curriculum Guide
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Ready (3 Pages)
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Junior Data Analyst Core Guide: Practical Statistics & Visual Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Covers descriptive statistics, skewness, median robustness, data-ink ratio, and privacy k-anonymity.
            </p>
          </div>

          {/* Option B: Upload Custom PDF */}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center text-center relative cursor-pointer">
            <Upload className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="font-bold text-xs text-slate-800">
              {uploading ? 'Processing PDF & Extracting Chunks...' : 'Upload Permitted PDF'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Max 10MB • Text extracted page-by-page
            </span>
            <input
              type="file"
              accept=".pdf"
              disabled={uploading}
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Selected Document Info & Chunk Explorer */}
        {selectedDocId && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">
                Selected Source: {documents.find(d => d.id === selectedDocId)?.filename || 'sample-data-analyst-guide.pdf'}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">{chunks.length} RAG text chunks indexed</span>
            </div>

            <button
              onClick={() => setViewChunksModal(!viewChunksModal)}
              className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              {viewChunksModal ? 'Hide Extracted Chunks' : 'Inspect Extracted Chunks'}
            </button>
          </div>
        )}

        {/* Chunks Inspection Drawer */}
        {viewChunksModal && (
          <div className="p-4 bg-slate-100 rounded-xl space-y-3 max-h-60 overflow-y-auto border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block">
              Indexed Chunks with Page Attribution:
            </span>
            {chunks.map((c, i) => (
              <div key={c.id || i} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Page {c.pageNumber}</span>
                  <span>{c.wordCount} words</span>
                </div>
                <p className="text-slate-700 line-clamp-3 leading-relaxed">
                  {c.snippet || c.fullContent}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode Switcher: Interactive Doubt Chatbot vs Practice Quiz */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-3">
          <button
            id="tab-doubt-chat-mode"
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeMode === 'chat'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Interactive Doubts Chatbot</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
              AI Tutor
            </span>
          </button>

          <button
            id="tab-quiz-practice-mode"
            onClick={() => setActiveMode('quiz')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeMode === 'quiz'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Source-Grounded Practice Quiz</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Prove Gains
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-500 pb-2">
          {activeMode === 'chat'
            ? 'Ask questions & doubts grounded in your PDF'
            : 'Generate MCQs directly from PDF passages'}
        </span>
      </div>

      {/* Render Mode: Chatbot */}
      {activeMode === 'chat' && (
        <div className="space-y-4">
          <ResourceChatbot
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDocId={(id) => setSelectedDocId(id)}
            userId={userId}
            embedded={true}
          />
        </div>
      )}

      {/* Render Mode: Practice Quiz */}
      {activeMode === 'quiz' && (
        <>
          {/* Step 2: Quiz Generation Parameters */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Step 2: Generate Source-Grounded Quiz
            </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Competency Gap
            </label>
            <select
              value={targetCompetency}
              onChange={e => setTargetCompetency(e.target.value as CompetencyCode)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={CompetencyCode.STATISTICS}>Statistics & Inference (Primary Gap)</option>
              <option value={CompetencyCode.DATA_VISUALIZATION}>Data Visualization</option>
              <option value={CompetencyCode.DATA_HANDLING}>Data Handling</option>
              <option value={CompetencyCode.PYTHON_BASICS}>Python Basics</option>
              <option value={CompetencyCode.DATA_PRIVACY}>Data Privacy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Practice Difficulty
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="intermediate">Intermediate (Recommended for Jr. Analyst)</option>
              <option value="beginner">Beginner</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button
          id="btn-generate-quiz"
          onClick={handleGenerateQuiz}
          disabled={generating}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Retrieving Chunks & Grounding Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate 3 Grounded Practice Questions
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Step 3: Active Quiz Taking */}
      {quizData && !results && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600">
                Grounded Practice Exam
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Competency: {quizData.competencyName}
              </h3>
              <p className="text-xs text-slate-500">
                All questions are derived directly from the uploaded material with strict page provenance.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">AI Generator Engine:</span>
              <span className="text-xs font-semibold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 inline-block">
                {quizData.providerUsed}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {quizData.questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Question 0{qIdx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Source: Page {q.sourcePage}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.question}
                </p>

                <div className="space-y-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isChecked = userAnswers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`w-full text-left p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-medium shadow-2xs ring-1 ring-indigo-500/30'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                            isChecked
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Answered: {Object.keys(userAnswers).length} of {quizData.questions.length}
            </span>

            <button
              id="btn-submit-practice-quiz"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Grading & Calculating Improvement...' : 'Submit & Prove Improvement'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Verification & Measurable Improvement Result */}
      {results && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-md space-y-6">
          {/* Improvement Header */}
          <div className="p-6 bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Score Improvement Verified
              </span>
              <span className="text-xs text-slate-300">
                Formula: new_score = 0.40(prev) + 0.60(quiz)
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold font-display">
              {results.competencyName}: Score Recalculation
            </h3>

            {/* Before / Quiz / After Metric Triad */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl">
                <span className="text-[11px] text-slate-300 block">Previous Score</span>
                <span className="text-2xl font-extrabold tabular-nums">{results.previousScore}%</span>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl">
                <span className="text-[11px] text-slate-300 block">Practice Quiz Score</span>
                <span className="text-2xl font-extrabold text-emerald-300 tabular-nums">
                  {results.quizScore}%
                </span>
                <span className="text-[10px] text-slate-300 block">
                  ({results.correctAnswers}/{results.questionsAttempted} correct)
                </span>
              </div>

              <div className="p-3 bg-emerald-500/30 backdrop-blur-xs rounded-xl border border-emerald-400/30">
                <span className="text-[11px] text-emerald-200 block font-bold">New Competency Score</span>
                <span className="text-2xl font-extrabold text-white tabular-nums">
                  {results.newScore}%
                </span>
                <span className="text-[11px] text-emerald-300 font-extrabold block">
                  {results.improvement >= 0 ? `+${results.improvement}% Improvement` : `${results.improvement}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Next Recommended Action */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-900 uppercase">
                Next Recommended Step
              </span>
              <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                {results.nextRecommendedAction}
              </p>
            </div>
          </div>

          {/* Question Breakdown with Verified Source Passages */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Verifiable Source Provenance & Passage Citations
            </h4>

            {results.evaluation.map((ev, i) => (
              <div
                key={ev.id}
                className={`p-5 rounded-xl border ${
                  ev.isCorrect ? 'border-emerald-200 bg-white' : 'border-rose-200 bg-white'
                } space-y-3 shadow-xs`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">Question 0{i + 1}</span>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{ev.question}</p>
                  </div>
                  {ev.isCorrect ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                      Correct (+33 pts)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shrink-0">
                      Incorrect
                    </span>
                  )}
                </div>

                {/* Exact Source Text Citation */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-indigo-700 font-bold text-[11px]">
                    <span>Supporting Source Passage</span>
                    <span>Document Page {ev.sourcePage}</span>
                  </div>
                  <blockquote className="italic text-slate-700 border-l-2 border-indigo-400 pl-2 my-1">
                    "{ev.sourceText}"
                  </blockquote>
                  <p className="text-[11px] text-slate-500 pt-1">
                    <strong>Explanation:</strong> {ev.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setResults(null);
                setQuizData(null);
                setUserAnswers({});
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Practice Another Topic
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
