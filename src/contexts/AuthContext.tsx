import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  timeId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeId, setTimeId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkRole(session.user.id);
        } else {
          setIsAdmin(false);
          setTimeId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkRole(userId: string) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    setIsAdmin(roleData?.role === "admin");

    if (roleData?.role !== "admin") {
      const { data: timeData } = await supabase
        .from("times")
        .select("id")
        .eq("user_id", userId)
        .single();
      setTimeId(timeData?.id ?? null);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signOut() {
    try {
      // Inicia a chamada à API para invalidar a sessão sem travar a interface
      supabase.auth.signOut().catch((e) => console.error("Erro na API de logout:", e));
    } finally {
      // Limpeza manual e garantida do storage local
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.localStorage.removeItem(key);
        }
      });
      Object.keys(window.sessionStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.sessionStorage.removeItem(key);
        }
      });

      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setTimeId(null);

      window.location.replace("/");
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, timeId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
