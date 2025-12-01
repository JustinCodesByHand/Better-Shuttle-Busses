import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// Vite-style env (matches your .env setup)
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5070';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const DEFAULT_CENTER = { lat: 42.686, lng: -73.823 }; // Rough UAlbany campus center

function haversineMeters(a, b) {
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

export const ShuttleTracker = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [stops, setStops] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedStopId, setSelectedStopId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStop, setNearestStop] = useState(null);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    // --- Load stops ---
    useEffect(() => {
        async function loadStops() {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/stops`);
                const rawStops = res.data || [];

                // Normalize shape in case backend changed keys
                const normalized = rawStops
                    .map((s) => ({
                        id: s.id || s.stopId || s._id,
                        name: s.name || s.stopName,
                        lat:
                            typeof s.lat === 'number'
                                ? s.lat
                                : s.position?.lat ?? null,
                        lng:
                            typeof s.lng === 'number'
                                ? s.lng
                                : s.position?.lng ?? null,
                    }))
                    .filter((s) => s.id && s.name && s.lat && s.lng);

                setStops(normalized);

                if (normalized.length > 0) {
                    // Center the map roughly on the average of all stops
                    const avgLat =
                        normalized.reduce((sum, s) => sum + s.lat, 0) /
                        normalized.length;
                    const avgLng =
                        normalized.reduce((sum, s) => sum + s.lng, 0) /
                        normalized.length;
                    setMapCenter({ lat: avgLat, lng: avgLng });
                }
            } catch (err) {
                console.error('Error loading stops', err);
            }
        }

        loadStops();
    }, []);

    // --- Poll vehicles (simulated buses) ---
    useEffect(() => {
        let cancelled = false;

        async function loadVehicles() {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/vehicles`);
                if (!cancelled) {
                    const raw = res.data || [];
                    const normalized = raw
                        .map((v) => ({
                            id: v.id,
                            label: v.label || v.id,
                            routeName: v.routeName,
                            position: v.position,
                            nextStopName: v.nextStopName,
                            speedKmh: v.speedKmh,
                            etaSeconds: v.etaSeconds,
                        }))
                        .filter(
                            (v) =>
                                v.id &&
                                v.position &&
                                typeof v.position.lat === 'number' &&
                                typeof v.position.lng === 'number'
                        );
                    setVehicles(normalized);
                }
            } catch (err) {
                console.error('Error loading vehicles', err);
            }
        }

        loadVehicles();
        const id = setInterval(loadVehicles, 3000); // 3s poll

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    // --- Get user location for nearest stop ---
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setUserLocation(loc);
                // If map isn't centered yet, center on user
                setMapCenter((prev) => prev || loc);
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

    // --- Compute nearest stop (when we have userLocation + stops) ---
    useEffect(() => {
        if (!userLocation || stops.length === 0) return;

        let best = null;
        let bestDistance = Infinity;

        stops.forEach((stop) => {
            const d = haversineMeters(userLocation, {
                lat: stop.lat,
                lng: stop.lng,
            });
            if (d < bestDistance) {
                bestDistance = d;
                best = { ...stop, distanceMeters: d };
            }
        });

        setNearestStop(best || null);
    }, [userLocation, stops]);

    const filteredStops = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return stops;
        return stops.filter((s) =>
            s.name.toLowerCase().includes(term)
        );
    }, [stops, searchTerm]);

    const selectedStop = useMemo(
        () => stops.find((s) => s.id === selectedStopId),
        [stops, selectedStopId]
    );

    if (loadError) {
        return <div>Failed to load Google Maps.</div>;
    }

    if (!isLoaded) {
        return <div>Loading map…</div>;
    }

    return (
        <div className="shuttle-tracker">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1>UAlbany Shuttle Live</h1>
                    <p>Mock shuttle tracker with live simulation on campus.</p>
                </div>
            </header>

            {/* Main layout */}
            <main className="main-content">
                <div className="layout">
                    {/* Left: controls + stop list */}
                    <section className="panel left-panel">
                        {/* Nearest stop */}
                        <div className="card">
                            <h2>Nearest Shuttle Stop</h2>
                            {nearestStop ? (
                                <p>
                                    <strong>{nearestStop.name}</strong>
                                    <br />
                                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    ~
                                        {nearestStop.distanceMeters > 1000
                                            ? `${(nearestStop.distanceMeters / 1000).toFixed(
                                                1
                                            )} km`
                                            : `${nearestStop.distanceMeters.toFixed(0)} m`}{' '}
                                        from your location
                  </span>
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                    Turn on location to see your closest shuttle pickup
                                    stop.
                                </p>
                            )}
                        </div>

                        {/* Stop search + list */}
                        <div className="card">
                            <h2>Shuttle Stops</h2>
                            <input
                                type="text"
                                placeholder="Search stops…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <div className="stops-list">
                                {filteredStops.map((stop) => (
                                    <div
                                        key={stop.id}
                                        className={`stop-item ${
                                            selectedStopId === stop.id ? 'selected' : ''
                                        }`}
                                        onClick={() => setSelectedStopId(stop.id)}
                                    >
                                        <div className="stop-name">{stop.name}</div>
                                        <div className="stop-meta">Tap to highlight on map</div>
                                    </div>
                                ))}
                                {filteredStops.length === 0 && (
                                    <div className="empty-state">
                                        No stops match your search.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vehicles list (for reference) */}
                        <div className="card">
                            <h2>Shuttles In Service (Simulated)</h2>
                            {vehicles.length === 0 && (
                                <div className="empty-state">
                                    No shuttles visible yet.
                                </div>
                            )}
                            <div className="vehicles-list">
                                {vehicles.map((v) => (
                                    <div key={v.id} className="vehicle-item">
                                        <div className="vehicle-main">
                      <span className="vehicle-label">
                        🚌 {v.label}
                      </span>
                                            <span className="vehicle-route">
                        {v.routeName}
                      </span>
                                        </div>
                                        <div className="vehicle-meta">
                                            Next: {v.nextStopName || '—'} · ETA:{' '}
                                            {typeof v.etaSeconds === 'number'
                                                ? `${Math.round(v.etaSeconds / 60)} min`
                                                : '—'}{' '}
                                            · Speed: {v.speedKmh || 20} mph
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Right: Map */}
                    <section className="panel map-panel">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={14}
                            options={{
                                disableDefaultUI: true,
                                fullscreenControl: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                            }}
                        >
                            {/* User location */}
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
                                    label={
                                        selectedStopId === stop.id
                                            ? {
                                                text: stop.name,
                                                fontSize: '10px',
                                            }
                                            : undefined
                                    }
                                />
                            ))}

                            {/* Bus markers (simulated vehicles) */}
                            {vehicles.map((v) => (
                                <Marker
                                    key={v.id}
                                    position={{
                                        lat: v.position.lat,
                                        lng: v.position.lng,
                                    }}
                                    label={{
                                        text: '🚌',
                                        fontSize: '20px',
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ShuttleTracker;
