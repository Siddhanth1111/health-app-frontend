import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SocketProvider } from './context/SocketContext';

// Import pages
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import DoctorsPage from './pages/DoctorsPage';
import CallPage from './pages/CallPage';
import ProfilePage from './pages/ProfilePage';
import ConsultationsPage from './pages/ConsultationsPage';

// Import components
import Loading from './components/common/Loading';
import Header from './components/common/Header';  // Use your existing Header
import Footer from './components/common/Footer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Loading message="Loading..." />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </SocketProvider>
  );
};

// Public Route Component (for auth pages)
const PublicRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Loading message="Loading..." />;
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// Flexible Route (for homepage - works for both signed in and out)
const FlexibleRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Loading message="Loading..." />;
  }

  if (isSignedIn) {
    return (
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </SocketProvider>
    );
  }

  // For non-signed in users, show header with sign in/sign up options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <FlexibleRoute>
            <HomePage />
          </FlexibleRoute>
        } />
        
        <Route path="/sign-in/*" element={
          <PublicRoute>
            <SignInPage />
          </PublicRoute>
        } />
        
        <Route path="/sign-up/*" element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
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
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/consultations" element={
          <ProtectedRoute>
            <ConsultationsPage />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Page not found</p>
              <a 
                href="/dashboard" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
