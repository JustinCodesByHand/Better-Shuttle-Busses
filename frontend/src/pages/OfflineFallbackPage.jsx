import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function formatTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLastSynced(isoString) {
    if (!isoString) return 'Unknown';
    const d = new Date(isoString);
    return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OfflineFallbackPage() {
    const [data, setData] = useState({ lastSynced: null, schedule: [] });

    async function load() {
        try {
            // New backend endpoints using the shuttleSimulation static schedule
            const [scheduleRes, statusRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/vehicles/schedule`),
                axios.get(`${API_BASE_URL}/api/vehicles/status`),
            ]);

            setData({
                lastSynced: statusRes.data?.lastSyncTime || null,
                schedule: scheduleRes.data || [],
            });
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
                    Live GPS data is unavailable. We&apos;re showing the cached/static schedule instead for
                    the UAlbany shuttle routes: <strong>Purple Line</strong>, <strong>Gold Line</strong>, and{' '}
                    <strong>Downtown Link</strong>.
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
                            {/* New field names from shuttleSimulation static schedule */}
                            <td style={{ padding: '0.35rem' }}>{row.routeLabel}</td>
                            <td style={{ padding: '0.35rem' }}>{row.stopName}</td>
                            <td style={{ padding: '0.35rem' }}>{formatTime(row.scheduledTime)}</td>
                            <td style={{ padding: '0.35rem' }}>
                                {row.etaVarianceMinutes > 0 && `+${row.etaVarianceMinutes} min`}
                                {row.etaVarianceMinutes < 0 && `${row.etaVarianceMinutes} min`}
                                {row.etaVarianceMinutes === 0 && 'On time'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div
                    style={{
                        marginTop: '0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--ualbany-text-muted)',
                    }}
                >
                    Last synced:{' '}
                    {data.lastSynced ? formatLastSynced(data.lastSynced) : 'Unknown'}
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
