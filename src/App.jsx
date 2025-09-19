import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { SocketProvider } from './context/SocketContext';
import { CLERK_PUBLISHABLE_KEY } from './utils/constants';

// Import your components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import DoctorsPage from './pages/DoctorsPage';
import CallPage from './pages/CallPage';
import Navbar from './components/layout/Navbar';
import Loading from './components/common/Loading';

// Handle missing Clerk key
if (!CLERK_PUBLISHABLE_KEY) {
  console.error('❌ Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
  throw new Error('Missing Clerk publishable key');
}

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        <SocketProvider>
          {children}
        </SocketProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <Router>
        <div className="min-h-screen bg-gray-50">
          <SignedIn>
            <Navbar />
          </SignedIn>
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            <Route path="/doctors" element={
              <ProtectedRoute>
                <DoctorsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/call/:doctorId" element={
              <ProtectedRoute>
                <CallPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
