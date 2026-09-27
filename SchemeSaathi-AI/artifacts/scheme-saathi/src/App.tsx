import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import LandingPage from '@/pages/LandingPage';
import { AdminPage, AssistantPage, AuthPage, CalculatorPage, ComparePage, DashboardPage, DprGeneratorPage, DocumentsPage, ProfilePage, RecommendationsPage, RoadmapPage, SchemeDetailsPage, WizardPage } from '@/pages/pages';
import { KnowledgePortalPage, AdminKnowledgePortalPage, AdminImportSchemesPage } from '@/pages/KnowledgePortalPage';
import UdyamDataPage from '@/pages/UdyamDataPage';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function RootPage() {
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('schemesaathi_session_token'));
  if (hasToken) {
    return <DashboardPage />;
  }
  return <LandingPage />;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={RootPage} />
          <Route path="/landing" component={LandingPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/udyam" component={UdyamDataPage} />
          <Route path="/knowledge-portal" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/schemes" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/schemes/:schemeId" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/finance" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/incubators" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/accelerators" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/mentorship" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/training" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/business-services" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/resources" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/saved" component={KnowledgePortalPage} />
          <Route path="/knowledge-portal/matches" component={KnowledgePortalPage} />
          <Route path="/admin/knowledge-portal" component={AdminKnowledgePortalPage} />
          <Route path="/admin/import-schemes" component={AdminImportSchemesPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/wizard" component={WizardPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/recommendations" component={RecommendationsPage} />
          <Route path="/calculator" component={CalculatorPage} />
          <Route path="/roadmap" component={RoadmapPage} />
          <Route path="/dpr" component={DprGeneratorPage} />
          <Route path="/schemes/:schemeId" component={SchemeDetailsPage} />
          <Route path="/compare" component={ComparePage} />
          <Route path="/documents" component={DocumentsPage} />
          <Route path="/assistant" component={AssistantPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

import { LanguageProvider } from '@/lib/i18n';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
