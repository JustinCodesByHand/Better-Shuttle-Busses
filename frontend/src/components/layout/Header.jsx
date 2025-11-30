import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-title">
        <h1>UAlbany Shuttle Tracker</h1>
        <span>On-campus shuttle · Live mock tracking</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="header-status-pill">
          <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#28c76f' }} />
          Live GPS · Simulated
        </div>
        <nav className="header-nav">
          <button
            className={pathname === '/map' ? 'active' : ''}
            onClick={() => navigate('/map')}
          >
            Map
          </button>
          <button
            className={pathname === '/alerts' ? 'active' : ''}
            onClick={() => navigate('/alerts')}
          >
            Alerts
          </button>
          <button
            className={pathname === '/offline' ? 'active' : ''}
            onClick={() => navigate('/offline')}
          >
            Offline Mode
          </button>
        </nav>
        {user && (
          <button
            style={{
              marginLeft: '0.5rem',
              borderRadius: 999,
              padding: '0.35rem 0.8rem',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              fontSize: '0.78rem',
            }}
            onClick={logout}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
