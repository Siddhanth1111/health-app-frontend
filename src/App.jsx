import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

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
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import IncomingCallModal from './components/video/IncomingCallModal';

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return <Loading message="Loading..." />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            <Route path="/sign-in/*" element={
              isSignedIn ? <Navigate to="/dashboard" replace /> : <SignInPage />
            } />
            
            <Route path="/sign-up/*" element={
              isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />
            } />

            {/* Protected Routes */}
            <Route path="/onboarding" element={
              isSignedIn ? <OnboardingPage /> : <Navigate to="/sign-in" replace />
            } />
            
            <Route path="/dashboard" element={
              isSignedIn ? <DashboardPage /> : <Navigate to="/sign-in" replace />
            } />
            
            <Route path="/doctors" element={
              isSignedIn ? <DoctorsPage /> : <Navigate to="/sign-in" replace />
            } />
            
            <Route path="/call/:doctorId" element={
              isSignedIn ? <CallPage /> : <Navigate to="/sign-in" replace />
            } />
            
            <Route path="/profile" element={
              isSignedIn ? <ProfilePage /> : <Navigate to="/sign-in" replace />
            } />
            
            <Route path="/consultations" element={
              isSignedIn ? <ConsultationsPage /> : <Navigate to="/sign-in" replace />
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
        </main>
        <Footer />
        
        {/* Global Incoming Call Modal */}
        <IncomingCallModal />
      </div>
    </Router>
  );
}

export default App;
