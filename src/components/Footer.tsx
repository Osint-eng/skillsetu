import React from 'react';
import { ShieldCheck, Globe, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                SS
              </div>
              <span className="font-bold text-lg text-white font-display">SkillSetu</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              International AI-powered education platform and competency coach.
              Discover what to learn next through diagnostic evidence, explore curated
              open educational resources, and prove measurable improvement with source-grounded practice.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Global Public OER
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Evidence-Based Scoring
              </span>
            </div>
          </div>

          {/* Col 2: Core Competencies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Competencies
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Python Basics</li>
              <li>• Data Handling & Cleaning</li>
              <li>• Statistics & Inference</li>
              <li>• Data Visualization</li>
              <li>• Data Privacy & Ethics</li>
            </ul>
          </div>

          {/* Col 3: Resource Providers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Open Educational Providers
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• OER Commons Catalogue</li>
              <li>• MIT OpenCourseWare</li>
              <li>• OpenStax Textbooks</li>
              <li>• Creative Commons Open Curricula</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Privacy & Compliance Notice */}
        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 mb-8 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Document Processing & Content Privacy Notice</span>
          </div>
          <p className="leading-relaxed">
            Uploaded documents are processed to extract text and generate source-grounded practice questions.
            Users should upload only material they are permitted to process. Metadata and citations are preserved
            to attribute original authors. SkillSetu connects learners directly to public educational sources and does
            not republish copyrighted courseware.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSetu. Discover what to learn next. Prove that you improved.</p>
          <p className="flex items-center gap-1">
            Built for Junior Data Analysts & Self-Directed Learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
