import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Building2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/select-company")({ component: SelectCompany });

function SelectCompany() {
  const navigate = useNavigate();
  const { setSelectedCompanyId } = useAuth();
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => (await supabase.from("companies").select("*").order("name")).data ?? [],
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 800, margin: 0 }}>בחר חברה</h2>
        <p style={{ textAlign: "center", color: "#64748B", marginTop: 6 }}>בחר את החברה שברצונך לנהל</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 28 }}>
          {companies.map((c) => (
            <button key={c.id} onClick={() => { setSelectedCompanyId(c.id); navigate({ to: "/admin/dashboard" }); }}
              className="wr-card" style={{ padding: 32, textAlign: "right", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--wr-text)", fontFamily: "Heebo" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Building2 size={40} color="#F59E0B" />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>לחץ לכניסה לניהול</div>
                </div>
              </div>
              <ChevronLeft size={20} color="#64748B" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
