"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

interface UserProfileValue {
  username: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  canAccessDashboard: boolean;
}

const UserProfileContext = createContext<UserProfileValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setUsername(null);
      setRole(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("users")
      .select("username, role, is_admin")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        setUsername(data?.username ?? null);
        setRole((data?.role as UserRole | undefined) ?? null);
        setIsAdmin(Boolean(data?.is_admin));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo<UserProfileValue>(
    () => ({ username, role, isAdmin, loading, canAccessDashboard: role === "business" || isAdmin }),
    [username, role, isAdmin, loading]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile muss innerhalb von UserProfileProvider verwendet werden");
  return ctx;
}
