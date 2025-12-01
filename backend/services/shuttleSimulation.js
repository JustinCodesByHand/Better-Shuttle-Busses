// backend/services/shuttleSimulation.js

// ------------------------
// Shuttle stops definition
// ------------------------

// Approximate coordinates for UAlbany shuttle stops.
// These are good enough for a mock tracker demo. You can refine lat/lng later if needed.
const STOPS = [
    {
        id: 'broadview-center',
        name: 'Broadview Center',
        position: { lat: 42.6828, lng: -73.8287 }, //42.68279031439063, -73.8286733070728
    },
    {
        id: 'collins-circle',
        name: 'Collins Circle',
        position: { lat: 42.6875, lng: -73.8223 }, //42.68752143186545, -73.82234250866232
    },
    {
        id: 'campus-center',
        name: 'Campus Center',
        position: { lat: 42.6850, lng: -73.8262 }, //42.685006511515496, -73.82618421713896
    },
    {
        id: 'social-science',
        name: 'Social Science',
        position: { lat: 42.6878, lng: -73.8266 }, //42.68767215276336, -73.82658118406533
    },
    {
        id: 'indigenous-quad',
        name: 'Indigenous Quad',
        position: { lat: 42.6830, lng: -73.8221 }, //42.68302889453888, -73.82213408152965
    },
    {
        id: 'empire-commons',
        name: 'Empire Commons',
        position: { lat: 42.6903, lng: -73.8277 }, //42.69025153201672, -73.82768278683221
    },
    {
        id: 'freedom-apartments',
        name: 'Freedom Apartments',
        position: { lat: 42.6898, lng: -73.8359 }, //42.68975015158865, -73.83585578601989
    },
    {
        id: 'liberty-terrace',
        name: 'Liberty Terrace',
        position: { lat: 42.6786, lng: -73.8205 }, //42.678606245008154, -73.82045423353111
    },
    {
        id: 'etec',
        name: 'ETEC',
        position: { lat: 42.6808, lng: -73.8172 }, //42.680783155319446, -73.81724362934816
    },
    {
        id: 'health-sciences-campus',
        name: 'Health Sciences Campus',
        position: { lat: 42.6278, lng: -73.7403 }, //42.62783994664228, -73.74029875917022
    },

];

// Helper to lookup stop by id
const STOP_BY_ID = STOPS.reduce((acc, stop) => {
    acc[stop.id] = stop;
    return acc;
}, {});

// --------------------------------------
// Vehicle simulation (simple fake GPS)
// --------------------------------------

const UPDATE_INTERVAL_MS = 2000; // how often we advance the simulation
let lastUpdate = Date.now();
let lastSyncTime = new Date();

// Define “routes” as sequences of stop IDs the buses loop through.
const ROUTES = [
    {
        id: 'purple-line',
        name: 'Purple Line',
        color: '#46166b',
        stops: [
            'campus-center',
            'collins-circle',
            'social-science',
            'indigenous-quad',
            'empire-commons',
            'freedom-apartments',
            'liberty-terrace',
            'campus-center',
        ],
    },
    {
        id: 'gold-line',
        name: 'Gold Line',
        color: '#ffc72c',
        stops: [
            'campus-center',
            'broadview-center',
            'empire-commons',
            'freedom-apartments',
            'liberty-terrace',
            'etec',
            'campus-center',
        ],
    },
    {
        id: 'downtown-link',
        name: 'Downtown Link',
        color: '#9b59ff',
        stops: [
            'campus-center',
            'collins-circle',
            'etec',
            'health-sciences-campus',
            'draper-hall',
            'campus-center',
        ],
    },
];

// Vehicles state: each vehicle travels along one of the routes above.
const vehicles = [
    {
        id: 'shuttle-1',
        label: 'Shuttle 1',
        routeId: 'purple-line',
        currentSegmentIndex: 0, // index in route stops array
        progress: 0, // 0..1 along segment
        speedKmh: 18, // ~campus bus speed
        lastSeen: new Date(),
    },
    {
        id: 'shuttle-2',
        label: 'Shuttle 2',
        routeId: 'gold-line',
        currentSegmentIndex: 1,
        progress: 0.35,
        speedKmh: 22,
        lastSeen: new Date(),
    },
    {
        id: 'shuttle-3',
        label: 'Shuttle 3',
        routeId: 'downtown-link',
        currentSegmentIndex: 2,
        progress: 0.7,
        speedKmh: 30,
        lastSeen: new Date(),
    },
];

let timer = null;

// Distance helper (rough, good enough for ETA & interpolation)
function haversineMeters(a, b) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinDlat = Math.sin(dLat / 2);
    const sinDlng = Math.sin(dLng / 2);

    const h =
        sinDlat * sinDlat +
        Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng;

    return 2 * R * Math.asin(Math.sqrt(h));
}

