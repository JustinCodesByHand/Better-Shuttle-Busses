import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useShuttleData() {
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let socket;

    async function fetchInitial() {
      try {
        const resStops = await axios.get(`${API_BASE_URL}/api/stops`);
        setStops(resStops.data || []);
        const resVehicles = await axios.get(`${API_BASE_URL}/api/vehicles`);
        setVehicles(resVehicles.data || []);
      } catch (e) {
        console.error('Error fetching initial shuttle data', e);
      }
    }

    fetchInitial();

    try {
      socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
      socket.on('connect', () => setOffline(false));
      socket.on('disconnect', () => setOffline(true));
      socket.on('vehicles:update', (data) => {
        setVehicles(data || []);
      });
    } catch (e) {
      console.error('Socket error', e);
      setOffline(true);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return { stops, vehicles, offline };
}
