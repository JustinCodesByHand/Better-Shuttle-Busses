import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getConfidenceBadge } from '../../utils/etaUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function StopDetailsPanel({ selectedStop, offline }) {
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (!selectedStop || offline) {
      setEta(null);
      return;
    }

    async function fetchEta() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/arrivals/${selectedStop.stopId}`);
        setEta(res.data);
      } catch (e) {
        setEta(null);
      }
    }

    fetchEta();
  }, [selectedStop, offline]);

  if (!selectedStop) {
    return (
      <div className="card">
        <h3>Choose a stop</h3>
        <p style={{ color: 'var(--ualbany-text-muted)', fontSize: '0.9rem' }}>
          Tap a pin on the map or search for your destination to see live ETAs and shuttle details.
        </p>
      </div>
    );
  }

  const badge = eta ? getConfidenceBadge(eta.etaMinutes) : null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{selectedStop.name}</h3>
      <p style={{ margin: '0.1rem 0', fontSize: '0.9rem', color: 'var(--ualbany-text-muted)' }}>
        Zone: {selectedStop.campusZone || 'On-campus'}
      </p>

      {offline && (
        <p style={{ color: 'var(--ualbany-warning)', fontSize: '0.85rem' }}>
          Live GPS is unavailable. You can still view the static schedule in Offline Mode.
        </p>
      )}

      {!offline && eta && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 600 }}>{eta.etaMinutes}</div>
            <div style={{ fontSize: '0.9rem' }}>
              <div>min away</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ualbany-text-muted)' }}>
                Bus {eta.vehicleId} · {Math.round(eta.speedKph)} km/h
              </div>
            </div>
          </div>
          {badge && (
            <div
              className={`badge badge-${badge.type}`}
              style={{ marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              ETA Confidence: {badge.label}
            </div>
          )}
        </div>
      )}

      {!offline && !eta && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--ualbany-text-muted)' }}>
          No live ETA available for this stop yet. Try again in a moment.
        </p>
      )}
    </div>
  );
}
