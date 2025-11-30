import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationStatus() {
  const { status, requestPermission, sendTestNotification } = useNotifications();

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Push notifications</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--ualbany-text-muted)' }}>
        Browser notification status: <strong>{status}</strong>
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
        <button
          style={{
            flex: 1,
            borderRadius: '999px',
            padding: '0.5rem 0.7rem',
            border: '1px solid var(--ualbany-border-subtle)',
            background: 'rgba(10,4,30,0.95)',
            color: '#fff',
            fontSize: '0.85rem',
          }}
          onClick={requestPermission}
        >
          Request permission
        </button>
        <button
          style={{
            flex: 1,
            borderRadius: '999px',
            padding: '0.5rem 0.7rem',
            border: 'none',
            background:
              'linear-gradient(120deg, rgba(255,199,44,0.9), rgba(255,241,188,0.95))',
            color: '#1c1237',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
          onClick={sendTestNotification}
        >
          Send test alert
        </button>
      </div>
    </div>
  );
}
