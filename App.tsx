/**
 * FUTURELEX - FIREBASE SYNCED APP
 *
 * Plans and progress sync to Firebase.
 * Data persists across devices when logged in.
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlanProvider, usePlan } from './context/PlanContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Background } from './components/Layout/Background';

// Lazy load pages for faster navigation
const FlashcardSession = React.lazy(() => import('./pages/FlashcardSession').then(m => ({ default: m.FlashcardSession })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PlanManager = React.lazy(() => import('./pages/PlanManager').then(m => ({ default: m.PlanManager })));
const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));

// Simple wrapper to check if user has plans
const RequirePlan: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activePlan, plans, loading, isReady } = usePlan();

  console.log('[RequirePlan] State:', { loading, isReady, activePlan: activePlan?.name, plansCount: plans.length });

  // Wait for plans to load
  if (loading) {
    console.log('[RequirePlan] Still loading, returning null');
    return null;
  }

  if (!activePlan) {
    console.log('[RequirePlan] No active plan, redirecting to /plans');
    return <Navigate to="/plans" replace />;
  }

  console.log('[RequirePlan] Rendering children with plan:', activePlan.name);
  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  const { isReady } = usePlan();

  return (
    <>
      {/* Global Background - stays during navigation */}
      <Background />

      {/* Global Navbar - stays during navigation */}
      <Navbar />

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
        <PlanProvider>
          <AppContent />
        </PlanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
