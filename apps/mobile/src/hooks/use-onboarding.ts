import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "spot_onboarding_seen";

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setHasSeenOnboarding(value === "true");
    });
  }, []);

  async function markSeen() {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setHasSeenOnboarding(true);
  }

  return { hasSeenOnboarding, markSeen };
}
