/**
 * Simple in-memory simulation of shuttle vehicles moving around campus stops.
 */

const campusCenter = { lat: 42.6865, lng: -73.8237 };

const stops = [
  {
    stopId: 'COLLINS_CIRCLE',
    name: 'Collins Circle',
    lat: 42.6869,
    lng: -73.8242,
    campusZone: 'Academic Podium',
  },
  {
    stopId: 'STATE_QUAD',
    name: 'State Quad',
    lat: 42.6881,
    lng: -73.8205,
    campusZone: 'Residence Halls',
  },
  {
    stopId: 'INDIAN_QUAD',
    name: 'Indian Quad',
    lat: 42.6856,
    lng: -73.8201,
    campusZone: 'Residence Halls',
  },
  {
    stopId: 'SCIENCE_LIBRARY',
    name: 'Science Library',
    lat: 42.6849,
    lng: -73.8225,
    campusZone: 'Academic Podium',
  },
  {
    stopId: 'BUS_STOP_SOCIAL_SCIENCES',
    name: 'Social Sciences Bus Stop',
    lat: 42.6872,
    lng: -73.8260,
    campusZone: 'Academic Podium',
  },
];

const vehicles = [
  {
    vehicleId: 'UAB-1',
    routeId: 'MAIN_LOOP',
    currentIndex: 0,
    progress: 0,
    speedKph: 22,
    lastSeen: new Date(),
  },
  {
    vehicleId: 'UAB-2',
    routeId: 'MAIN_LOOP',
    currentIndex: 2,
    progress: 0.5,
    speedKph: 18,
    lastSeen: new Date(),
  },
];

let intervalHandle = null;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function stepSimulation() {
  const now = new Date();
  const dtSeconds = 5; // assume called every 5s

  vehicles.forEach((v) => {
    const currentStop = stops[v.currentIndex];
    const nextStop = stops[(v.currentIndex + 1) % stops.length];

    // simplistic progress step
    const distanceFactor = 1 / 12; // roughly 1 minute per segment at this tick rate
    v.progress += distanceFactor;

    if (v.progress >= 1) {
      v.currentIndex = (v.currentIndex + 1) % stops.length;
      v.progress = 0;
    }

    const from = stops[v.currentIndex];
    const to = stops[(v.currentIndex + 1) % stops.length];

    v.lat = lerp(from.lat, to.lat, v.progress);
    v.lng = lerp(from.lng, to.lng, v.progress);
    v.lastSeen = now;
  });
}

function start() {
  if (intervalHandle) return;
  intervalHandle = setInterval(stepSimulation, 5000);
}

function getVehicles() {
  return vehicles.map((v) => ({
    vehicleId: v.vehicleId,
    routeId: v.routeId,
    lat: v.lat || campusCenter.lat,
    lng: v.lng || campusCenter.lng,
    speedKph: v.speedKph,
    lastSeen: v.lastSeen,
  }));
}

function getStops() {
  return stops;
}

function getEtaForStop(stopId) {
  const stop = stops.find((s) => s.stopId === stopId);
  if (!stop) return null;

  let best = null;

  vehicles.forEach((v) => {
    if (typeof v.lat !== 'number' || typeof v.lng !== 'number') return;

    const dLat = (v.lat - stop.lat) * (Math.PI / 180);
    const dLng = (v.lng - stop.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(stop.lat * (Math.PI / 180)) *
        Math.cos(v.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c;

    const speedKph = v.speedKph || 20;
    const hours = distanceKm / speedKph;
    const minutes = Math.max(1, Math.round(hours * 60));

    if (!best || minutes < best.etaMinutes) {
      best = {
        vehicleId: v.vehicleId,
        etaMinutes: minutes,
        distanceKm,
        lastSeen: v.lastSeen,
        speedKph,
      };
    }
  });

  if (!best) return null;

  let confidence = 'low';
  if (best.etaMinutes <= 3) confidence = 'high';
  else if (best.etaMinutes <= 7) confidence = 'medium';

  return {
    stopId,
    vehicleId: best.vehicleId,
    etaMinutes: best.etaMinutes,
    confidence,
    lastSeen: best.lastSeen,
    speedKph: best.speedKph,
  };
}

module.exports = {
  start,
  getVehicles,
  getStops,
  getEtaForStop,
};
