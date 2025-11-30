import React from 'react';
import { useShuttleData } from '../hooks/useShuttleData';
import ArrivalAlertForm from '../components/alerts/ArrivalAlertForm';
import NotificationStatus from '../components/alerts/NotificationStatus';

export default function AlertsSettingsPage() {
  const { stops } = useShuttleData();

  return (
    <main className="main-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1rem', width: '100%' }}>
        <ArrivalAlertForm stops={stops} />
        <NotificationStatus />
      </div>
    </main>
  );
}
