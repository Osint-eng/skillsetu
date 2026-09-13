import React, { useState, useEffect } from 'react';
import {
  getAssessmentQuestions,
  startAssessment,
  submitAssessmentAnswer,
  completeAssessment,
  AssessmentQuestionPublic,
  AssessmentCompleteResponse,
} from '../api/client.ts';
import {
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BarChart2,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { CompetencyCode } from '../../server/types.ts';

interface AssessmentPageProps {
  userId: string;
  onComplete: () => void;
  onNavigateToRecommendations?: () => void;
  userName?: string;
  targetRole?: string;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  userId,
  onComplete,
  onNavigateToRecommendations,
  userName,
  targetRole = 'Junior Data Analyst',
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestionPublic[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AssessmentCompleteResponse | null>(null);

  useEffect(() => {
    initAssessment();
  }, [userId]);

  const initAssessment = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const qRes = await getAssessmentQuestions();
      setQuestions(qRes.questions);

      const aRes = await startAssessment(userId);
      setAttemptId(aRes.id);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (!attemptId || results) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));

    try {
      await submitAssessmentAnswer(attemptId, currentQ.id, optionIndex);
    } catch (err: any) {
      console.warn('Failed to record answer:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await completeAssessment(attemptId);
      setResults(res);
    } catch (err: any) {
      setError(err.message || 'Failed to complete assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">
          Loading 15-question diagnostic assessment...
        </p>
      </div>
    );
  }

  if (error && !attemptId) {
    return (
      <div className="max-w-xl mx-auto py-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <XCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-bold text-rose-900">Diagnostic Setup Error</h3>
        <p className="text-sm text-rose-700">{error}</p>
        <button
          onClick={initAssessment}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // RESULTS VIEW AFTER SUBMISSION
  // ==========================================
  if (results) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Results Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assessment Completed & Evaluated
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Diagnostic Assessment Results
              </h2>
              <p className="text-sm text-slate-500">
                Individual competency scores have been calculated from assessment evidence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={initAssessment}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>

              <button
                id="btn-goto-dashboard"
                onClick={onComplete}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                View Dashboard
              </button>

              <button
                id="btn-goto-recommendations"
                onClick={onNavigateToRecommendations || onComplete}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                View Personalized Recommendations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recommendation Transition Banner */}
          <div className="p-4 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Competency Baseline Diagnosed & Measured
              </span>
              <p className="text-indigo-800 text-[11px]">
                SkillSetu has identified your highest-priority gaps and matched them with ranked Open Educational Resources (OER) for {targetRole}.
              </p>
            </div>
            <button
              onClick={onNavigateToRecommendations || onComplete}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Start Learning Recommendations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Competency Score Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {Object.entries(results.competencyStats).map(([code, statsVal]) => {
              const stats = statsVal as { correct: number; total: number; score: number };
              const updated = results.updatedScores[code as CompetencyCode];
              return (
                <div
                  key={code}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center"
                >
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">
                    {code.replace('_', ' ')}
                  </span>
                  <span className="text-xl font-bold text-slate-900 tabular-nums">
                    {stats.score}%
                  </span>
                  <span className="text-[10px] block text-slate-500 font-medium">
                    {stats.correct}/{stats.total} Correct
                  </span>
                  {updated && (
                    <span className="text-[10px] font-bold text-indigo-600 block mt-1">
                      {updated.level}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review with Explanations */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Detailed Answer Review & Rationale
          </h3>

          {results.detailedResults.map((item, idx) => (
            <div
              key={item.questionId}
              className={`p-6 bg-white rounded-2xl border ${
                item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
              } shadow-xs space-y-3`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      Q{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.competencyCode.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                    {item.question}
                  </h4>
                </div>

                {item.isCorrect ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {item.options.map((opt, oIdx) => {
                  const isUserPick = item.userAnswer === oIdx;
                  const isCorrectPick = item.correctOption === oIdx;

                  let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isCorrectPick) {
                    optClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                  } else if (isUserPick && !item.isCorrect) {
                    optClass = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold';
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${optClass}`}
                    >
                      <span className="font-bold shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                      <span className="flex-1">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Explanation:
                </span>
                <p className="leading-relaxed">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE ASSESSMENT QUESTIONS VIEW
  // ==========================================
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isSelected = (optIdx: number) => answers[currentQ?.id] === optIdx;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Top Progress & Navigation Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {userName && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Learner: <strong>{userName}</strong> &bull; Target: <strong>{targetRole}</strong>
            </span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
              Initial Competency Assignment
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Diagnostic Assessment
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Question {currentIndex + 1} of {questions.length}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">
              Answered: {answeredCount} / {questions.length}
            </span>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Competency Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
            {currentQ?.competencyName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
            {currentQ?.difficulty}
          </span>
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* 4 Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const checked = isSelected(idx);
              return (
                <button
                  key={idx}
                  id={`opt-${currentQ.id}-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    checked
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-medium shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      checked
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="btn-complete-assessment"
                onClick={handleFinish}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {submitting ? 'Evaluating...' : 'Complete & Calculate Scores'}
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question Index Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : isAnswered
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
