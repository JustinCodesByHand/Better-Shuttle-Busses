import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5070';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const DEFAULT_CENTER = { lat: 42.6869, lng: -73.8233 };

function haversineDistanceMeters(a, b) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);

    const h =
        sinDLat * sinDLat +
        Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
}

export default function MapPage() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [stops, setStops] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedStopId, setSelectedStopId] = useState(null);
    const [nearestStop, setNearestStop] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [trackedVehicleId, setTrackedVehicleId] = useState(null);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    // Load stops
    useEffect(() => {
        async function loadStops() {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/stops`);
                setStops(res.data || []);
            } catch (e) {
                console.error('Error loading stops', e);
            }
        }
        loadStops();
    }, []);

    // Poll vehicles every few seconds
    useEffect(() => {
        let cancelled = false;

        async function loadVehicles() {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/vehicles`);
                if (!cancelled) {
                    setVehicles(res.data || []);
                }
            } catch (e) {
                console.error('Error loading vehicles', e);
            }
        }

        loadVehicles();
        const id = setInterval(loadVehicles, 3000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    // Ask for user geolocation to suggest nearest stop
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported in this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => {
                console.warn('Geolocation error', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }, []);

    // Compute nearest stop once we have user location + stops
    useEffect(() => {
        if (!userLocation || stops.length === 0) return;

        let best = null;
        let bestDistance = Infinity;

        stops.forEach((stop) => {
            if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number')
                return;

            const d = haversineDistanceMeters(
                userLocation,
                { lat: stop.lat, lng: stop.lng }
            );
            if (d < bestDistance) {
                bestDistance = d;
                best = { ...stop, distanceMeters: d };
            }
        });

        if (best) {
            setNearestStop(best);
            // If user hasn't manually chosen a stop yet, auto-select nearest
            setSelectedStopId((prev) => prev ?? best.id);
        }
    }, [userLocation, stops]);

    // When tracking a vehicle, keep map centered on it
    useEffect(() => {
        if (!trackedVehicleId) return;
        const v = vehicles.find((veh) => veh.id === trackedVehicleId);
        if (v && v.position) {
            setMapCenter({
                lat: v.position.lat,
                lng: v.position.lng,
            });
        }
    }, [trackedVehicleId, vehicles]);

    const selectedStop = useMemo(
        () => stops.find((s) => s.id === selectedStopId),
        [stops, selectedStopId]
    );

    if (loadError) {
        return (
            <main className="main-content">
                <div className="card">Error loading Google Maps.</div>
            </main>
        );
    }

    if (!isLoaded) {
        return (
            <main className="main-content">
                <div className="card">Loading map…</div>
            </main>
        );
    }

    return (
        <main className="main-content map-layout">
            {/* Left side panel */}
            <section className="card" style={{ maxWidth: 360 }}>
                <h2 style={{ marginTop: 0 }}>UAlbany Shuttle</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ualbany-text-muted)' }}>
                    Live simulated shuttles on campus. Pick a stop or track a shuttle in
                    real time.
                </p>

                {/* Nearest stop based on live location */}
                <div
                    style={{
                        marginTop: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(141, 110, 255, 0.1)',
                        border: '1px solid rgba(141, 110, 255, 0.7)',
                        fontSize: '0.85rem',
                    }}
                >
                    <strong>Nearest stop:</strong>{' '}
                    {nearestStop ? (
                        <>
                            {nearestStop.name}{' '}
                            <span style={{ opacity: 0.8 }}>
                (
                                {nearestStop.distanceMeters > 1000
                                    ? `${(nearestStop.distanceMeters / 1000).toFixed(1)} km`
                                    : `${nearestStop.distanceMeters.toFixed(0)} m`}
                                )
              </span>
                        </>
                    ) : (
                        'Unknown (location off or still loading)'
                    )}
                </div>

                {/* Stop selector */}
                <div style={{ marginTop: '0.9rem' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: '0.35rem',
                            color: 'var(--ualbany-text-muted)',
                        }}
                    >
                        Choose a stop
                    </label>
                    <select
                        value={selectedStopId || ''}
                        onChange={(e) => setSelectedStopId(e.target.value || null)}
                        style={{
                            width: '100%',
                            borderRadius: '999px',
                            padding: '0.45rem 0.75rem',
                            border: '1px solid rgba(255,255,255,0.18)',
                            background: 'rgba(13, 6, 40, 0.9)',
                            color: 'white',
                            fontSize: '0.9rem',
                        }}
                    >
                        <option value="">Select a stop…</option>
                        {stops.map((stop) => (
                            <option key={stop.id} value={stop.id}>
                                {stop.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected stop details + soonest arrival (approx from vehicles) */}
                <div style={{ marginTop: '0.9rem', fontSize: '0.85rem' }}>
                    {selectedStop ? (
                        <>
                            <div style={{ marginBottom: '0.35rem' }}>
                                <strong>Selected stop:</strong> {selectedStop.name}
                            </div>
                            <div style={{ marginBottom: '0.35rem' }}>
                                <strong>Soonest arrival (sim):</strong>{' '}
                                {(() => {
                                    const arrivals = vehicles
                                        .filter(
                                            (v) => v.nextStopName === selectedStop.name
                                        )
                                        .map((v) => v.etaSeconds)
                                        .filter((x) => typeof x === 'number');

                                    if (arrivals.length === 0) return 'No active bus aimed here';

                                    const minEta = Math.min(...arrivals);
                                    return `${Math.round(minEta / 60)} min`;
                                })()}
                            </div>
                        </>
                    ) : (
                        <div style={{ opacity: 0.8 }}>
                            Choose a stop to see simulated arrival info.
                        </div>
                    )}
                </div>

                {/* Shuttles list with Track buttons */}
                <div style={{ marginTop: '1.1rem' }}>
                    <h3
                        style={{
                            margin: 0,
                            marginBottom: '0.4rem',
                            fontSize: '0.95rem',
                        }}
                    >
                        Shuttles in service
                    </h3>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                        }}
                    >
                        {vehicles.map((v) => (
                            <div
                                key={v.id}
                                style={{
                                    padding: '0.5rem 0.6rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(15, 6, 40, 0.8)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <div>
                                    <div>
                                        <strong>{v.label || v.id}</strong>{' '}
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                opacity: 0.8,
                                                marginLeft: '0.25rem',
                                            }}
                                        >
                      {v.routeName}
                    </span>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        Next: {v.nextStopName || '—'}
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        ETA:{' '}
                                        {typeof v.etaSeconds === 'number'
                                            ? `${Math.round(v.etaSeconds / 60)} min`
                                            : '—'}
                                        {' · '}
                                        Speed: {v.speedKmh || 20} mph
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTrackedVehicleId(
                                            trackedVehicleId === v.id ? null : v.id
                                        )
                                    }
                                    style={{
                                        borderRadius: '999px',
                                        border: 'none',
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background:
                                            trackedVehicleId === v.id
                                                ? 'linear-gradient(120deg, rgba(255,199,44,0.95), rgba(255,241,188,0.98))'
                                                : 'rgba(255,199,44,0.15)',
                                        color:
                                            trackedVehicleId === v.id ? '#1c1237' : '#ffc72c',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {trackedVehicleId === v.id ? 'Tracking' : 'Track'}
                                </button>
                            </div>
                        ))}
                        {vehicles.length === 0 && (
                            <div style={{ opacity: 0.8 }}>No shuttles visible yet.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Map area */}
            <section className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    options={{
                        disableDefaultUI: true,
                        fullscreenControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    {/* User location marker */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            label={{
                                text: 'You',
                                fontSize: '10px',
                                color: '#ffffff',
                            }}
                        />
                    )}

                    {/* Stops */}
                    {stops.map((stop) => (
                        <Marker
                            key={stop.id}
                            position={{ lat: stop.lat, lng: stop.lng }}
                            onClick={() => setSelectedStopId(stop.id)}
                        />
                    ))}

                    {/* Vehicles (shuttle icons) */}
                    {vehicles.map((v) => {
                        if (!v.position) return null;
                        return (
                            <Marker
                                key={v.id}
                                position={{
                                    lat: v.position.lat,
                                    lng: v.position.lng,
                                }}
                                label={{
                                    text: v.label || 'Bus',
                                    fontSize: '10px',
                                    color: '#1c1237',
                                }}
                            />
                        );
                    })}
                </GoogleMap>
            </section>
        </main>
    );
}
