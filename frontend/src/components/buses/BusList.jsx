import React from 'react';

export default function BusList({ vehicles }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Shuttles in service</h3>
      {vehicles.length === 0 && (
        <p style={{ color: 'var(--ualbany-text-muted)', fontSize: '0.9rem' }}>
          No shuttles visible yet. They might be starting their routes.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {vehicles.map((v) => (
          <div
            key={v.vehicleId}
            style={{
              padding: '0.4rem 0.5rem',
              borderRadius: '0.7rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>Bus {v.vehicleId}</div>
              <div style={{ color: 'var(--ualbany-text-muted)' }}>
                Last seen: {v.lastSeen ? new Date(v.lastSeen).toLocaleTimeString() : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{Math.round(v.speedKph || 0)} km/h</div>
              <button
                style={{
                  marginTop: '0.15rem',
                  borderRadius: '999px',
                  padding: '0.15rem 0.6rem',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '0.75rem',
                }}
              >
                Track
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
