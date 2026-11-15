import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "spot-default-view-mode";

export type DefaultViewMode = "map" | "list";

export function useDefaultViewMode() {
  const [defaultViewMode, setDefaultViewModeState] = useState<DefaultViewMode>("map");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "map" || stored === "list") setDefaultViewModeState(stored);
      setLoaded(true);
    });
  }, []);

  function setDefaultViewMode(next: DefaultViewMode) {
    setDefaultViewModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  return { defaultViewMode, setDefaultViewMode, loaded };
}
