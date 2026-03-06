'use client';

import { useState, useCallback } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        // Silently fail — GPS is optional
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { position, requestPosition };
}
