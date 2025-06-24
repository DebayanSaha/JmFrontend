import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Info, XCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

const VerifiedPopup = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState(null);
  const [iconColor, setIconColor] = useState('');

  useEffect(() => {
    switch (status) {
      case 'success':
        setMessage('Your email has been successfully verified!');
        setIcon(<CheckCircle2 size={36} className="icon success" />);
        setShowLoginButton(true);
        break;
      case 'already_verified':
        setMessage('Email already verified. You can log in.');
        setIcon(<Info size={36} className="icon info" />);
        setShowLoginButton(true);
        break;
      case 'not_found':
        setMessage('User not found.');
        setIcon(<XCircle size={36} className="icon error" />);
        break;
      case 'error':
      default:
        setMessage('Invalid or expired verification link.');
        setIcon(<AlertTriangle size={36} className="icon warning" />);
        break;
    }
  }, [status]);

  return (
    <div className="popup-container">
      <div className="popup-card">
        {icon}
        <h2 className="popup-heading">Email Verification</h2>
        <p className="popup-message">{message}</p>

        {showLoginButton && (
          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#FF6D00',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(255, 109, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e65c00';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF6D00';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

// Authentication utility functions
export const checkAuthentication = () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return !!(token && user);
  } catch (error) {
    console.warn('Authentication check failed:', error);
    return false;
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

// Custom hook for authentication state management
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthentication());
  const [user, setUser] = useState(getCurrentUser());

  const updateAuthState = () => {
    const authStatus = checkAuthentication();
    const currentUser = getCurrentUser();
    setIsAuthenticated(authStatus);
    setUser(currentUser);
  };

  useEffect(() => {
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        updateAuthState();
      }
    };

    // Listen for custom events (login/logout from same tab)
    const handleAuthChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleAuthChange);
    };
  }, []);

  return {
    isAuthenticated,
    user,
    updateAuthState,
    checkAuth: checkAuthentication,
    getToken: getAuthToken,
    getCurrentUser: () => user
  };
};

// Protected Action Handler - Core utility
export const createProtectedActionHandler = (showLoginModal) => {
  return (action, actionName = 'this action') => {
    if (!checkAuthentication()) {
      showLoginModal();
      return {
        success: false,
        requiresAuth: true,
        message: `Please log in to ${actionName}`
      };
    }

    try {
      const result = action();
      return {
        success: true,
        requiresAuth: false,
        result
      };
    } catch (error) {
      console.error(`Protected action failed: ${actionName}`, error);
      return {
        success: false,
        requiresAuth: false,
        error: error.message || 'Action failed'
      };
    }
  };
};

// Async version for API calls
export const createProtectedAsyncActionHandler = (showLoginModal) => {
  return async (asyncAction, actionName = 'this action') => {
    if (!checkAuthentication()) {
      showLoginModal();
      return {
        success: false,
        requiresAuth: true,
        message: `Please log in to ${actionName}`
      };
    }

    try {
      const result = await asyncAction();
      return {
        success: true,
        requiresAuth: false,
        result
      };
    } catch (error) {
      console.error(`Protected async action failed: ${actionName}`, error);
      return {
        success: false,
        requiresAuth: false,
        error: error.message || 'Action failed'
      };
    }
  };
};

// Higher-Order Component for protected buttons
export const withAuthProtection = (WrappedComponent, actionName = 'perform this action') => {
  return React.forwardRef(({ onClick, disabled, children, ...props }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleClick = (event) => {
      if (!isAuthenticated) {
        event.preventDefault();
        event.stopPropagation();
        setShowModal(true);
        return;
      }

      if (onClick) {
        onClick(event);
      }
    };

    return (
      <>
        <WrappedComponent
          ref={ref}
          onClick={handleClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </WrappedComponent>

        <LoginRequiredModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  });
};

// Enhanced LoginRequiredModal component
const LoginRequiredModal = ({ isOpen, onClose }) => {
  const modalRef = React.useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: 'linear-gradient(135deg, #FFF8F1 0%, #FFF1E6 100%)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 109, 0, 0.2)',
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255, 109, 0, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#FF6D00',
          }}
        >
          🔐
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FF6D00',
            marginBottom: '12px',
            margin: '0 0 12px 0',
          }}
        >
          Login Required
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: '#666666',
            marginBottom: '24px',
            lineHeight: '1.5',
            margin: '0 0 24px 0',
          }}
        >
          Please log in to access this feature and unlock the full potential of our platform.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => {
              onClose();
              window.location.href = '/login';
            }}
            style={{
              background: '#FF6D00',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(255, 109, 0, 0.3)',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e65c00';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 109, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FF6D00';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 0, 0.3)';
            }}
          >
            Log In
          </button>

          <button
            onClick={() => {
              onClose();
              window.location.href = '/signup';
            }}
            style={{
              background: 'transparent',
              color: '#FF6D00',
              border: '2px solid #FF6D00',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 109, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Sign Up
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 109, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6D00',
            fontSize: '18px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 109, 0, 0.2)';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 109, 0, 0.1)';
            e.target.style.transform = 'rotate(0deg)';
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

// Custom hook for protected actions
export const useProtectedAction = () => {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleProtectedAction = (action, actionName = 'perform this action') => {
    if (!isAuthenticated) {
      setShowModal(true);
      return {
        success: false,
        requiresAuth: true,
        message: `Please log in to ${actionName}`
      };
    }

    try {
      const result = action();
      return {
        success: true,
        requiresAuth: false,
        result
      };
    } catch (error) {
      console.error(`Protected action failed: ${actionName}`, error);
      return {
        success: false,
        requiresAuth: false,
        error: error.message || 'Action failed'
      };
    }
  };

  const handleProtectedAsyncAction = async (asyncAction, actionName = 'perform this action') => {
    if (!isAuthenticated) {
      setShowModal(true);
      return {
        success: false,
        requiresAuth: true,
        message: `Please log in to ${actionName}`
      };
    }

    try {
      const result = await asyncAction();
      return {
        success: true,
        requiresAuth: false,
        result
      };
    } catch (error) {
      console.error(`Protected async action failed: ${actionName}`, error);
      return {
        success: false,
        requiresAuth: false,
        error: error.message || 'Action failed'
      };
    }
  };

  return {
    handleProtectedAction,
    handleProtectedAsyncAction,
    showLoginModal: () => setShowModal(true),
    hideLoginModal: () => setShowModal(false),
    isAuthenticated,
    LoginModal: () => (
      <LoginRequiredModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    )
  };
};

// Export the LoginRequiredModal component
export { LoginRequiredModal };

export default VerifiedPopup;
