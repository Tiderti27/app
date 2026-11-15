import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import type { SpotCategory, SpotWithDistance } from "@spot/shared";
import { supabase } from "@/lib/supabase";
import { useSearchRadius } from "@/hooks/use-search-radius";

interface NearbySpotsState {
  spots: SpotWithDistance[];
  location: Location.LocationObjectCoords | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNearbySpots(category: SpotCategory | null): NearbySpotsState {
  const [spots, setSpots] = useState<SpotWithDistance[]>([]);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const { radius, loaded: radiusLoaded } = useSearchRadius();

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  useEffect(() => {
    if (!radiusLoaded) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!cancelled) {
          setError("Standortzugriff wurde nicht erlaubt.");
          setLoading(false);
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      if (cancelled) return;
      setLocation(position.coords);

      const { data, error: rpcError } = await supabase.rpc("spots_nearby", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        radius_meters: radius,
        category_filter: category,
      });

      if (cancelled) return;

      if (rpcError) {
        setError(rpcError.message);
      } else {
        setSpots((data ?? []) as SpotWithDistance[]);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [category, refreshToken, radius, radiusLoaded]);

  return { spots, location, loading, error, refresh };
}
