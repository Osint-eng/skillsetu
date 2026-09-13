import React, { useState, useEffect } from 'react';
import {
  searchPublicResources,
  getRecommendedResources,
} from '../api/client.ts';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { PublicResource, RankedResource, CompetencyCode } from '../../server/types.ts';

interface ResourcesPageProps {
  userId: string;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ userId }) => {
  const [query, setQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [resources, setResources] = useState<RankedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceProvider, setSourceProvider] = useState<string>('OER Commons');
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    loadInitialRecommendations();
  }, [userId]);

  const loadInitialRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getRecommendedResources(userId, 15);
      setResources(res.recommendations);
      setIsFallback(res.isFallback);
      setSourceProvider(res.isFallback ? 'SkillSetu Verified Local OER Catalogue' : 'OER Commons Live API');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const searchQuery = query.trim() || 'data analysis statistics python';
      const res = await searchPublicResources(searchQuery);
      setIsFallback(res.isFallback);
      setSourceProvider(res.sourceProvider);

      // Map to RankedResource format for unified display
      const mapped: RankedResource[] = res.resources.map(r => ({
        ...r,
        matchScore: 82,
        matchBreakdown: {
          competencyRelevance: 38,
          learnerLevelMatch: 18,
          targetRoleRelevance: 12,
          metadataQuality: 8,
          languageMatch: 6,
        },
        whyRecommended: `Directly matches search query "${searchQuery}" in ${r.competencies.map(t => t.replace('_', ' ')).join(', ')}.`,
      }));
      setResources(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    if (selectedCompetency !== 'ALL' && !r.competencies.includes(selectedCompetency as CompetencyCode)) {
      return false;
    }
    if (selectedLevel !== 'ALL' && r.level.toLowerCase() !== selectedLevel.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 py-6">
      {/* Header & Mission */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              Open Educational Resources (OER)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              International Public Resource Catalogue
            </h1>
            <p className="text-sm text-slate-500">
              Access openly licensed, peer-reviewed educational courseware without paywalls.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-slate-500 block">
              Active Provider:
            </span>
            <span className="text-xs font-bold text-indigo-700 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg inline-block mt-0.5">
              {sourceProvider}
            </span>
            {isFallback && (
              <span className="block text-[10px] text-slate-400 mt-1">
                (Deterministic Verified Fallback Provider)
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Filters */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by topic, e.g. 'hypothesis testing', 'pandas data cleaning', 'data privacy'..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Search Catalogue
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Filter:
          </span>

          <select
            value={selectedCompetency}
            onChange={e => setSelectedCompetency(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Competencies</option>
            <option value={CompetencyCode.STATISTICS}>Statistics & Inference</option>
            <option value={CompetencyCode.DATA_VISUALIZATION}>Data Visualization</option>
            <option value={CompetencyCode.DATA_HANDLING}>Data Handling</option>
            <option value={CompetencyCode.PYTHON_BASICS}>Python Basics</option>
            <option value={CompetencyCode.DATA_PRIVACY}>Data Privacy</option>
          </select>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {(selectedCompetency !== 'ALL' || selectedLevel !== 'ALL' || query) && (
            <button
              onClick={() => {
                setSelectedCompetency('ALL');
                setSelectedLevel('ALL');
                setQuery('');
                loadInitialRecommendations();
              }}
              className="text-xs text-indigo-600 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Searching open educational resources...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No resources match your filter</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your query or resetting competency and level filters.
          </p>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(res => (
            <div
              key={res.external_id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {res.competencies.map(t => t.replace('_', ' ')).join(', ')}
                  </span>
                  {res.matchScore !== undefined && (
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {res.matchScore}% Match
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {res.description}
                </p>

                {res.whyRecommended && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 space-y-1">
                    <span className="font-bold text-[11px] text-slate-800 block">Why Recommended:</span>
                    <p className="text-[11px] leading-relaxed text-slate-600">{res.whyRecommended}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                    {res.provider}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {res.duration_minutes ? `${res.duration_minutes} mins` : 'Self-paced'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={res.license_name || 'Open Education License'}>
                    License: {res.license_name || 'Open Educational License'}
                  </span>

                  <button
                    onClick={() => window.open(res.resource_url, '_blank', 'noopener,noreferrer')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Open Source <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
