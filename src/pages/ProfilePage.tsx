import React, { useState } from 'react';
import {
  createUser,
  updateUserProfile,
  resetAlexDemo,
  getSavedCredentials,
  saveCredentials,
} from '../api/client.ts';
import { UserProfile } from '../../server/types.ts';
import {
  User,
  Sparkles,
  Target,
  Globe,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Bookmark,
  ShieldCheck,
  Brain,
  LogIn,
  LogOut,
  Mail,
  Clock
} from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile | null;
  onUserUpdated: (u: UserProfile) => void;
  onNavigateToDashboard: () => void;
  onStartAssessment?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUserUpdated,
  onNavigateToDashboard,
  onStartAssessment,
  onOpenAuth,
  onLogout,
}) => {
  const [name, setName] = useState(user ? user.name : 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex@skillsetu.org');
  const [targetRole, setTargetRole] = useState(user ? user.targetRole : 'Junior Data Analyst');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Undergraduate Degree');
  const [learningGoal, setLearningGoal] = useState(
    user ? user.learningGoal : 'Become job-ready for data-analysis projects'
  );
  const [country, setCountry] = useState(user ? user.country : 'Global / International');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const savedCreds = getSavedCredentials();
  const [savedLocally, setSavedLocally] = useState(!!savedCreds);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      if (user?.id) {
        const updated = await updateUserProfile(user.id, {
          name,
          email,
          targetRole,
          educationLevel,
          learningGoal,
          country,
        });
        onUserUpdated(updated);
      } else {
        const updated = await createUser({
          name,
          targetRole,
          learningGoal,
          country,
        });
        onUserUpdated(updated);
      }
      setSuccessMsg('Learner profile and target role saved successfully.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSaveCredentials = () => {
    if (savedLocally) {
      saveCredentials(null);
      setSavedLocally(false);
      setSuccessMsg('Saved credentials removed from this device.');
    } else {
      saveCredentials({
        email: email || 'alex@skillsetu.org',
        password: 'password123',
        rememberMe: true,
      });
      setSavedLocally(true);
      setSuccessMsg('Login credentials saved securely to this browser device.');
    }
  };

  const handleResetAlex = async () => {
    setSaving(true);
    try {
      await resetAlexDemo();
      setName('Alex Rivera');
      setEmail('alex@skillsetu.org');
      setTargetRole('Junior Data Analyst');
      setEducationLevel('Undergraduate Degree');
      setLearningGoal('Become job-ready for data-analysis projects');
      setCountry('Global / International');
      setSuccessMsg('Profile reset to demo persona Alex with baseline scores.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Account Status Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{name}</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  {targetRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Switch Account
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Credentials & Diagnostic Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-600" /> Device Credentials
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  savedLocally
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {savedLocally ? 'Credentials Saved' : 'Not Saved'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {savedLocally
                ? 'Your login details are stored on this device for seamless automatic authentication.'
                : 'Save credentials on this device to skip manual login on next session.'}
            </p>
            <button
              type="button"
              onClick={handleToggleSaveCredentials}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
            >
              {savedLocally ? 'Remove saved credentials' : 'Save credentials on this device'}
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" /> Initial Diagnostic
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  user?.hasCompletedDiagnostic
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {user?.hasCompletedDiagnostic ? 'Competencies Measured' : 'Diagnostic Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {user?.hasCompletedDiagnostic
                ? 'Your 15-question baseline competency diagnostic is complete. You can retake it anytime.'
                : 'Complete the initial diagnostic assignment to calibrate your exact skill gaps.'}
            </p>
            {onStartAssessment && (
              <button
                type="button"
                onClick={onStartAssessment}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer flex items-center gap-1"
              >
                {user?.hasCompletedDiagnostic ? 'Retake Diagnostic →' : 'Take Initial Assignment →'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-indigo-600">
              Profile Calibration
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 font-display">
              Learner Details & Goals
            </h1>
            <p className="text-xs text-slate-500">
              Personalize your target professional role and competency benchmarks.
            </p>
          </div>

          <button
            onClick={handleResetAlex}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Alex Demo
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Learner Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Professional Role
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  required
                  placeholder="e.g. Junior Data Analyst"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Educational Background
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={educationLevel}
                  onChange={e => setEducationLevel(e.target.value)}
                  placeholder="e.g. Undergraduate, Bootcamp"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Learning Goal
            </label>
            <input
              type="text"
              value={learningGoal}
              onChange={e => setLearningGoal(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Geographic Scope
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>

            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
