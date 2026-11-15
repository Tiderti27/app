import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "spot-search-radius";

export const DEFAULT_RADIUS_METERS = 5000;
export const RADIUS_OPTIONS = [2000, 5000, 10000, 25000, 50000];

export function useSearchRadius() {
  const [radius, setRadiusState] = useState(DEFAULT_RADIUS_METERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const parsed = stored ? Number(stored) : null;
      if (parsed && RADIUS_OPTIONS.includes(parsed)) setRadiusState(parsed);
      setLoaded(true);
    });
  }, []);

  function setRadius(next: number) {
    setRadiusState(next);
    AsyncStorage.setItem(STORAGE_KEY, String(next));
  }

  return { radius, setRadius, loaded };
}
