import { Link, useLocation, Outlet } from "react-router-dom";
import { Shield, ClipboardList, Trophy, BarChart3, Settings, ScrollText } from "lucide-react";

const ADMIN_LINKS = [
  { to: "/admin/inscricoes", label: "Inscrições Pendentes", icon: ClipboardList },
  { to: "/admin/campeonatos", label: "Campeonatos", icon: Trophy },
  { to: "/admin/grupos", label: "Grupos e Tabela", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { to: "/admin/logs", label: "Logs do Sistema", icon: ScrollText },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar-background shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <Shield className="w-6 h-6 text-sidebar-primary" />
          <span className="font-bold text-sidebar-primary text-lg" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.05em" }}>
            PAINEL ADMIN
          </span>
        </div>
        <nav className="flex-1 py-3 space-y-0.5">
          {ADMIN_LINKS.map((l) => {
            const isActive = location.pathname === l.to || (l.to === "/admin/inscricoes" && location.pathname === "/admin");
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary border-l-2 border-transparent"
                }`}
                style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.04em" }}
              >
                <l.icon className="w-4 h-4 shrink-0" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar-background border-t border-sidebar-border flex justify-around py-2">
        {ADMIN_LINKS.map((l) => {
          const isActive = location.pathname === l.to || (l.to === "/admin/inscricoes" && location.pathname === "/admin");
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium px-1 ${
                isActive ? "text-sidebar-primary" : "text-muted-foreground"
              }`}
            >
              <l.icon className="w-5 h-5" />
              {l.label.split(" ")[0]}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
