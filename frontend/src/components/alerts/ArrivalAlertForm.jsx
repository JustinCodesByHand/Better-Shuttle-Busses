import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ArrivalAlertForm({ stops }) {
  const { user } = useAuth();
  const [stopId, setStopId] = useState('');
  const [thresholdMinutes, setThresholdMinutes] = useState(5);
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [serviceAlertsEnabled, setServiceAlertsEnabled] = useState(true);
  const [status, setStatus] = useState(null);

  async function save() {
    try {
      await axios.post(`${API_BASE_URL}/api/alerts`, {
        userId: user?.id,
        stopId,
        thresholdMinutes,
        quietHoursStart,
        quietHoursEnd,
        serviceAlertsEnabled,
      });
      setStatus('Saved!');
    } catch (e) {
      setStatus('Error saving');
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Arrival alerts</h3>
      <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
        Stop to apply alerts to
      </label>
      <select
        style={{
          width: '100%',
          padding: '0.5rem 0.7rem',
          borderRadius: '999px',
          border: '1px solid var(--ualbany-border-subtle)',
          background: 'rgba(10, 4, 30, 0.95)',
          color: '#fff',
          fontSize: '0.85rem',
          marginBottom: '0.6rem',
        }}
        value={stopId}
        onChange={(e) => setStopId(e.target.value)}
      >
        <option value="">Choose a stop…</option>
        {stops.map((s) => (
          <option key={s.stopId} value={s.stopId}>
            {s.name}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
        Alert me when bus is within…
      </label>
      <input
        type="number"
        min={1}
        max={30}
        value={thresholdMinutes}
        onChange={(e) => setThresholdMinutes(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: '999px',
          border: '1px solid var(--ualbany-border-subtle)',
          background: 'rgba(10, 4, 30, 0.95)',
          color: '#fff',
          fontSize: '0.85rem',
          marginBottom: '0.5rem',
        }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            Quiet hours start
          </label>
          <input
            type="time"
            value={quietHoursStart}
            onChange={(e) => setQuietHoursStart(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.7rem',
              borderRadius: '999px',
              border: '1px solid var(--ualbany-border-subtle)',
              background: 'rgba(10, 4, 30, 0.95)',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            Quiet hours end
          </label>
          <input
            type="time"
            value={quietHoursEnd}
            onChange={(e) => setQuietHoursEnd(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.7rem',
              borderRadius: '999px',
              border: '1px solid var(--ualbany-border-subtle)',
              background: 'rgba(10, 4, 30, 0.95)',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </div>

      <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <input
          type="checkbox"
          checked={serviceAlertsEnabled}
          onChange={(e) => setServiceAlertsEnabled(e.target.checked)}
        />
        Show service alerts as banners
      </label>

      <button
        style={{
          marginTop: '0.6rem',
          width: '100%',
          borderRadius: '999px',
          padding: '0.55rem 0.7rem',
          border: 'none',
          background:
            'linear-gradient(120deg, rgba(255,199,44,0.9), rgba(255,241,188,0.95))',
          color: '#1c1237',
          fontWeight: 600,
          fontSize: '0.88rem',
        }}
        onClick={save}
      >
        Save alert settings
      </button>

      {status && (
        <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--ualbany-text-muted)' }}>
          {status}
        </p>
      )}
    </div>
  );
}
