import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Building, Globe, CreditCard, Edit2,
  CheckCircle2, AlertCircle, CalendarCheck, Clock, BadgeCheck
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

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
  const [phone, setPhone] = useState(user?.mobile || '');
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [cardStatus, setCardStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardRef = useRef();
  const [cardDetails, setCardDetails] = useState({
    last4: user?.card_last4 || null,
    network: user?.card_network || null,
    verified: user?.card_verified || false,
  });

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setPhone(u?.mobile || '');
    setCardDetails({
      last4: u?.card_last4 || null,
      network: u?.card_network || null,
      verified: u?.card_verified || false,
    });
  }, []);
  const validPhoneRegex = /^\+?[0-9\s\-().]{6,20}$/;

  const handlePhoneSave = async () => {
    if (!validPhoneRegex.test(phone)) {
      setPhoneStatus({ type: 'error', message: 'Enter a valid phone number.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/update-mobile', { mobile: phone }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, mobile: phone };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setPhoneStatus({ type: 'success', message: 'Phone updated successfully.' });
      setEditingPhone(false);  // only set editing to false on success
    } catch {
      setPhoneStatus({ type: 'error', message: 'Failed to update phone.' });
      // do not set editing to false so user can retry
    }
  };


  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/delete-account', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    localStorage.clear();
    sessionStorage.clear();
    navigate('/signup');
    } catch {
      alert('Failed to delete account.');
    }
  };

  const handleAddCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const orderRes = await axiosInstance.post('/payments/create-order', { months: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { id: order_id } = orderRes.data;
      const rzp = new window.Razorpay({
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: 100,
        currency: 'INR',
        order_id,
        name: 'KickLoad',
        description: 'Card verification',
        handler: async function (response) {
          const verifyRes = await axiosInstance.post('/payments/verify-and-save-card', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const updatedUser = {
            ...user,
            card_verified: verifyRes.data.card_verified,
            card_last4: verifyRes.data.card_last4,
            card_network: verifyRes.data.card_network
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCardDetails({
            verified: true,
            last4: verifyRes.data.card_last4,
            network: verifyRes.data.card_network
          });
          setCardStatus({ type: 'success', message: 'Card verified and saved.' });
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#FF6D00'
        }
      });
      rzp.open();
    } catch {
      setCardStatus({ type: 'error', message: 'Failed to verify card.' });
    }
  };

  useEffect(() => {
    document.body.style.overflow = showDeleteConfirm ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDeleteConfirm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setPhoneStatus(null);
        setCardStatus(null);
        if (editingPhone) {
          setPhone(user?.mobile || '');
          setEditingPhone(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingPhone, user]);
    return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div ref={cardRef} style={{ width: '100%', maxWidth: 600, margin: 'auto', background: 'rgba(255,255,255,0.98)', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '40px 24px 32px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <h2 style={{ color: '#FF6D00', fontWeight: 800, fontSize: 28, textAlign: 'center', marginBottom: 24, letterSpacing: 0.5 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,102,0,0.1)',
            marginRight: 10,
            verticalAlign: 'middle',
          }}>
            <User size={20} style={{ color: '#FF6D00', verticalAlign: 'middle' }} />
          </span>
          Profile
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Personal Info Section */}
          <SectionTitle>Personal Info</SectionTitle>
          <InfoRow icon={<User />} label="Name" value={user.name} />
          <InfoRow icon={<Mail />} label="Email" value={user.email} />
          <InfoRow
            icon={<Phone />}
            label="Phone"
            value={phone}
            originalValue={user.mobile}
            editable
            editing={editingPhone}
            setEditing={setEditingPhone}
            onSave={handlePhoneSave}
            onChange={setPhone}
          />
          {phoneStatus && <StatusMessage status={phoneStatus} />}
          <InfoRow icon={<Globe />} label="Country" value={user.country} />
          <InfoRow icon={<Building />} label="Organization" value={user.organization} />
          <Divider />
          {/* Card Status Section */}
          <SectionTitle>Card Status</SectionTitle>
          <CardStatusRow
            icon={<CreditCard />}
            verified={cardDetails.verified}
            network={cardDetails.network}
            last4={cardDetails.last4}
            cardStatus={cardStatus}
            onButtonClick={handleAddCard}
          />
          {cardStatus && <StatusMessage status={cardStatus} />}
          <Divider />
          {/* License Info Section */}
          <SectionTitle>License Info</SectionTitle>
          <InfoRow icon={<BadgeCheck />} label="License" value={user.license} />
          <InfoRow icon={<Clock />} label="Trial Ends" value={new Date(user.trial_ends_at).toLocaleDateString()} />
          <InfoRow icon={<CalendarCheck />} label="Paid Ends" value={new Date(user.paid_ends_at).toLocaleDateString()} />
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: '#ff6d00',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 15,
            marginTop: 32,
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
            boxShadow: '0 2px 8px rgba(255,109,0,0.08)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e65c00';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#ff6d00';
            e.currentTarget.style.transform = 'none';
          }}
        >
          Delete My Account
        </button>
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              pointerEvents: 'auto', // this ensures it captures all pointer events
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                maxWidth: 360,
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'auto',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 20, color: '#EF4444' }}>
                Are you sure you want to delete your account? This cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: '#eee',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    color: '#333',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 700px) {
          .profile-card { padding: 18px 4vw 18px 4vw !important; }
        }
        @media (max-width: 480px) {
          .profile-card { padding: 8px 2vw 8px 2vw !important; }
        }
      `}</style>
      </div>
    );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 15, fontWeight: 700, color: '#FF6D00', margin: '18px 0 2px 0', letterSpacing: 0.2 }}>{children}</div>
);

const Divider = () => (
  <div style={{ width: '100%', height: 1, background: '#f3f3f3', margin: '18px 0' }} />
);

const InfoRow = ({ icon, label, value, originalValue,
  editable, editing, setEditing,
  onSave, onChange, buttonText, onButtonClick }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 38,
    margin: '0.5rem 0',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'rgba(255,102,0,0.1)',
        marginRight: 8,
        verticalAlign: 'middle',
      }}>{React.cloneElement(icon, { size: 16, style: { color: '#FF6D00', verticalAlign: 'middle' } })}</span>
      <span style={{ color: '#888', fontWeight: 500, fontSize: 14, minWidth: 70 }}>{label}:</span>
          </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
      {editable ? (
        editing ? (
              <>
                <input
                  type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 15,
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 8,
                    padding: '6px 12px',
                    background: '#FFF8F1',
                    color: '#222',
                minWidth: 120,
                marginRight: 6,
                  }}
                  autoFocus
            />
            <span
              onMouseDown={e => { e.preventDefault(); onSave(); }}
              style={{ color: '#ff6d00', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e65c00'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#ff6d00'; e.currentTarget.style.transform = 'none'; }}
            >
              <CheckCircle2 size={18} />
            </span>
              </>
            ) : (
              <>
            <span style={{ color: '#222', fontWeight: 600, fontSize: 15, textAlign: 'right', minWidth: 80 }}>{value || '-'}</span>
            <span
              onClick={() => setEditing(true)}
              style={{ color: '#ff6d00', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 6, transition: 'transform 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e65c00'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#ff6d00'; e.currentTarget.style.transform = 'none'; }}
            >
              <Edit2 size={16} />
            </span>
          </>
        )
      ) : buttonText && onButtonClick ? null : (
        <span style={{ color: '#222', fontWeight: 600, fontSize: 15, textAlign: 'right', minWidth: 80 }}>{label === 'Password' ? 'kk********l' : value || '-'}</span>
      )}
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          style={{
            background: '#ff6d00',
            color: '#fff',
            borderRadius: 8,
            border: 'none',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 14,
            marginLeft: 8,
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
            boxShadow: '0 2px 8px rgba(255,109,0,0.08)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e65c00';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#ff6d00';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {buttonText}
        </button>
            )}
          </div>
            </div>
);

const CardStatusRow = ({ icon, verified, network, last4, cardStatus, onButtonClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: 38, margin: '0.5rem 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'rgba(255,102,0,0.1)',
        marginRight: 8,
        verticalAlign: 'middle',
      }}>{React.cloneElement(icon, { size: 16, style: { color: '#FF6D00', verticalAlign: 'middle' } })}</span>
      <span style={{ color: '#888', fontWeight: 500, fontSize: 14, minWidth: 70 }}>Card:</span>
          </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
      {verified ? (
        <span style={{ color: '#222', fontWeight: 600, fontSize: 15, textAlign: 'right', minWidth: 80 }}>{network} •••• {last4}</span>
      ) : (
        <>
          <span style={{ color: '#888', fontWeight: 600, fontSize: 15, textAlign: 'right', minWidth: 80 }}>Not Verified</span>
          <button
            onClick={onButtonClick}
            style={{
              background: '#ff6d00',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: 14,
              marginLeft: 8,
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
              boxShadow: '0 2px 8px rgba(255,109,0,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e65c00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ff6d00';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Verify Card
          </button>
        </>
          )}
        </div>
      </div>
);

const StatusMessage = ({ status }) => (
  <div style={{ color: status.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, fontStyle: status.type === 'error' ? 'italic' : 'normal', fontSize: 13 }}>
    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {status.message}
    </div>
  );

export default ProfilePage; 
