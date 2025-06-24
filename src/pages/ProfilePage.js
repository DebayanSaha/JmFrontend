import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, Phone, Building, Globe, CreditCard, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';

const getUser = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [card, setCard] = useState(null); // Placeholder for card details
  const [cardInput, setCardInput] = useState('');
  const [cardStatus, setCardStatus] = useState(null);

  useEffect(() => {
    setUser(getUser());
    setPhone(getUser()?.phone || '');
  }, []);

  const handlePhoneSave = () => {
    if (!phone || phone.length < 6) {
      setPhoneStatus({ type: 'error', message: 'Enter a valid phone number.' });
      return;
    }
    setUser((prev) => ({ ...prev, phone }));
    setEditingPhone(false);
    setPhoneStatus({ type: 'success', message: 'Phone updated (frontend only).' });
  };

  const handlePasswordSave = () => {
    if (!password || password.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setPasswordStatus({ type: 'success', message: 'Password updated (frontend only).' });
    setShowPasswordEdit(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    // Frontend only: clear user data and redirect
    localStorage.clear();
    sessionStorage.clear();
    navigate('/signup');
  };

  const handleAddCard = () => {
    if (!cardInput.trim()) {
      setCardStatus({ type: 'error', message: 'Please enter a card number.' });
      return;
    }
    setCard({ number: cardInput.trim() });
    setCardInput('');
    setCardStatus({ type: 'success', message: 'Card added (frontend only).' });
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: '#FF6D00', marginBottom: 12 }} />
          <h2 style={{ color: '#FF6D00', marginBottom: 8 }}>No user found</h2>
          <p style={{ color: '#333', marginBottom: 16 }}>Please log in to view your profile.</p>
          <button onClick={() => navigate('/login')} style={{ background: '#FF6D00', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  // Masked password display (e.g., kk*********l)
  const getMaskedPassword = (pw = 'Demo@1234') => {
    if (!pw || pw.length < 3) return '********';
    return `${pw.slice(0,2)}${'*'.repeat(pw.length-3)}${pw.slice(-1)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.98)', borderRadius: 24, boxShadow: '0 12px 36px rgba(255,109,0,0.13)', padding: '48px 32px 36px 32px', display: 'flex', flexDirection: 'column', gap: 28, transition: 'box-shadow 0.3s', position: 'relative' }}>
        <h2 style={{ color: '#FF6D00', fontWeight: 800, fontSize: 28, marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}><User size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <User style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Name:</span>
            <span style={{ color: '#222', fontWeight: 700, letterSpacing: 0.2 }}>{user.name || user.fullName || '-'}</span>
          </div>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Mail style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Email:</span>
            <span style={{ color: '#222', fontWeight: 700, letterSpacing: 0.2 }}>{user.email || '-'}</span>
          </div>
          {/* Phone (editable) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Phone style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Phone:</span>
            {editingPhone ? (
              <>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 15,
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 8,
                    padding: '6px 12px',
                    outline: 'none',
                    marginRight: 8,
                    minWidth: 120,
                    background: '#FFF8F1',
                    color: '#222',
                    transition: 'border 0.2s',
                  }}
                  autoFocus
                  onBlur={handlePhoneSave}
                  onKeyDown={e => { if (e.key === 'Enter') handlePhoneSave(); }}
                />
                <span style={{ color: '#FF6D00', cursor: 'pointer', fontWeight: 600, fontSize: 16 }} onClick={handlePhoneSave}><CheckCircle2 size={18} /></span>
              </>
            ) : (
              <>
                <span style={{ color: '#222', fontWeight: 700, letterSpacing: 0.2 }}>{phone || '-'}</span>
                <span style={{ color: '#FF6D00', cursor: 'pointer', marginLeft: 8, display: 'inline-flex', alignItems: 'center' }} onClick={() => setEditingPhone(true)}><Edit2 size={18} /></span>
              </>
            )}
          </div>
          {phoneStatus && (
            <div style={{ color: phoneStatus.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {phoneStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {phoneStatus.message}
            </div>
          )}
          {/* Country */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Globe style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Country:</span>
            <span style={{ color: '#222', fontWeight: 700, letterSpacing: 0.2 }}>{user.country || '-'}</span>
          </div>
          {/* Organization */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Building style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Organization:</span>
            <span style={{ color: '#222', fontWeight: 700, letterSpacing: 0.2 }}>{user.organization || user.organizationName || '-'}</span>
          </div>
          {/* Password (masked, not editable) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Lock style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
            <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>Password:</span>
            <span style={{ fontFamily: 'monospace', letterSpacing: '0.15em', color: '#222', background: '#FFF8F1', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 15 }}>{getMaskedPassword(user.password || 'Demo@1234')}</span>
          </div>
        </div>
        {/* Delete Account */}
        <div style={{ marginTop: 10, background: '#FFF8F1', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span><svg width="20" height="20" fill="none" stroke="#FF6D00" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" /></svg></span>
            <span style={{ color: '#888', fontWeight: 600 }}>Delete Account:</span>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'background 0.2s' }}>Delete My Account</button>
          {showDeleteConfirm && (
            <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: 12 }}>Are you sure you want to delete your account? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={handleDeleteAccount} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Yes, Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 