import { useCallback, useEffect, useState } from "react";
import type { AdminBusinessOverview, CreatorApplication, User, UserRole } from "@spot/shared";
import { supabase } from "@/lib/supabase";

interface AdminState {
  businesses: AdminBusinessOverview[];
  pendingApplications: CreatorApplication[];
  users: User[];
  loading: boolean;
  reviewApplication: (applicationId: string, approve: boolean) => Promise<void>;
  setUserRole: (userId: string, role: UserRole) => Promise<void>;
  setAdminFlag: (userId: string, isAdmin: boolean) => Promise<void>;
  refresh: () => void;
}

export function useAdmin(): AdminState {
  const [businesses, setBusinesses] = useState<AdminBusinessOverview[]>([]);
  const [pendingApplications, setPendingApplications] = useState<CreatorApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const [businessRes, applicationsRes, usersRes] = await Promise.all([
      supabase.rpc("admin_business_overview"),
      supabase.from("creator_applications").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
    ]);

    setBusinesses((businessRes.data ?? []) as AdminBusinessOverview[]);
    setPendingApplications((applicationsRes.data ?? []) as CreatorApplication[]);
    setUsers((usersRes.data ?? []) as User[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reviewApplication(applicationId: string, approve: boolean) {
    await supabase.rpc("admin_review_creator_application", { p_application_id: applicationId, p_approve: approve });
    load();
  }

  async function setUserRole(userId: string, role: UserRole) {
    await supabase.rpc("admin_set_user_role", { p_user_id: userId, p_role: role });
    load();
  }

  async function setAdminFlag(userId: string, isAdmin: boolean) {
    await supabase.rpc("admin_set_admin_flag", { p_user_id: userId, p_is_admin: isAdmin });
    load();
  }

  return { businesses, pendingApplications, users, loading, reviewApplication, setUserRole, setAdminFlag, refresh: load };
}
