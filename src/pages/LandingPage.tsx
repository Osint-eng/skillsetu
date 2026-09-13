import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Brain,
  FileCheck2,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Layers,
  BookOpen,
  UserCheck,
  Award,
  Zap,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../../server/types.ts';

interface LandingPageProps {
  onStartAssessment: () => void;
  onExploreDashboard: () => void;
  onGoToProfile: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  user: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAssessment,
  onExploreDashboard,
  onGoToProfile,
  onOpenAuth,
  user,
}) => {
  const isAlex = user?.id === 'alex-demo-user';
  const hasCompleted = user?.hasCompletedDiagnostic;

  const coreWorkflow = [
    {
      step: '01',
      title: 'Profile & Goal Calibration',
      subtitle: 'Target Role Setup',
      desc: 'Capture educational background, career goals, and junior data-analyst benchmark targets.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Initial Diagnostic Assignment',
      subtitle: 'Evidence-Based Test',
      desc: '15 scenario-based questions across Python, Data Handling, Statistics, Viz & Privacy.',
      icon: Brain,
    },
    {
      step: '03',
      title: 'Competency Gap Measurement',
      subtitle: 'Rigor Without Hallucination',
      desc: 'Deterministic rubric calculates severity (High, Medium, Low) and readiness score.',
      icon: BarChart3,
    },
    {
      step: '04',
      title: 'Curated OER Recommendations',
      subtitle: 'Global Public Learning',
      desc: 'Ranked learning materials from OpenStax, MIT OCW, and public textbooks matched to gaps.',
      icon: BookOpen,
    },
    {
      step: '05',
      title: 'Source-Grounded Practice',
      subtitle: 'Verifiable RAG Proof',
      desc: 'Practice on permitted documents with page-level citations to prove skill improvement.',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Competency Architecture & Learning Navigator
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight text-white">
            Discover what to learn next.{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-sky-200 to-emerald-300">
              Prove that you improved.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            SkillSetu bridges open educational repositories and real technical qualifications.
            Assess your competency baseline, pinpoint exact skill gaps, and access curated,
            ranked open educational resources with verified proof of progress.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {user ? (
              <>
                {user.hasCompletedDiagnostic ? (
                  <button
                    id="hero-btn-explore-dashboard"
                    onClick={onExploreDashboard}
                    className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Open Learner Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="hero-btn-take-initial-assignment"
                    onClick={onStartAssessment}
                    className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Take Initial Assignment <Brain className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="hero-btn-explore-alex"
                  onClick={onExploreDashboard}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  Explore Dashboard View
                </button>
              </>
            ) : (
              <>
                <button
                  id="hero-btn-get-started"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  Create Account & Take Initial Assignment <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-btn-sign-in"
                  onClick={() => onOpenAuth('login')}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}

            <button
              id="hero-btn-retake-diagnostic"
              onClick={onStartAssessment}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-4 py-2 cursor-pointer"
            >
              Take 15-Question Diagnostic Directly
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
            <div>
              <p className="text-xl font-bold text-white">5 Core</p>
              <p className="text-xs text-slate-400">Analyst Competencies</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">100% OER</p>
              <p className="text-xs text-slate-400">Open Public Learning</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">Zero AI Hallucination</p>
              <p className="text-xs text-slate-400">Page-level Grounded RAG</p>
            </div>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </section>

      {/* Structured Competency Pipeline */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Engineered Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              The Continuous Competency Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            A closed-loop learning cycle designed specifically to eliminate guesswork and prove measurable skill progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {coreWorkflow.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{step.title}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Impact Comparison: Traditional Learning vs SkillSetu */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Problem */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">The Problem Learners Face</h3>
              <p className="text-xs text-slate-500">Why passive tutorial-watching fails</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Unmeasured Blind Spots:</strong> Learners don't know which specific sub-competency (e.g. hypothesis testing vs data cleaning) prevents them from passing technical screenings.
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Content-Level Mismatch:</strong> Wasting months on irrelevant 40-hour introductory courses when they only need targeted intermediate practice.
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Zero Verifiable Proof:</strong> Completion badges reward video playback time instead of real competency mastery.
              </div>
            </div>
          </div>
        </div>

        {/* The SkillSetu Solution */}
        <div className="p-8 bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">The SkillSetu Solution</h3>
              <p className="text-xs text-indigo-300">Empirical, evidence-based learning</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-white">Diagnostic Precision:</strong> Rigorous 15-question benchmark produces clear scores and prioritized gap severity.
              </div>
            </div>

            <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-white">Ranked International OER:</strong> Connects directly to verified public educational materials with transparent scoring criteria.
              </div>
            </div>

            <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-white">Document-Grounded Practice:</strong> Generates quiz items anchored to exact textbook pages, updating scores with Bayesian evidence weighting.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Demo Persona Spotlight: Alex Rivera */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Alex Rivera</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Pre-Seeded Demo Persona
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Target Role: <strong>Junior Data Analyst</strong> | Goal: Job-ready for project qualification
              </p>
            </div>
          </div>

          <button
            onClick={onExploreDashboard}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Launch Alex's Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block">Python Basics</span>
            <span className="text-xl font-extrabold text-indigo-700">78%</span>
            <span className="text-[10px] text-emerald-600 block font-semibold mt-1">Proficient</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block">Data Handling</span>
            <span className="text-xl font-extrabold text-slate-800">55%</span>
            <span className="text-[10px] text-amber-600 block font-semibold mt-1">Developing (Gap 3)</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
            <span className="text-xs text-rose-800 font-bold block">Statistics</span>
            <span className="text-xl font-extrabold text-rose-700">38%</span>
            <span className="text-[10px] text-rose-700 font-bold block mt-1">Primary Gap #1</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
            <span className="text-xs text-rose-800 font-bold block">Data Visualization</span>
            <span className="text-xl font-extrabold text-rose-700">42%</span>
            <span className="text-[10px] text-rose-700 font-bold block mt-1">High Gap #2</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block">Data Privacy</span>
            <span className="text-xl font-extrabold text-slate-800">61%</span>
            <span className="text-[10px] text-amber-600 block font-semibold mt-1">Developing</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <p>
            * <strong>Alex's Priority Gaps:</strong> Statistics (38%) and Data Visualization (42%).
            Reviewing recommended OER and practicing on permitted PDF materials elevates competency to over 60%.
          </p>
          <button
            onClick={() => onOpenAuth('register')}
            className="text-indigo-600 hover:text-indigo-800 font-bold whitespace-nowrap cursor-pointer"
          >
            Create Your Own Profile →
          </button>
        </div>
      </section>
    </div>
  );
};
