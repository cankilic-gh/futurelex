/**
 * FUTURELEX - LOCAL FIRST APP
 *
 * No more waiting for Firebase!
 * App loads instantly from local storage.
 * Users can start learning immediately.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalFirstProvider, useLocalFirst } from './context/LocalFirstContext';
import { AuthProvider } from './context/AuthContext';
import { FlashcardSession } from './pages/FlashcardSession';
import { Dashboard } from './pages/Dashboard';
import { PlanManager } from './pages/PlanManager';
import { Auth } from './pages/Auth';
import { SyncIndicator } from './components/ui/SyncIndicator';

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
      {/* Sync status indicator (top-right corner) */}
      <SyncIndicator />

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
