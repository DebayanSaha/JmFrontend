import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, LogIn, MailCheck
} from 'lucide-react';
import '../App.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('savedEmail');
    if (rememberMe && savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
  setIsSubmitting(true);
  setStatus({});

  try {
    // ✅ Include rememberMe in the request payload
    const response = await axiosInstance.post("/login", {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe, // let backend handle token validity
    });

    const { access_token: token, user } = response.data;

    if (token && user) {
      // ✅ Always store in localStorage now
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("rememberMe", data.rememberMe ? "true" : "false");
      localStorage.setItem("savedEmail", data.email);

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      reset();
      onLoginSuccess(user, token);
    } else {
      setStatus({ type: "error", message: "Invalid server response." });
    }

  } catch (error) {
    const res = error.response;

    if (res?.status === 403 && res?.data?.error === "Email not verified.") {
      setCurrentEmail(data.email);
      setShowVerifyModal(true);
      setStatus({ type: "error", message: "Please verify your email." });
    } else if (res?.status === 401) {
      setStatus({ type: "error", message: "Invalid email or password." });
    } else {
      setStatus({
        type: "error",
        message: res?.data?.error || "Login failed. Please try again.",
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};




  const resendVerification = async () => {
    setResending(true);
    setEmailSent(false);
    setStatus({});
 
    try {
      const res = await axiosInstance.post("/resend-verification", {
        email: currentEmail,
      });

      if (res.data.message) {
        setEmailSent(true);
      } else {
        setStatus({ type: 'error', message: 'Unexpected server response.' });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.error || 'Failed to send verification email.',
      });
    } finally {
      setResending(false);
      reset();
    }
  };
  return (
    <>
      <div className="auth-bg-animated"></div>
      <div className="auth-bg-blur"></div>
      <div className="auth-bg-particles">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-icon"><LogIn size={24} /></div>
            <h1 className="signup-title">Welcome Back</h1>
            <p className="signup-subtitle">Sign in to your account</p>
          </div>

          {status.message && (
            <div className={`auth-status ${status.type}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  {...register("email", { required: "Email is required" })}
                  className={`form-input has-left-icon ${errors.email ? 'invalid' : ''}`}
                  disabled={isSubmitting}
                />
                <Mail className="input-icon" size={18} />
              </div>
              {errors.email && (
                <div className="text-error"><AlertCircle size={14} /> {errors.email.message}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                  className={`form-input has-both-icons ${errors.password ? 'invalid' : ''}`}
                  disabled={isSubmitting}
                />
                <Lock className="input-icon" size={18} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" tabIndex="-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="text-error"><AlertCircle size={14} /> {errors.password.message}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="forgot-password"
              disabled={isSubmitting}
            >
              Forgot password?
            </button>

            <div className="remember-me-row">
              <input
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              className="custom-button"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#00c6ff' : undefined,
                color: '#fff',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(0,198,255,0.2)',
                transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="auth-link" disabled={isSubmitting}>
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <MailCheck className="modal-icon" />
            <h3 className="modal-heading">
              {emailSent ? 'Email Sent!' : 'Verify Your Email'}
            </h3>
            <p className="modal-text">
              {emailSent ? (
                <>Please check your inbox to verify your email address sent to <strong>{currentEmail}</strong>.</>
              ) : (
                <>Your email <strong>{currentEmail}</strong> is not verified.</>
              )}
            </p>

            {/* Only show one button depending on the state */}
            {emailSent ? (
              <button
                className="modal-ok-button"
                onClick={() => {
                  setShowVerifyModal(false);
                  setEmailSent(false);
                  setCurrentEmail('');
                }}
              >
                OK
              </button>
            ) : (
              <button
                className="modal-ok-button"
                onClick={resendVerification}
                disabled={resending}
              >
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default LoginPage;
