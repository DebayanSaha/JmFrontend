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

  const [loginTriggered, setLoginTriggered] = useState(false);
 
  const navigate = useNavigate();

  const [initialPath] = useState(window.location.pathname);
 
  // Utility: Determine license status

  const evaluateLicense = (data) => {

    const now = new Date();

    const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;

    const paidEnd = data.paid_ends_at ? new Date(data.paid_ends_at) : null;
 
    if (paidEnd && paidEnd > now) return 'paid';

    if (trialEnd && trialEnd > now) return 'trial';

    return 'expired';

  };
 
  // 1️⃣ Auth initialization logic

  useEffect(() => {

    const initAuth = async () => {

      setNavigate(navigate);

      setLoading(true);
 
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      const storedUser = rememberMe

        ? localStorage.getItem('user')

        : sessionStorage.getItem('user');
 
      if (storedUser) {

        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);

        setLicenseStatus(evaluateLicense(parsedUser));

        localStorage.setItem('isAuthenticated', 'true');

      } else if (rememberMe) {

        try {

          await axiosInstance.post('/refresh'); // uses cookie for refresh

          const refreshedUser = JSON.parse(localStorage.getItem('user'));

          if (refreshedUser) {

            setUser(refreshedUser);

            setLicenseStatus(evaluateLicense(refreshedUser));

            localStorage.setItem('isAuthenticated', 'true');

          }

        } catch (err) {

          console.warn('Token refresh failed. Redirecting to login.');

          localStorage.clear();

          sessionStorage.clear();

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

  }, [navigate, loginTriggered]); // rerun on login
 
  // 2️⃣ Redirect root path `/` to `/login` after auth init

  useEffect(() => {

    if (!loading && window.location.pathname === '/') {

      navigate('/login', { replace: true });

    }

  }, [loading, navigate]);
 
  // 3️⃣ Handle login success

  const handleLoginSuccess = (userData) => {

    const rememberMe = localStorage.getItem('rememberMe') === 'true';
 
    if (rememberMe) {

      localStorage.setItem('user', JSON.stringify(userData));

    } else {

      sessionStorage.setItem('user', JSON.stringify(userData));

    }
 
    localStorage.setItem('isAuthenticated', 'true');

    setUser(userData);

    setLicenseStatus(evaluateLicense(userData));

    updateAuth();

    setLoginTriggered(prev => !prev); // trigger reauth
 
    const publicPaths = ['/login', '/signup', '/forgot-password', '/verified-popup'];

    const redirectTo = publicPaths.includes(initialPath) ? '/dashboard' : initialPath;
 
    navigate(redirectTo);

  };
 
  const isAuthenticated = !!user;
 
  // Prevent rendering until auth is determined

  if (loading) return null;
 
  return (
<Routes>

      {/* Public Routes */}
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
 
      {/* Protected App Layout */}
<Route element={<Layout licenseStatus={licenseStatus} />}>
<Route

          path="/dashboard"

          element={

            !isAuthenticated

              ? <Navigate to="/login" replace />

              : licenseStatus === 'expired'

                ? <Navigate to="/payment" replace />

                : <Dashboard />

          }

        />
<Route

          path="/intelligent-test-analysis"

          element={

            !isAuthenticated

              ? <Navigate to="/login" replace />

              : licenseStatus === 'expired'

                ? <Navigate to="/payment" replace />

                : <IntelligentTestAnalysis />

          }

        />
<Route

          path="/test-plan-generation"

          element={

            !isAuthenticated

              ? <Navigate to="/login" replace />

              : licenseStatus === 'expired'

                ? <Navigate to="/payment" replace />

                : <TestPlanGeneration />

          }

        />
<Route

          path="/run-test"

          element={

            !isAuthenticated

              ? <Navigate to="/login" replace />

              : licenseStatus === 'expired'

                ? <Navigate to="/payment" replace />

                : <RunTestPage />

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
 
      {/* Catch all routes */}
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="*" element={<Navigate to="/login" replace />} />
</Routes>

  );

};
 
export default AppRouter;