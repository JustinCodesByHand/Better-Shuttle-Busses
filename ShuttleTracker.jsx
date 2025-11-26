/**
 * UAlbany Shuttle Live - Frontend Components
 * Example React components for the shuttle tracking system
 */

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Main Shuttle Tracker Component
export const ShuttleTracker = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Load initial data
    loadInitialData();

    // Subscribe to real-time updates
    newSocket.on('vehicles:update', (updatedVehicles) => {
      setVehicles(updatedVehicles);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [stopsRes, routesRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stops`),
        axios.get(`${API_BASE_URL}/api/routes`),
        axios.get(`${API_BASE_URL}/api/vehicles`)
      ]);

      setStops(stopsRes.data.data);
      setRoutes(routesRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSelect = async (stop) => {
    setSelectedStop(stop);
    
    // Subscribe to stop updates via WebSocket
    if (socket) {
      socket.emit('subscribe:stop', stop.stopId);
    }

    // Load arrivals for this stop
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/arrivals/${stop.stopId}`
      );
      setArrivals(response.data.data);
    } catch (error) {
      console.error('Error loading arrivals:', error);
      setArrivals([]);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="shuttle-tracker">
      <Header />
      <div className="container">
        <div className="sidebar">
          <StopSelector 
            stops={stops} 
            onSelectStop={handleStopSelect}
            selectedStop={selectedStop}
          />
          <RouteList routes={routes} />
        </div>
        <div className="main-content">
          <Map 
            stops={stops} 
            vehicles={vehicles} 
            selectedStop={selectedStop}
          />
          {selectedStop && (
            <ArrivalBoard 
              stop={selectedStop} 
              arrivals={arrivals}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>🚌 UAlbany Shuttle Live</h1>
        <div className="header-info">
          <span className="status-indicator">● Live</span>
          <span className="current-time">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  );
};

// Stop Selector Component
const StopSelector = ({ stops, onSelectStop, selectedStop }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStops = stops.filter(stop =>
    stop.stopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stop-selector">
      <h2>Shuttle Stops</h2>
      <input
        type="text"
        placeholder="Search stops..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="stops-list">
        {filteredStops.map(stop => (
          <div
            key={stop.stopId}
            className={`stop-item ${selectedStop?.stopId === stop.stopId ? 'selected' : ''}`}
            onClick={() => onSelectStop(stop)}
          >
            <span className="stop-name">{stop.stopName}</span>
            {stop.amenities?.shelter && <span className="amenity-icon">🏠</span>}
            {stop.amenities?.accessible && <span className="amenity-icon">♿</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Route List Component
const RouteList = ({ routes }) => {
  return (
    <div className="route-list">
      <h2>Active Routes</h2>
      <div className="routes">
        {routes.map(route => (
          <div key={route.routeId} className="route-item">
            <div 
              className="route-color" 
              style={{ backgroundColor: route.color || '#512B81' }}
            />
            <div className="route-info">
              <span className="route-name">{route.routeName}</span>
              <span className="route-stops">{route.stops?.length || 0} stops</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Arrival Board Component
const ArrivalBoard = ({ stop, arrivals }) => {
  const formatArrivalTime = (arrival) => {
    const now = new Date();
    const arrivalTime = new Date(arrival.estimatedArrival);
    const diffMinutes = Math.round((arrivalTime - now) / 60000);
    
    if (diffMinutes <= 0) return 'Arriving';
    if (diffMinutes === 1) return '1 min';
    return `${diffMinutes} mins`;
  };

  const getCrowdingIcon = (level) => {
    switch(level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="arrival-board">
      <h2>Next Arrivals at {stop.stopName}</h2>
      {arrivals.length === 0 ? (
        <div className="no-arrivals">
          <p>No shuttles scheduled in the next 30 minutes</p>
        </div>
      ) : (
        <div className="arrivals-list">
          {arrivals.map((arrival, index) => (
            <div key={index} className="arrival-item">
              <div className="arrival-route">{arrival.routeId}</div>
              <div className="arrival-time">{formatArrivalTime(arrival)}</div>
              <div className="arrival-crowding">
                {getCrowdingIcon(arrival.crowdingLevel)}
              </div>
              {arrival.delay > 0 && (
                <span className="delay-indicator">+{arrival.delay}min</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Map Component (placeholder - would use Google Maps or Mapbox)
const Map = ({ stops, vehicles, selectedStop }) => {
  return (
    <div className="map-container">
      <div className="map-placeholder">
        <h3>Interactive Map</h3>
        <p>Showing {vehicles.length} active shuttles</p>
        {selectedStop && (
          <p>Selected: {selectedStop.stopName}</p>
        )}
        <div className="map-legend">
          <span>🚌 Active Shuttle</span>
          <span>📍 Stop</span>
          <span>⭐ Selected Stop</span>
        </div>
      </div>
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner"></div>
        <h2>Loading UAlbany Shuttle Data...</h2>
      </div>
    </div>
  );
};

// CSS Styles (would typically be in separate .css file)
export const styles = `
.shuttle-tracker {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #512B81 0%, #FDB813 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  color: #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.container {
  max-width: 1400px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding: 0 2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stop-selector, .route-list, .arrival-board {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stop-selector h2, .route-list h2, .arrival-board h2 {
  margin: 0 0 1rem 0;
  color: #512B81;
  font-size: 1.3rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stops-list {
  max-height: 400px;
  overflow-y: auto;
}

.stop-item {
  padding: 0.75rem;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stop-item:hover {
  background-color: #f8f8f8;
  border-left-color: #FDB813;
}

.stop-item.selected {
  background-color: #512B81;
  color: white;
  border-left-color: #FDB813;
}

.amenity-icon {
  margin-left: 0.5rem;
}

.route-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.route-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 1rem;
}

.route-info {
  display: flex;
  flex-direction: column;
}

.route-name {
  font-weight: 500;
}

.route-stops {
  font-size: 0.85rem;
  color: #666;
}

.arrivals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.arrival-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 4px;
  gap: 1rem;
}

.arrival-route {
  font-weight: 500;
}

.arrival-time {
  font-size: 1.2rem;
  color: #512B81;
  font-weight: 600;
}

.delay-indicator {
  font-size: 0.85rem;
  color: #ff6b6b;
  background: #ffe0e0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.map-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 500px;
}

.map-placeholder {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #512B81 0%, #FDB813 100%);
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-arrivals {
  padding: 2rem;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  .stops-list {
    max-height: 200px;
  }
}
`;

export default ShuttleTracker;
