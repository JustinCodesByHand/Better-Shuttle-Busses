import React, { useMemo, useState } from 'react';
import { useShuttleData } from '../hooks/useShuttleData';
import { useLocation } from '../hooks/useLocation';
import ShuttleMap from '../components/map/ShuttleMap';
import StopDetailsPanel from '../components/stops/StopDetailsPanel';
import StopSelector from '../components/stops/StopSelector';
import BusList from '../components/buses/BusList';
import BottomActionsBar from '../components/layout/BottomActionsBar';
import { haversineDistanceKm } from '../utils/distanceUtils';

export default function MapPage() {
  const { stops, vehicles, offline } = useShuttleData();
  const userCoords = useLocation();
  const [selectedStop, setSelectedStop] = useState(null);

  const nearestStopInfo = useMemo(() => {
    if (!userCoords || stops.length === 0) return null;
    let best = null;
    stops.forEach((s) => {
      const d = haversineDistanceKm(userCoords, { lat: s.lat, lng: s.lng });
      if (d == null) return;
      if (!best || d < best.distanceKm) {
        best = { stop: s, distanceKm: d };
      }
    });
    return best;
  }, [userCoords, stops]);

  return (
    <main className="main-content">
      <div className="map-layout">
        <ShuttleMap
          stops={stops}
          vehicles={vehicles}
          selectedStopId={selectedStop?.stopId}
          onStopSelect={setSelectedStop}
        />
        <div className="map-sidebar">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Nearest stop</h3>
            {!userCoords && (
              <p style={{ fontSize: '0.88rem', color: 'var(--ualbany-text-muted)' }}>
                We&apos;ll highlight the nearest stop when your location is available.
              </p>
            )}
            {userCoords && !nearestStopInfo && (
              <p style={{ fontSize: '0.88rem', color: 'var(--ualbany-text-muted)' }}>
                Couldn&apos;t compute distances to stops.
              </p>
            )}
            {userCoords && nearestStopInfo && (
              <p style={{ fontSize: '0.9rem' }}>
                <strong>{nearestStopInfo.stop.name}</strong>
                <span style={{ color: 'var(--ualbany-text-muted)' }}>
                  {' '}
                  · ~{(nearestStopInfo.distanceKm * 1000).toFixed(0)} m away
                </span>
              </p>
            )}
          </div>
          <StopSelector
            stops={stops}
            selectedStopId={selectedStop?.stopId}
            onSelect={setSelectedStop}
          />
          <StopDetailsPanel selectedStop={selectedStop} offline={offline} />
          <BusList vehicles={vehicles} />
          <BottomActionsBar
            onFavorite={() => alert('Favorited (mock)')}
            onShare={() => alert('Share link copied (mock)')}
            onViewSchedule={() => alert('Schedule modal (mock)')}
          />
        </div>
      </div>
    </main>
  );
}
