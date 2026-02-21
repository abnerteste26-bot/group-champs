import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInscricoesPendentes } from "@/hooks/useCopa";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { ClipboardList, CheckCircle, XCircle, Loader2, UserPlus, Copy } from "lucide-react";

export default function AdminInscricoesPage() {
  const { inscricoes, loading, refetch } = useInscricoesPendentes();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastCredentials, setLastCredentials] = useState<{ nome: string; email: string; senha: string } | null>(null);

  async function confirmarInscricao(ins: any) {
    if (loadingAction) return;
    setLoadingAction(ins.id);
    try {
      const { data, error } = await supabase.functions.invoke("confirmar-inscricao", {
        body: {
          inscricao_id: ins.id,
          campeonato_id: ins.campeonato_id,
          nome_time: ins.nome_time,
          responsavel: ins.responsavel,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLastCredentials({ nome: ins.nome_time, email: data.email, senha: data.senha });
      toast.success(`Inscrição confirmada com sucesso.`);
      refetch();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao confirmar inscrição");
    } finally {
      setLoadingAction(null);
    }
  }

  async function rejeitarInscricao(ins: any) {
    if (loadingAction) return;
    setLoadingAction(ins.id);
    try {
      const { error } = await supabase
        .from("inscricoes_pendentes")
        .update({ status: "rejeitada" })
        .eq("id", ins.id);
      if (error) throw error;
      toast.success("Inscrição recusada.");
      refetch();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao recusar inscrição");
    } finally {
      setLoadingAction(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.info("Copiado!");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
          Inscrições Pendentes
        </h1>
        {!loading && (
          <span className="ml-2 bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-sm font-bold">
            {inscricoes.length}
          </span>
        )}
      </div>

      {/* Credenciais do último time aceito */}
      {lastCredentials && (
        <div className="card-copa-gold p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
              Login Gerado — {lastCredentials.nome}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="field-label">Login</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">{lastCredentials.email}</code>
                <button onClick={() => copyToClipboard(lastCredentials.email)} className="text-muted-foreground hover:text-primary">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <span className="field-label">Senha</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">{lastCredentials.senha}</code>
                <button onClick={() => copyToClipboard(lastCredentials.senha)} className="text-muted-foreground hover:text-primary">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setLastCredentials(null)} className="text-xs text-muted-foreground hover:text-foreground mt-3">
            Fechar
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-24 rounded-lg" />)}
        </div>
      ) : inscricoes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400/50" />
          <p className="text-lg font-medium">Nenhuma inscrição pendente</p>
          <p className="text-sm mt-1">Todas as inscrições foram processadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inscricoes.map((ins) => {
            const isProcessing = loadingAction === ins.id;
            return (
              <div key={ins.id} className="card-copa p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-lg text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
                        {ins.nome_time}
                      </span>
                      <StatusBadge status={ins.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Responsável: </span>
                        <span className="text-foreground font-medium">{ins.responsavel}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID: </span>
                        <span className="text-foreground font-mono text-xs">{ins.id.slice(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data: </span>
                        <span className="text-foreground">{new Date(ins.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                      {ins.campeonato?.nome && (
                        <div>
                          <span className="text-muted-foreground">Campeonato: </span>
                          <span className="text-foreground">{ins.campeonato.nome}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => confirmarInscricao(ins)}
                      disabled={isProcessing}
                      className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {isProcessing ? "Processando..." : "Aceitar"}
                    </button>
                    <button
                      onClick={() => rejeitarInscricao(ins)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Oswald, sans-serif" }}
                    >
                      <XCircle className="w-4 h-4" />
                      Recusar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
