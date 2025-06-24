import React from 'react';
import { withAuthProtection, useProtectedAction } from './VerifiedPopup';

// Example 1: Using the HOC pattern
export const ProtectedButton = withAuthProtection(
  ({ children, ...props }) => (
    <button
      {...props}
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
        ...props.style,
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
      {children}
    </button>
  ),
  'perform this action'
);

// Example 2: Using the custom hook pattern
export const ProtectedActionButton = ({ 
  children, 
  onClick, 
  actionName = 'perform this action',
  disabled = false,
  style = {},
  ...props 
}) => {
  const { 
    handleProtectedAction, 
    handleProtectedAsyncAction, 
    LoginModal,
    isAuthenticated 
  } = useProtectedAction();

  const handleClick = (event) => {
    if (disabled) return;

    const result = handleProtectedAction(() => {
      if (onClick) {
        return onClick(event);
      }
    }, actionName);

    // Handle the result if needed
    if (!result.success && !result.requiresAuth) {
      console.error('Action failed:', result.error);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        style={{
          background: disabled ? '#ccc' : '#FF6D00',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(255, 109, 0, 0.3)',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.background = '#e65c00';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 109, 0, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.target.style.background = '#FF6D00';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 0, 0.3)';
          }
        }}
        {...props}
      >
        {children}
      </button>
      <LoginModal />
    </>
  );
};

// Example 3: Async action button
export const ProtectedAsyncButton = ({ 
  children, 
  onAsyncClick, 
  actionName = 'perform this action',
  disabled = false,
  loading = false,
  style = {},
  ...props 
}) => {
  const { 
    handleProtectedAsyncAction, 
    LoginModal,
    isAuthenticated 
  } = useProtectedAction();

  const handleClick = async (event) => {
    if (disabled || loading) return;

    const result = await handleProtectedAsyncAction(async () => {
      if (onAsyncClick) {
        return await onAsyncClick(event);
      }
    }, actionName);

    // Handle the result if needed
    if (!result.success && !result.requiresAuth) {
      console.error('Async action failed:', result.error);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          background: disabled || loading ? '#ccc' : '#FF6D00',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: disabled || loading ? 'none' : '0 4px 12px rgba(255, 109, 0, 0.3)',
          opacity: disabled || loading ? 0.6 : 1,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.target.style.background = '#e65c00';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 109, 0, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.target.style.background = '#FF6D00';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 0, 0.3)';
          }
        }}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
      <LoginModal />
    </>
  );
};

// Example 4: Download button with specific styling
export const ProtectedDownloadButton = ({ 
  filename, 
  onDownload, 
  disabled = false,
  style = {},
  ...props 
}) => {
  const { 
    handleProtectedAsyncAction, 
    LoginModal,
    isAuthenticated 
  } = useProtectedAction();

  const handleDownload = async () => {
    if (disabled || !filename) return;

    const result = await handleProtectedAsyncAction(async () => {
      if (onDownload) {
        return await onDownload(filename);
      }
    }, 'download this file');

    if (result.success) {
      console.log('Download successful:', result.result);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={disabled || !filename}
        style={{
          background: disabled || !filename ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: disabled || !filename ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: disabled || !filename ? 'none' : '0 2px 8px rgba(40, 167, 69, 0.3)',
          opacity: disabled || !filename ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && filename) {
            e.target.style.background = '#218838';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && filename) {
            e.target.style.background = '#28a745';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
          }
        }}
        {...props}
      >
        📥 Download
      </button>
      <LoginModal />
    </>
  );
};

// Example 5: Email button with specific styling
export const ProtectedEmailButton = ({ 
  onSendEmail, 
  disabled = false,
  style = {},
  ...props 
}) => {
  const { 
    handleProtectedAsyncAction, 
    LoginModal,
    isAuthenticated 
  } = useProtectedAction();

  const handleEmail = async () => {
    if (disabled) return;

    const result = await handleProtectedAsyncAction(async () => {
      if (onSendEmail) {
        return await onSendEmail();
      }
    }, 'send email');

    if (result.success) {
      console.log('Email sent successfully:', result.result);
    }
  };

  return (
    <>
      <button
        onClick={handleEmail}
        disabled={disabled}
        style={{
          background: disabled ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: disabled ? 'none' : '0 2px 8px rgba(0, 123, 255, 0.3)',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.background = '#0056b3';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.target.style.background = '#007bff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
          }
        }}
        {...props}
      >
        📧 Send Email
      </button>
      <LoginModal />
    </>
  );
};

export default ProtectedButton; 