/**
 * FUTURELEX - LOCAL FIRST APP
 *
 * No more waiting for Firebase!
 * App loads instantly from local storage.
 * Users can start learning immediately.
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalFirstProvider, useLocalFirst } from './context/LocalFirstContext';
import { AuthProvider } from './context/AuthContext';
import { SyncIndicator } from './components/ui/SyncIndicator';
import { Navbar } from './components/Layout/Navbar';
import { Background } from './components/Layout/Background';

// Lazy load pages for faster navigation
const FlashcardSession = React.lazy(() => import('./pages/FlashcardSession').then(m => ({ default: m.FlashcardSession })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PlanManager = React.lazy(() => import('./pages/PlanManager').then(m => ({ default: m.PlanManager })));
const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));

// Simple wrapper to check if user has plans
const RequirePlan: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activePlan } = useLocalFirst();

  if (!activePlan) {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  const { isReady } = useLocalFirst();

  // App is always ready with local-first approach!
  // No loading screen needed anymore.

  return (
    <>
      {/* Global Background - stays during navigation */}
      <Background />

      {/* Global Navbar - stays during navigation */}
      <Navbar />

      {/* Sync status indicator (top-right corner) */}
      <SyncIndicator />

      <Suspense fallback={null}>
        <Routes>
          {/* Default: go to learn if has plan, otherwise plans */}
          <Route path="/" element={<Navigate to="/learn" replace />} />

          {/* Plan Manager - create/manage learning plans */}
          <Route path="/plans" element={<PlanManager />} />

          {/* Learn - flashcard session */}
          <Route
            path="/learn"
            element={
              <RequirePlan>
                <FlashcardSession />
              </RequirePlan>
            }
          />

          {/* Dashboard - progress & stats */}
          <Route
            path="/dashboard"
            element={
              <RequirePlan>
                <Dashboard />
              </RequirePlan>
            }
          />

          {/* Auth page - login/signup for cloud sync */}
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  // Hide the HTML instant loader
  React.useEffect(() => {
    const loader = document.getElementById('instant-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <LocalFirstProvider>
          <AppContent />
        </LocalFirstProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
