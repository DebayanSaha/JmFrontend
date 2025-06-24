import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Building, Globe, CreditCard, Edit2,
  CheckCircle2, AlertCircle,CalendarCheck,Clock, BadgeCheck
} from 'lucide-react';
import axios from 'axios';

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

  const handlePhoneSave = async () => {
    if (!phone || phone.length < 6) {
      setPhoneStatus({ type: 'error', message: 'Enter a valid phone number.' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/user/update-mobile', { mobile: phone }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, mobile: phone };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setPhoneStatus({ type: 'success', message: 'Phone updated successfully.' });
    } catch {
      setPhoneStatus({ type: 'error', message: 'Failed to update phone.' });
    }
    setEditingPhone(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/user/delete-account', {}, {
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
      const orderRes = await axios.post('/api/payments/create-order', { months: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { id: order_id } = orderRes.data;
      const rzp = new window.Razorpay({
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: 100,
        currency: 'INR',
        order_id,
        name: 'JMeterAI',
        description: 'Card verification',
        handler: async function (response) {
          const verifyRes = await axios.post('/api/payments/verify-and-save-card', {
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.98)', borderRadius: 24, boxShadow: '0 12px 36px rgba(255,109,0,0.13)', padding: '48px 32px 36px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <h2 style={{ color: '#FF6D00', fontWeight: 800, fontSize: 28, textAlign: 'center' }}><User size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <InfoRow icon={<User />} label="Name" value={user.name} />
          <InfoRow icon={<Mail />} label="Email" value={user.email} />
          <InfoRow icon={<Phone />} label="Phone" value={phone} editable editing={editingPhone} setEditing={setEditingPhone} onSave={handlePhoneSave} onChange={setPhone} />
          {phoneStatus && <StatusMessage status={phoneStatus} />}
          <InfoRow icon={<Globe />} label="Country" value={user.country} />
          <InfoRow icon={<Building />} label="Organization" value={user.organization} />
          <InfoRow icon={<CreditCard />} label="Card" value={cardDetails.verified ? `${cardDetails.network} •••• ${cardDetails.last4}` : 'Not Verified'} buttonText="Verify Card" onButtonClick={handleAddCard} />
          {cardStatus && <StatusMessage status={cardStatus} />}
          <InfoRow icon={<BadgeCheck />} label="License" value={user.license} />
          <InfoRow icon={<Clock />} label="Trial Ends" value={new Date(user.trial_ends_at).toLocaleDateString()} />
          <InfoRow icon={<CalendarCheck />} label="Paid Ends" value={new Date(user.paid_ends_at).toLocaleDateString()} />
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, width: '100%', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 20, color: '#EF4444' }}>Are you sure you want to delete your account? This cannot be undone.</p>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <button onClick={handleDeleteAccount} style={{ background: '#EF4444', color: '#fff', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}>Yes, Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ background: '#eee', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setShowDeleteConfirm(true)} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Delete My Account</button>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, editable, editing, setEditing, onSave, onChange, buttonText, onButtonClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    {icon && React.cloneElement(icon, { style: { color: '#FF6D00', verticalAlign: 'middle' } })}
    <span style={{ color: '#888', fontWeight: 600, minWidth: 70 }}>{label}:</span>
    {editable ? (
      editing ? (
        <>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={e => e.key === 'Enter' && onSave()}
            style={{
              fontFamily: 'inherit',
              fontSize: 15,
              border: '1.5px solid #E0E0E0',
              borderRadius: 8,
              padding: '6px 12px',
              background: '#FFF8F1',
              color: '#222',
              minWidth: 120
            }}
            autoFocus
          />
          <span onClick={onSave} style={{ color: '#FF6D00', cursor: 'pointer' }}><CheckCircle2 size={18} /></span>
        </>
      ) : (
        <>
          <span style={{ color: '#222', fontWeight: 700 }}>{value || '-'}</span>
          <span onClick={() => setEditing(true)} style={{ color: '#FF6D00', cursor: 'pointer' }}><Edit2 size={18} /></span>
        </>
      )
    ) : buttonText && onButtonClick ? (
      <>
        <span style={{ color: '#222', fontWeight: 700 }}>{value || '-'}</span>
        <button onClick={onButtonClick} style={{ marginLeft: 8, background: '#FF6D00', color: '#fff', borderRadius: 6, border: 'none', padding: '4px 10px', fontSize: 14, cursor: 'pointer' }}>{buttonText}</button>
      </>
    ) : (
      <span style={{ color: '#222', fontWeight: 700 }}>{value || '-'}</span>
    )}
  </div>
);

const StatusMessage = ({ status }) => (
  <div style={{ color: status.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {status.message}
  </div>
);

export default ProfilePage;
