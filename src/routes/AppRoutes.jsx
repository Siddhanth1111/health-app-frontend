import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import HomePage from '../pages/HomePage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import DashboardPage from '../pages/DashboardPage';
import DoctorsPage from '../pages/DoctorsPage';
import CallPage from '../pages/CallPage';
import ProfilePage from '../pages/ProfilePage';
import ConsultationsPage from '../pages/ConsultationsPage';
import OnboardingPage from '../pages/OnboardingPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <>
          <SignedIn>
            <MainLayout />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="consultations" element={<ConsultationsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Call Route (Full Screen) */}
      <Route path="/call/:doctorId" element={
        <>
          <SignedIn>
            <CallPage />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
