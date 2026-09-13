import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { CompetencyCode, CompetencyScoreRecord } from '../../server/types.ts';
import { TrendingUp, ArrowUpRight, Award } from 'lucide-react';

interface CompetencyChartProps {
  scores: Record<CompetencyCode, CompetencyScoreRecord>;
  competenciesMeta: Record<CompetencyCode, { name: string; description: string }>;
  onSelectCompetency?: (code: CompetencyCode) => void;
}

export const CompetencyChart: React.FC<CompetencyChartProps> = ({
  scores,
  competenciesMeta,
  onSelectCompetency,
}) => {
  const radarData = Object.keys(scores).map((key) => {
    const code = key as CompetencyCode;
    const item = scores[code];
    const meta = competenciesMeta[code];
    return {
      subject: meta ? meta.name : code,
      score: item.score,
      benchmark: 75, // Junior Data Analyst target benchmark
      fullMark: 100,
    };
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Proficient':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-indigo-600';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getGapBadge = (gap: string) => {
    switch (gap) {
      case 'High gap':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Medium gap':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Radar Map */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Competency Radar Profile
          </h3>
          <span className="text-xs text-slate-500">Benchmark: 75</span>
        </div>
        <p className="text-xs text-slate-500 mb-4 w-full">
          Visual profile across the five core data analyst domains.
        </p>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val: any) => [`${val}/100`, 'Score']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Radar
                name="Target Benchmark"
                dataKey="benchmark"
                stroke="#cbd5e1"
                fill="#cbd5e1"
                fillOpacity={0.2}
              />
              <Radar
                name="Learner Score"
                dataKey="score"
                stroke="#4f46e5"
                fill="#6366f1"
                fillOpacity={0.45}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 text-xs mt-2 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span>
            <span>Your Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block"></span>
            <span>Target Benchmark</span>
          </div>
        </div>
      </div>

      {/* Horizontal Breakdown List */}
      <div className="lg:col-span-7 space-y-3">
        {Object.keys(scores).map((key) => {
          const code = key as CompetencyCode;
          const item = scores[code];
          const meta = competenciesMeta[code];
          const hasImproved = item.previousScore !== undefined && item.score > item.previousScore;
          const delta = item.previousScore !== undefined ? item.score - item.previousScore : 0;

          return (
            <div
              key={code}
              id={`competency-row-${code}`}
              onClick={() => onSelectCompetency?.(code)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">
                    {meta ? meta.name : code}
                  </h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getLevelColor(item.level)}`}>
                    Level {item.levelNumber}: {item.level}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getGapBadge(item.gapSeverity)}`}>
                    {item.gapSeverity}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasImproved && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +{delta}%
                    </span>
                  )}
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {item.score}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.score)}`}
                  style={{ width: `${Math.max(5, Math.min(100, item.score))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <p className="line-clamp-1 text-slate-500 pr-2">
                  {meta?.description}
                </p>
                <span className="shrink-0 text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-[11px]">
                  Target & Practice <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
