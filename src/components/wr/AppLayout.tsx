import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { isDevPreview } from "@/lib/auth-context";

export function AppLayout({ children }: { children: ReactNode }) {
  const devOffset = isDevPreview() ? 40 : 0;
  return (
    <div style={{ display: "flex", minHeight: "100vh", direction: "rtl", paddingTop: devOffset }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: 24 }} className="animate-slide-in">
          {children}
        </main>
      </div>
    </div>
  );
}
