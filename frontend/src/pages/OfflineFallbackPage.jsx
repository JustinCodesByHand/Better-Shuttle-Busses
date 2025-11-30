import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function OfflineFallbackPage() {
  const [data, setData] = useState({ lastSynced: null, schedule: [] });

  async function load() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/arrivals/schedule/all`);
      setData(res.data);
    } catch (e) {
      console.error('Error loading fallback schedule', e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="main-content">
      <div className="card" style={{ width: '100%' }}>
        <h2 style={{ marginTop: 0 }}>Offline mode</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ualbany-text-muted)' }}>
          Live GPS data is unavailable. We&apos;re showing the cached/static schedule instead.
        </p>
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.75rem',
            borderRadius: '0.75rem',
            background: 'rgba(255, 159, 67, 0.12)',
            border: '1px solid rgba(255, 159, 67, 0.7)',
            fontSize: '0.85rem',
          }}
        >
          ⚠️ Service status: Live GPS offline · Estimates based on schedule only.
        </div>

        <table
          style={{
            width: '100%',
            marginTop: '0.9rem',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--ualbany-text-muted)' }}>
              <th style={{ padding: '0.4rem' }}>Route</th>
              <th style={{ padding: '0.4rem' }}>Stop</th>
              <th style={{ padding: '0.4rem' }}>Time</th>
              <th style={{ padding: '0.4rem' }}>ETA variance</th>
            </tr>
          </thead>
          <tbody>
            {data.schedule.map((row, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '0.35rem' }}>{row.routeId}</td>
                <td style={{ padding: '0.35rem' }}>{row.stopId}</td>
                <td style={{ padding: '0.35rem' }}>{row.time}</td>
                <td style={{ padding: '0.35rem' }}>{row.etaVariance}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--ualbany-text-muted)' }}>
          Last synced:{' '}
          {data.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'Unknown'}
        </div>

        <button
          style={{
            marginTop: '0.75rem',
            borderRadius: '999px',
            padding: '0.6rem 0.9rem',
            border: 'none',
            background:
              'linear-gradient(120deg, rgba(255,199,44,0.9), rgba(255,241,188,0.95))',
            color: '#1c1237',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
          onClick={load}
        >
          Retry live tracking
        </button>
      </div>
    </main>
  );
}
