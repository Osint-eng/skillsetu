import React, { useState, useEffect } from 'react';
import { getLearningPlan, LearningPlanResponse } from '../api/client.ts';
import {
  Compass,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileCheck2,
  ExternalLink,
  Target,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { CompetencyCode } from '../../server/types.ts';

interface LearningPlanPageProps {
  userId: string;
  onNavigateTab: (tab: string, context?: any) => void;
}

export const LearningPlanPage: React.FC<LearningPlanPageProps> = ({
  userId,
  onNavigateTab,
}) => {
  const [plan, setPlan] = useState<LearningPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlan();
  }, [userId]);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLearningPlan(userId);
      setPlan(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">
          Generating personalized learning plan & prioritizing competency gaps...
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-xl mx-auto py-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-bold text-rose-900">Learning Plan Error</h3>
        <p className="text-sm text-rose-700">{error || 'Unable to build plan'}</p>
        <button
          onClick={loadPlan}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              Target Pathway: {plan.targetRole}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Personalized Competency Learning Plan
            </h1>
            <p className="text-sm text-slate-500">
              Structured sequence of gaps prioritized by diagnostic severity and market demand.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('practice', { competency: plan.primaryGap.competencyCode })}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" /> Practice Primary Gap
          </button>
        </div>

        {/* AI Actionable Advice Banner */}
        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Strategic AI Recommendation
            </span>
            <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-medium">
              {plan.actionableAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* Prioritized Competency Sequence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Prioritized Learning Milestones
          </h2>
          <span className="text-xs text-slate-500">Ranked by lowest proficiency score</span>
        </div>

        <div className="space-y-3">
          {plan.prioritizedGaps.map((item, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={item.competencyCode}
                className={`p-5 bg-white rounded-xl border ${
                  isTop ? 'border-indigo-300 ring-2 ring-indigo-500/15' : 'border-slate-200'
                } shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isTop
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{item.priorityRank}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.score < 40
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.score < 65
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.level} ({item.score}/100)
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.gapSeverity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Target qualification requires score of ≥75%.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onNavigateTab('resources')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Resources
                  </button>
                  <button
                    onClick={() => onNavigateTab('practice', { competency: item.competencyCode })}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Practice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended OER Curated Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Curated Public Resources for Priority Gap
          </h2>
          <button
            onClick={() => onNavigateTab('resources')}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explore all resources <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.topResources.map(res => (
            <div
              key={res.external_id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {res.resource_type}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {res.matchScore}% Match
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {res.description}
                </p>
                <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">Why Recommended:</span>
                  <p className="text-[11px] leading-relaxed line-clamp-2">{res.whyRecommended}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[150px]">{res.provider}</span>
                <button
                  onClick={() => window.open(res.resource_url, '_blank', 'noopener,noreferrer')}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Access Module <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
