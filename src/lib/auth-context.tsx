import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "manager" | "employee";

export interface Profile {
  id: string;
  full_name: string;
  role: AppRole;
  company_id: string | null;
  team_id: string | null;
  job_title: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | "frozen";
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("wr_selected_company");
  });

  const setSelectedCompanyId = (id: string | null) => {
    setSelectedCompanyIdState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem("wr_selected_company", id);
      else localStorage.removeItem("wr_selected_company");
    }
  };

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile((data as Profile) ?? null);
    if (data && (data as Profile).role !== "super_admin" && (data as Profile).company_id) {
      setSelectedCompanyIdState((data as Profile).company_id);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => { void loadProfile(s.user.id); }, 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user, session, profile, loading,
        selectedCompanyId, setSelectedCompanyId,
        signOut: async () => { await supabase.auth.signOut(); setSelectedCompanyId(null); },
        refreshProfile: async () => { if (user) await loadProfile(user.id); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
