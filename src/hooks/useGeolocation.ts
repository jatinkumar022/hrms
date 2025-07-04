import { useState, useCallback } from "react";
import { toast } from "sonner";

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: 1;
  POSITION_UNAVAILABLE: 2;
  TIMEOUT: 3;
}

interface UseGeolocationResult {
  location: string | null; // Format: "latitude,longitude"
  loading: boolean;
  error: string | null;
  getLocation: () => Promise<string | null>;
}

export const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setLocation(null);

    return new Promise<string | null>((resolve) => {
      if (!navigator.geolocation) {
        const errMsg = "Geolocation is not supported by your browser.";
        setError(errMsg);
        setLoading(false);
        toast.error(errMsg);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          const newLocation = `${latitude},${longitude}`;
          setLocation(newLocation);
          setLoading(false);
          toast.success("Location obtained successfully!");
          resolve(newLocation);
        },
        (geoError: GeolocationError) => {
          setLoading(false);
          let errorMessage = "Failed to get location.";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services for this site or grant permission.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case geoError.TIMEOUT:
              errorMessage =
                "The request to get user location timed out. Please try again.";
              break;
            default:
              errorMessage = `An unknown error occurred: ${
                geoError.message || "Check your browser settings."
              }`;
              break;
          }
          setError(errorMessage);
          toast.error(errorMessage);
          console.error("Geolocation Error:", geoError);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds timeout
          maximumAge: 0, // Do not use a cached position
        }
      );
    });
  }, []);

  return { location, loading, error, getLocation };
};
