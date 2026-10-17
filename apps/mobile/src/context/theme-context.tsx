import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK_COLORS, LIGHT_COLORS, type ColorPalette, type ThemeMode } from "@spot/shared";

const STORAGE_KEY = "spot-theme-mode";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorPalette;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(systemScheme === "light" ? "light" : "dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") setModeState(stored);
    });
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  function toggleMode() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  const colors = mode === "light" ? LIGHT_COLORS : DARK_COLORS;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors, toggleMode, setMode }),
    [mode, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme muss innerhalb von ThemeProvider verwendet werden");
  return ctx;
}
