import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Menu, X, LogOut, Shield } from "lucide-react";
import { useState } from "react";

const PUBLIC_LINKS = [
  { to: "/", label: "Início" },
  { to: "/classificacao", label: "Classificação" },
  { to: "/partidas", label: "Partidas" },
];

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border" style={{ background: "hsl(160 30% 6% / 0.95)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em" }}>
              COPA MASTER
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link pb-1 ${location.pathname === l.to ? "active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-sm text-primary font-semibold uppercase tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/time" className="nav-link">Meu Time</Link>
                )}
                <button onClick={handleSignOut} className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/inscricao" className="nav-link">Inscrição</Link>
                <Link to="/login" className="btn-gold px-4 py-1.5 text-sm">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block nav-link py-1"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-border pt-3 space-y-2">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Admin</Link>}
                {!isAdmin && <Link to="/time" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Meu Time</Link>}
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block text-sm text-destructive">Sair</button>
              </>
            ) : (
              <>
                <Link to="/inscricao" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Inscrição</Link>
                <Link to="/login" className="btn-gold inline-block px-4 py-1.5 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
