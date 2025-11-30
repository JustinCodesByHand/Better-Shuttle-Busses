import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const campusCenter = { lat: 42.6865, lng: -73.8237 };

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function ShuttleMap({ stops, vehicles, selectedStopId, onStopSelect }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return <div className="map-wrapper card map-panel">Loading map...</div>;
  }

  return (
    <div className="map-wrapper map-panel">
      <GoogleMap mapContainerStyle={containerStyle} center={campusCenter} zoom={16}>
        {stops.map((stop) => (
          <Marker
            key={stop.stopId}
            position={{ lat: stop.lat, lng: stop.lng }}
            onClick={() => onStopSelect(stop)}
            icon={
              selectedStopId === stop.stopId
                ? {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#ffc72c',
                    fillOpacity: 1,
                    strokeColor: '#46166b',
                    strokeWeight: 2,
                  }
                : undefined
            }
          />
        ))}
        {vehicles.map((v) => (
          <Marker
            key={v.vehicleId}
            position={{ lat: v.lat, lng: v.lng }}
            icon={{
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#ffc72c',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
