import React, { useState, useEffect } from 'react';
import {
  getCompetencyScores,
  getRecommendedResources,
  CompetenciesResponse,
} from '../api/client.ts';
import { CompetencyChart } from '../components/CompetencyChart.tsx';
import {
  CompetencyCode,
  CompetencyScoreRecord,
  RankedResource,
} from '../../server/types.ts';
import {
  Award,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Brain,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Clock,
  Compass
} from 'lucide-react';

interface DashboardPageProps {
  userId: string;
  onNavigateTab: (tab: string, context?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<CompetenciesResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RankedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const compRes = await getCompetencyScores(userId);
      setData(compRes);

      const recRes = await getRecommendedResources(userId, 3);
      setRecommendations(recRes.recommendations);
    } catch (err: any) {
      setError(err.message || 'Failed to load competency dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">
          Loading learner competency profile...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-bold text-rose-900">Dashboard Loading Error</h3>
        <p className="text-sm text-rose-700">{error || 'Unable to retrieve competency records'}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, overallReadiness, scores, competenciesMeta, primaryGap, strongestCompetency } = data;

  // Check if any competency has recorded improvement
  const scoresList = Object.values(scores) as CompetencyScoreRecord[];
  const improvedItems = scoresList.filter(
    s => s.previousScore !== undefined && s.score > s.previousScore
  );

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner: Learner Context & Readiness Gauge */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Active Target: {user.targetRole}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Goal: <span className="font-medium text-slate-800">{user.learningGoal}</span>.
            Review your competency gaps below, access ranked international open resources, and take source-grounded practice quizzes to prove your progress.
          </p>
        </div>

        {/* Readiness Meter Card */}
        <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex items-center gap-5 shrink-0 self-stretch md:self-auto">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Circular representation */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-400"
                strokeDasharray={`${overallReadiness}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold tabular-nums leading-none">
                {overallReadiness}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
              Job Readiness
            </span>
            <p className="text-xs text-slate-300">
              Composite score across all 5 data analyst skills.
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Target: 75%
            </span>
          </div>
        </div>
      </div>

      {/* Before-and-After Improvement Banner (Displayed when learner has completed a quiz) */}
      {improvedItems.length > 0 && (
        <div className="p-6 bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl border border-emerald-700/50 shadow-md space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Measurable Competency Improvement Verified!</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Your evidence-backed performance in source-grounded practice has updated your competency scores:
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            {improvedItems.map(item => (
              <div
                key={item.competencyCode}
                className="px-4 py-2 bg-emerald-800/60 rounded-xl border border-emerald-500/40 text-xs flex items-center gap-3"
              >
                <span className="font-semibold">{competenciesMeta[item.competencyCode]?.name}:</span>
                <span className="text-slate-300 line-through tabular-nums">{item.previousScore}%</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span className="font-bold text-white tabular-nums">{item.score}%</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-emerald-950 font-extrabold text-[11px]">
                  +{item.score - (item.previousScore || 0)}% Gain
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Gap & Strength Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Gap Highlight */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Priority #1 Gap: {competenciesMeta[primaryGap.competencyCode]?.name}
              </span>
              <span className="text-sm font-bold text-rose-600 tabular-nums">
                {primaryGap.score}/100 ({primaryGap.level})
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Focus on {competenciesMeta[primaryGap.competencyCode]?.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {competenciesMeta[primaryGap.competencyCode]?.targetRoleRelevance}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => onNavigateTab('practice', { competency: primaryGap.competencyCode })}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Practice Grounded Quiz
            </button>

            <button
              onClick={() => onNavigateTab('resources')}
              className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1"
            >
              Browse OER Modules <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Strongest Competency Highlight */}
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Strongest Competency: {competenciesMeta[strongestCompetency.competencyCode]?.name}
              </span>
              <span className="text-sm font-bold text-indigo-700 tabular-nums">
                {strongestCompetency.score}/100 ({strongestCompetency.level})
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Solid Foundation in {competenciesMeta[strongestCompetency.competencyCode]?.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {competenciesMeta[strongestCompetency.competencyCode]?.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Level {strongestCompetency.levelNumber} - Ready for intermediate scripts
            </span>
            <button
              onClick={() => onNavigateTab('learning-plan')}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Learning Plan <Compass className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Competency Visualization Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Competency Breakdown & Gap Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic calculations based on diagnostic evidence and practice results.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('assessment')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" /> Retake Diagnostic
          </button>
        </div>

        <CompetencyChart
          scores={scores}
          competenciesMeta={competenciesMeta}
          onSelectCompetency={(code) => onNavigateTab('practice', { competency: code })}
        />
      </div>

      {/* Recommended International Public Educational Resources Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Recommended OER Public Resources
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                OER Commons Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ranked specifically to address your primary gap in {competenciesMeta[primaryGap.competencyCode]?.name}.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('resources')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            View Full Catalogue ({recommendations.length > 0 ? '50+' : '0'}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map(res => (
            <div
              key={res.external_id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between shadow-xs space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-indigo-50 text-indigo-700">
                    {res.resource_type}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {res.matchScore}% Match
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {res.description}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">Why Recommended:</span>
                  <span className="line-clamp-2">{res.whyRecommended}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{res.provider}</span>
                <button
                  onClick={() => window.open(res.resource_url, '_blank', 'noopener,noreferrer')}
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Open Resource <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
