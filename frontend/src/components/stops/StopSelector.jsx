import React from 'react';

export default function StopSelector({ stops, selectedStopId, onSelect }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Where are you heading?</h3>
      <select
        style={{
          width: '100%',
          padding: '0.55rem 0.7rem',
          borderRadius: '999px',
          border: '1px solid var(--ualbany-border-subtle)',
          background: 'rgba(10, 4, 30, 0.95)',
          color: '#fff',
          fontSize: '0.88rem',
        }}
        value={selectedStopId || ''}
        onChange={(e) => {
          const stop = stops.find((s) => s.stopId === e.target.value);
          if (stop) onSelect(stop);
        }}
      >
        <option value="">Select a stop…</option>
        {stops.map((stop) => (
          <option key={stop.stopId} value={stop.stopId}>
            {stop.name}
          </option>
        ))}
      </select>
    </div>
  );
}
