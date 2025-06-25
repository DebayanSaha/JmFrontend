import React, { useState } from 'react';
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
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    updateAuth();
    navigate('/dashboard');
  };

  // New: handle logout to clear user and redirect
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    updateAuth();
    navigate('/login');
  };

  // If not logged in, only allow login, signup, forgot-password, verified-popup
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotAndResetPasswordPage />} />
        <Route path="/verified-popup" element={<VerifiedPopup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in, show the full app
  return (
    <Routes>
      <Route element={<Layout licenseStatus={null} onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intelligent-test-analysis" element={<IntelligentTestAnalysis />} />
        <Route path="/test-plan-generation" element={<TestPlanGeneration />} />
        <Route path="/run-test" element={<RunTestPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter; 