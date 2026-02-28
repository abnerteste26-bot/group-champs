import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Eye, EyeOff, UserPlus, LogIn, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cadastradoUserId, setCadastradoUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
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
    // Check role after login to determine redirect
    const { data: { user: loggedUser } } = await supabase.auth.getUser();
    if (loggedUser) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", loggedUser.id)
        .single();
      navigate(roleData?.role === "admin" ? "/admin" : "/time");
    } else {
      navigate("/");
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || !nome.trim()) return;
    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nome: nome.trim() } },
      });
      if (error) throw error;
      if (data.user) {
        setCadastradoUserId(data.user.id);
        toast.success("Conta criada com sucesso!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  async function copyUserId() {
    if (!cadastradoUserId) return;
    await navigator.clipboard.writeText(cadastradoUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Tela pós-cadastro: exibe user_id para promover a admin
  if (cadastradoUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-3 animate-glow" />
            <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
              CONTA CRIADA!
            </h1>
          </div>

          <div className="card-copa-gold p-6 space-y-5">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold">Conta criada com sucesso</p>
              <p className="text-sm text-muted-foreground mt-1">Email: {email}</p>
            </div>

            <div>
              <p className="field-label block mb-2">Seu User ID (para promover a Admin):</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono text-foreground break-all">
                  {cadastradoUserId}
                </code>
                <button
                  onClick={copyUserId}
                  className="shrink-0 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
                📋 Para tornar-se Admin:
              </p>
              <p className="text-xs text-muted-foreground">
                1. Acesse o painel do banco de dados pelo botão abaixo
              </p>
              <p className="text-xs text-muted-foreground">
                2. Abra o <strong className="text-foreground">SQL Editor</strong>
              </p>
              <p className="text-xs text-muted-foreground">3. Execute o SQL:</p>
              <div className="relative">
                <code className="block bg-muted rounded p-3 text-xs font-mono text-foreground whitespace-pre">
                  {`INSERT INTO user_roles (user_id, role)
VALUES ('${cadastradoUserId}', 'admin');`}
                </code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `INSERT INTO user_roles (user_id, role)\nVALUES ('${cadastradoUserId}', 'admin');`
                    );
                    toast.success("SQL copiado!");
                  }}
                  className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => { setMode("login"); setCadastradoUserId(null); }}
              className="btn-gold w-full"
            >
              Ir para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-3 animate-glow" />
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
            MASTER CUP
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === "login" ? "Entre com sua conta" : "Criar nova conta"}
          </p>
        </div>

        {/* Toggle Login / Cadastro */}
        <div className="flex gap-1 mb-5 bg-muted/30 rounded-xl p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
          <button
            onClick={() => setMode("cadastro")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "cadastro" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            <UserPlus className="w-4 h-4" />
            Criar Conta
          </button>
        </div>

        <div className="card-copa-gold p-8">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
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

              <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCadastro} className="space-y-5">
              <div>
                <label className="field-label block mb-1.5">Seu Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  maxLength={80}
                  className="input-copa"
                  placeholder="Nome completo"
                  autoFocus
                />
              </div>

              <div>
                <label className="field-label block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-copa"
                  placeholder="seu@email.com"
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
                    minLength={6}
                    className="input-copa pr-10"
                    placeholder="Mínimo 6 caracteres"
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

              <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                {loading ? "Criando conta..." : "Criar Conta"}
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setMode("cadastro")} className="text-primary hover:underline font-semibold">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-semibold">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
