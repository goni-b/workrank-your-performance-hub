import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface Employee {
  id: string;
  full_name: string;
  role: "manager" | "employee" | "admin" | "super_admin";
  job_title: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | "frozen";
  company_id: string | null;
  team_id: string | null;
  phone: string | null;
  start_date: string | null;
  notes?: string | null;
  created_at: string;
  team_name?: string | null;
}

export function useEmployees() {
  const { profile, selectedCompanyId } = useAuth();
  const companyId = selectedCompanyId ?? profile?.company_id ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const q = useQuery({
    queryKey: ["employees", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, teams ( name )")
        .eq("company_id", companyId!)
        .in("role", ["manager", "employee"])
        .order("full_name");
      if (error) throw error;
      return (data ?? []).map((e: any) => ({
        ...e,
        team_name: e.teams?.name ?? null,
      })) as Employee[];
    },
  });

  const all = q.data ?? [];
  const employees = all.filter((emp) => {
    const s = searchQuery.trim();
    const matchSearch =
      !s ||
      emp.full_name.includes(s) ||
      (emp.job_title ?? "").includes(s);
    const matchRole = filterRole === "all" || emp.role === filterRole;
    const matchStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return {
    employees,
    allCount: all.length,
    isLoading: q.isLoading,
    searchQuery, setSearchQuery,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    reload: q.refetch,
  };
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, teams ( name )")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, team_name: (data as any).teams?.name ?? null } as Employee;
    },
  });
}

export function useEmployeeMonthPoints(id: string) {
  return useQuery({
    queryKey: ["employee-month-points", id],
    enabled: !!id,
    queryFn: async () => {
      const start = new Date();
      start.setDate(1); start.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("points")
        .select("amount")
        .eq("user_id", id)
        .gte("created_at", start.toISOString());
      return (data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
    },
  });
}