// Linear interpolate between two coordinates
function lerpPosition(a, b, t) {
    return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
    };
}

function getRouteById(routeId) {
    return ROUTES.find((r) => r.id === routeId);
}

// Advance a single vehicle along its route
function stepVehicle(vehicle, dtMs) {
    const route = getRouteById(vehicle.routeId);
    if (!route || route.stops.length < 2) return vehicle;

    const fromIndex = vehicle.currentSegmentIndex;
    const toIndex = (fromIndex + 1) % route.stops.length;

    const fromStop = STOP_BY_ID[route.stops[fromIndex]];
    const toStop = STOP_BY_ID[route.stops[toIndex]];

    if (!fromStop || !toStop) return vehicle;

    const segmentDistance = haversineMeters(
        fromStop.position,
        toStop.position
    );

    // speed m/s
    const speedMs = (vehicle.speedKmh * 1000) / 3600;
    // how much of the segment we traverse in dt
    const deltaProgress =
        segmentDistance > 0 ? (speedMs * dtMs) / (segmentDistance * 1000) : 0;

    let newProgress = vehicle.progress + deltaProgress;

    let currentSegmentIndex = fromIndex;
    while (newProgress >= 1) {
        newProgress -= 1;
        currentSegmentIndex = (currentSegmentIndex + 1) % route.stops.length;
    }

    return {
        ...vehicle,
        currentSegmentIndex: currentSegmentIndex,
        progress: newProgress,
        lastSeen: new Date(),
    };
}

// One simulation tick
function tick() {
    const now = Date.now();
    const dtMs = now - lastUpdate;
    lastUpdate = now;

    for (let i = 0; i < vehicles.length; i++) {
        vehicles[i] = stepVehicle(vehicles[i], dtMs);
    }

    lastSyncTime = new Date();
}

// Public: start the simulation loop
function start() {
    if (timer) return; // already running
    lastUpdate = Date.now();
    timer = setInterval(tick, UPDATE_INTERVAL_MS);
    console.log('[shuttleSimulation] started');
}

// Public: get stops
function getStops() {
    return STOPS.map((s) => ({
        stopId: s.id,
        name: s.name,
        lat: s.position.lat,
        lng: s.position.lng,
    }));
}

// Public: get current vehicle snapshot (with computed positions + ETA to next stop)
function getVehicles() {
    return vehicles.map((v) => {
        const route = getRouteById(v.routeId);
        if (!route) return v;

        const fromIndex = v.currentSegmentIndex;
        const toIndex = (fromIndex + 1) % route.stops.length;
        const fromStop = STOP_BY_ID[route.stops[fromIndex]];
        const toStop = STOP_BY_ID[route.stops[toIndex]];
        if (!fromStop || !toStop) return v;

        const position = lerpPosition(
            fromStop.position,
            toStop.position,
            v.progress
        );

        // Rough ETA to next stop
        const segmentDistance = haversineMeters(
            fromStop.position,
            toStop.position
        );
        const remainingDistance = segmentDistance * (1 - v.progress);
        const speedMs = (v.speedKmh * 1000) / 3600;
        const etaSeconds =
            speedMs > 0 ? Math.round(remainingDistance / speedMs) : null;

        return {
            id: v.id,
            label: v.label,
            routeId: v.routeId,
            routeName: route.name,
            color: route.color,
            position,
            nextStopId: toStop.id,
            nextStopName: toStop.name,
            speedKmh: v.speedKmh,
            etaSeconds,
            lastSeen: v.lastSeen,
        };
    });
}

// Static schedule for offline fallback (very simple, fake schedule)
function getStaticSchedule() {
    const now = new Date();
    const baseMinutes = now.getMinutes() - (now.getMinutes() % 15); // align to 15-min blocks

    return STOPS.map((stop, index) => {
        const blockOffset = (index * 5) % 30; // staggered in 5-min increments
        const dep = new Date(now);
        dep.setMinutes(baseMinutes + blockOffset);
        dep.setSeconds(0);
        dep.setMilliseconds(0);

        return {
            stopId: stop.id,
            stopName: stop.name,
            routeLabel:
                index % 3 === 0
                    ? 'Purple Line'
                    : index % 3 === 1
                        ? 'Gold Line'
                        : 'Downtown Link',
            scheduledTime: dep.toISOString(),
            etaVarianceMinutes: (index % 3) - 1, // -1, 0, +1
        };
    });
}

function getLastSyncTime() {
    return lastSyncTime;
}

module.exports = {
    start,
    getStops,
    getVehicles,
    getStaticSchedule,
    getLastSyncTime,
};
