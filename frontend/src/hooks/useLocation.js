import { useEffect, useState } from 'react';

export function useLocation() {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return coords;
}
