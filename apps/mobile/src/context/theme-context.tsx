import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK_COLORS, LIGHT_COLORS, type ColorPalette, type ThemeMode, type ThemePreference } from "@spot/shared";

const STORAGE_KEY = "spot-theme-mode";

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  colors: ColorPalette;
  toggleMode: () => void;
  setMode: (mode: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") setPreferenceState(stored);
    });
  }, []);

  function setMode(next: ThemePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  function toggleMode() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  const mode: ThemeMode = preference === "system" ? (systemScheme === "light" ? "light" : "dark") : preference;
  const colors = mode === "light" ? LIGHT_COLORS : DARK_COLORS;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, preference, colors, toggleMode, setMode }),
    [mode, preference, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme muss innerhalb von ThemeProvider verwendet werden");
  return ctx;
}
