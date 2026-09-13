import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AssessmentPage } from './pages/AssessmentPage.tsx';
import { LearningPlanPage } from './pages/LearningPlanPage.tsx';
import { ResourcesPage } from './pages/ResourcesPage.tsx';
import { DocumentPracticePage } from './pages/DocumentPracticePage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { DoubtsChatPage } from './pages/DoubtsChatPage.tsx';
import { UserProfile, CompetencyCode } from '../server/types.ts';
import {
  resetAlexDemo,
  getMe,
  getSavedCredentials,
  loginLearner,
  logoutLearner,
} from './api/client.ts';
import { Brain, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [user, setUser] = useState<UserProfile>({
    id: 'alex-demo-user',
    name: 'Alex Rivera',
    email: 'alex@skillsetu.org',
    targetRole: 'Junior Data Analyst',
    educationLevel: 'Undergraduate Degree',
    learningGoal: 'Become job-ready for junior data-analysis projects',
    country: 'Global / International',
    createdAt: new Date().toISOString(),
    hasCompletedDiagnostic: true,
  });
  const [practiceCompetency, setPracticeCompetency] = useState<CompetencyCode | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [savedCredentialsExist, setSavedCredentialsExist] = useState(false);

  // Check saved credentials and active session on mount
  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved && saved.email) {
      setSavedCredentialsExist(true);
    }

    const initAuth = async () => {
      try {
        const me = await getMe();
        if (me?.user) {
          setUser(me.user);
          return;
        }

        // If saved credentials exist with password, auto-login
        if (saved && saved.email && saved.password) {
          const res = await loginLearner(saved.email, saved.password, true);
          setUser(res.user);
        }
      } catch {
        // Fallback to default demo user Alex
      }
    };

    initAuth();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newUser: UserProfile, shouldStartInitialAssessment: boolean) => {
    setUser(newUser);
    setSavedCredentialsExist(true);
    setRefreshKey(prev => prev + 1);

    if (shouldStartInitialAssessment) {
      // Conduct initial assignment to measure competency gap first
      setCurrentTab('assessment');
    } else {
      setCurrentTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutLearner();
    // Switch to Alex demo user
    setUser({
      id: 'alex-demo-user',
      name: 'Alex Rivera',
      email: 'alex@skillsetu.org',
      targetRole: 'Junior Data Analyst',
      educationLevel: 'Undergraduate Degree',
      learningGoal: 'Become job-ready for junior data-analysis projects',
      country: 'Global / International',
      createdAt: new Date().toISOString(),
      hasCompletedDiagnostic: true,
    });
    setRefreshKey(prev => prev + 1);
    setCurrentTab('landing');
  };

  const handleNavigateTab = (tab: string, context?: { competency?: CompetencyCode }) => {
    if (context?.competency) {
      setPracticeCompetency(context.competency);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAlex = async () => {
    try {
      await resetAlexDemo();
      setUser({
        id: 'alex-demo-user',
        name: 'Alex Rivera',
        email: 'alex@skillsetu.org',
        targetRole: 'Junior Data Analyst',
        educationLevel: 'Undergraduate Degree',
        learningGoal: 'Become job-ready for junior data-analysis projects',
        country: 'Global / International',
        createdAt: new Date().toISOString(),
        hasCompletedDiagnostic: true,
      });
      setRefreshKey(prev => prev + 1);
      setCurrentTab('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => handleNavigateTab(tab)}
        user={user}
        onResetAlex={handleResetAlex}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        savedCredentialsExist={savedCredentialsExist}
      />

      {/* Persistent Diagnostic Required Banner on non-assessment tabs for unassessed learners */}
      {user && !user.hasCompletedDiagnostic && currentTab !== 'assessment' && (
        <div className="bg-linear-to-r from-amber-500 to-indigo-600 text-white px-4 py-2.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Brain className="w-4 h-4 shrink-0" />
              <span>
                <strong>Initial Assignment Pending:</strong> Complete your 15-question diagnostic to benchmark your {user.targetRole} baseline and unlock personalized OER recommendations.
              </span>
            </div>
            <button
              onClick={() => handleNavigateTab('assessment')}
              className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg shadow-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Start Diagnostic Now &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentTab === 'landing' && (
          <LandingPage
            user={user}
            onExploreDashboard={() => handleNavigateTab('dashboard')}
            onStartAssessment={() => handleNavigateTab('assessment')}
            onGoToProfile={() => handleNavigateTab('profile')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            key={`dashboard-${refreshKey}`}
            userId={user.id}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'assessment' && (
          <AssessmentPage
            userId={user.id}
            userName={user.name}
            targetRole={user.targetRole}
            onComplete={() => {
              setRefreshKey(prev => prev + 1);
              handleNavigateTab('dashboard');
            }}
            onNavigateToRecommendations={() => {
              setRefreshKey(prev => prev + 1);
              handleNavigateTab('learning-plan');
            }}
          />
        )}

        {currentTab === 'learning-plan' && (
          <LearningPlanPage
            key={`plan-${refreshKey}`}
            userId={user.id}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'resources' && (
          <ResourcesPage
            userId={user.id}
          />
        )}

        {currentTab === 'practice' && (
          <DocumentPracticePage
            key={`practice-${refreshKey}-${practiceCompetency || 'default'}`}
            userId={user.id}
            initialCompetency={practiceCompetency}
            onCompetencyUpdated={() => {
              setRefreshKey(prev => prev + 1);
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            user={user}
            onUserUpdated={u => setUser(u)}
            onNavigateToDashboard={() => handleNavigateTab('dashboard')}
            onStartAssessment={() => handleNavigateTab('assessment')}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'doubts' && (
          <DoubtsChatPage
            key={`doubts-${refreshKey}`}
            userId={user.id}
            onNavigateToPractice={() => handleNavigateTab('practice')}
          />
        )}
      </main>

      {/* Floating Doubt Tutor Quick-Launcher (visible on other tabs) */}
      {currentTab !== 'doubts' && (
        <button
          id="floating-doubt-btn"
          onClick={() => handleNavigateTab('doubts')}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200/80 font-semibold text-xs tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-indigo-400/30"
          title="Ask doubts about uploaded study materials"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <MessageSquare className="w-4 h-4" />
          <span>Ask Doubt AI</span>
        </button>
      )}

      {/* Authentication & Onboarding Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
