import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailPage from './pages/PackageDetailPage';
import { Package, LogOut, Phone } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('pt_token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pt_user')) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pt_token', newToken);
    localStorage.setItem('pt_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('pt_token');
    localStorage.removeItem('pt_user');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {token && (
          <header className="header">
            <div className="header-content">
              <Link to="/" className="brand">
                <div className="brand-icon">
                  <Package size={18} />
                </div>
                <span>Package Tracker</span>
              </Link>

              <div className="user-badge">
                {user?.phone && (
                  <span className="user-phone">
                    <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {user.phone}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Logout"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                !token ? (
                  <LoginPage onLogin={handleLogin} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/"
              element={
                token ? (
                  <PackagesPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/packages/:id"
              element={
                token ? (
                  <PackageDetailPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
