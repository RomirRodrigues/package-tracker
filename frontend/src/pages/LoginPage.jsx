import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Package, ShieldCheck, ArrowRight, Smartphone, KeyRound } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +919876543210)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(phone.trim());
      setStep('otp');
      setInfoMessage(res.message || 'OTP sent successfully to your number!');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.trim().length < 4) {
      setError('Please enter the OTP code received');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(phone.trim(), code.trim());
      onLogin(res.token, res.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.75rem auto', width: 44, height: 44 }}>
            <Package size={24} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Package Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Fast OTP authentication powered by Minimoth
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {infoMessage && <div className="alert alert-info">{infoMessage}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.35rem' }}>
                Includes country code (e.g. +91 for India, +1 for US)
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP via Minimoth'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="code">Enter Verification Code</label>
              <input
                id="code"
                type="text"
                placeholder="6-digit OTP code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                required
                maxLength={8}
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sent to {phone}</span>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                >
                  Change number
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
              <ShieldCheck size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
