import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axiosInstance, { setNavigate } from './api/axiosInstance';
import { updateAuth } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import IntelligentTestAnalysis from './pages/IntelligentTestAnalysis';
import TestPlanGeneration from './pages/TestPlanGeneration';
import RunTestPage from './pages/RunTestPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotAndResetPasswordPage from './pages/ForgotAndResetPasswordPage';
import VerifiedPopup from './components/VerifiedPopup';
import Layout from './Layout';
import PaymentPage from './pages/Payment/PaymentPage';
import ProfilePage from './pages/ProfilePage';

const AppRouter = () => {
  const [user, setUser] = useState(null);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Capture where the user originally intended to go
  const [initialPath] = useState(window.location.pathname);

  // ✅ 1. This one REPLACED with the new full logic
  useEffect(() => {
    const initAuth = async () => {
      setNavigate(navigate);

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      const evaluateLicense = (data) => {
        const now = new Date();
        const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
        const paidEnd = data.paid_ends_at ? new Date(data.paid_ends_at) : null;

        if (paidEnd && paidEnd > now) return 'paid';
        if (trialEnd && trialEnd > now) return 'trial';
        return 'expired';
      };

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setLicenseStatus(evaluateLicense(parsedUser));
        localStorage.setItem('isAuthenticated', 'true');
      } else if (rememberMe) {
        try {
          const res = await axiosInstance.post('/refresh', {}, { withCredentials: true });
          const newToken = res.data.access_token;

          if (newToken) {
            localStorage.setItem('token', newToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            if (userData) {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              setLicenseStatus(evaluateLicense(parsedUser));
              localStorage.setItem('isAuthenticated', 'true');
            }
          }
        } catch (err) {
          console.warn('Token refresh failed. Redirecting to login.');
          localStorage.clear();
          setUser(null);
          setLicenseStatus(null);
        }
      } else {
        localStorage.removeItem('isAuthenticated');
        setUser(null);
        setLicenseStatus(null);
      }

      setLoading(false);
    };

    initAuth();
  }, [navigate]);

  // ✅ 2. This one REMAINS AS IS
  useEffect(() => {
    if (!loading && window.location.pathname === '/') {
      console.log('Redirecting from root to login...');
      navigate('/login', { replace: true });
    }
  }, [loading, navigate]);


  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');

    const now = new Date();
    const trialEnd = userData.trial_ends_at ? new Date(userData.trial_ends_at) : null;
    const paidEnd = userData.paid_ends_at ? new Date(userData.paid_ends_at) : null;

    const license = paidEnd && paidEnd > now
      ? 'paid'
      : trialEnd && trialEnd > now
        ? 'trial'
        : 'expired';

    setLicenseStatus(license);

    // Update AuthContext immediately after login
    updateAuth();

    const publicPaths = ['/login', '/signup', '/forgot-password', '/verified-popup'];
    const redirectTo = publicPaths.includes(initialPath) ? '/dashboard' : initialPath;

    navigate(redirectTo);
  };

  const isAuthenticated = !!user;

  console.log('AppRouter render - isAuthenticated:', isAuthenticated, 'loading:', loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated
            ? <LoginPage onLoginSuccess={handleLoginSuccess} />
            : <Navigate to="/dashboard" replace />
        }
      />
      <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotAndResetPasswordPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/verified-popup" element={<VerifiedPopup />} />

      {/* Main app routes - protected */}
      <Route element={<Layout licenseStatus={licenseStatus} />}>
        <Route
          path="/dashboard"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : (licenseStatus === 'expired'
                ? <Navigate to="/payment" replace />
                : <Dashboard />)
          }
        />
        <Route
          path="/intelligent-test-analysis"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : (licenseStatus === 'expired'
                ? <Navigate to="/payment" replace />
                : <IntelligentTestAnalysis />)
          }
        />
        <Route
          path="/test-plan-generation"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : (licenseStatus === 'expired'
                ? <Navigate to="/payment" replace />
                : <TestPlanGeneration />)
          }
        />
        <Route
          path="/run-test"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : (licenseStatus === 'expired'
                ? <Navigate to="/payment" replace />
                : <RunTestPage />)
          }
        />
        <Route
          path="/payment"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : <PaymentPage />
          }
        />
        <Route
          path="/profile"
          element={
            !isAuthenticated
              ? <Navigate to="/login" replace />
              : <ProfilePage />
          }
        />
      </Route>

      {/* Default route - redirect to login */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      {/* Catch all other routes and redirect to login */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRouter; 