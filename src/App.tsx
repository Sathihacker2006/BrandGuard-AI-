import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { NewDraftModal } from './components/common/NewDraftModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { BrandGuidelinesPage } from './pages/BrandGuidelinesPage';
import { ReferenceLibraryPage } from './pages/ReferenceLibraryPage';
import { DraftsPage } from './pages/DraftsPage';
import { ReviewStudioPage } from './pages/ReviewStudioPage';
import { FindingsExplorerPage } from './pages/FindingsExplorerPage';
import { HumanReviewCentrePage } from './pages/HumanReviewCentrePage';
import { RevisionHistoryPage } from './pages/RevisionHistoryPage';
import { GovernanceAnalyticsPage } from './pages/GovernanceAnalyticsPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { HackathonDocsPage } from './pages/HackathonDocsPage';
import { LandingPage } from './pages/LandingPage';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();

  if (activeView === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Navbar />
        <LandingPage />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-100 dark:bg-slate-950 text-neutral-900 dark:text-neutral-100 transition-colors overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />
        <main
          className={`flex-1 flex flex-col min-h-0 w-full min-w-0 bg-neutral-100 dark:bg-slate-950 ${
            activeView === 'studio' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          {activeView === 'dashboard' && <DashboardPage />}
          {activeView === 'workspaces' && <WorkspacesPage />}
          {activeView === 'guidelines' && <BrandGuidelinesPage />}
          {activeView === 'references' && <ReferenceLibraryPage />}
          {activeView === 'drafts' && <DraftsPage />}
          {activeView === 'studio' && <ReviewStudioPage />}
          {activeView === 'findings' && <FindingsExplorerPage />}
          {activeView === 'reviews' && <HumanReviewCentrePage />}
          {activeView === 'revisions' && <RevisionHistoryPage />}
          {activeView === 'analytics' && <GovernanceAnalyticsPage />}
          {activeView === 'audit' && <AuditHistoryPage />}
          {activeView === 'settings' && <HackathonDocsPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
      <CommandPalette />
      <NewDraftModal />
      <ToastContainer />
    </AppProvider>
  );
}
