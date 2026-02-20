import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error("Email ou senha incorretos");
      return;
    }
    toast.success("Login realizado!");
    // Redirect after auth state settles
    setTimeout(() => {
      navigate(isAdmin ? "/admin" : "/time");
    }, 300);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-3 animate-glow" />
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
            COPA MASTER
          </h1>
          <p className="text-muted-foreground mt-1">Entre com sua conta</p>
        </div>

        <div className="card-copa-gold p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-copa"
                placeholder="seu@email.com"
                autoFocus
              />
            </div>

            <div>
              <label className="field-label block mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-copa pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta ainda?{" "}
            <Link to="/inscricao" className="text-primary hover:underline font-semibold">
              Faça sua inscrição
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
