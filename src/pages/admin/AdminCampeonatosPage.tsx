import { useCampeonato } from "@/hooks/useCopa";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Trophy, Lock, Play, AlertTriangle } from "lucide-react";

export default function AdminCampeonatosPage() {
  const { campeonato, refetch } = useCampeonato();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function encerrarInscricoes() {
    if (!campeonato) return;
    if (!confirm("Encerrar inscrições e gerar partidas automaticamente?")) return;
    setLoadingAction("encerrar");
    try {
      await supabase.from("campeonatos").update({ status: "inscricoes_encerradas", inscricoes_abertas: false }).eq("id", campeonato.id);
      const { data, error } = await supabase.functions.invoke("gerar-partidas", { body: { campeonato_id: campeonato.id } });
      if (error) throw error;
      toast.success(`Inscrições encerradas. ${data?.count ?? 0} partidas geradas!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function encerrarCampeonato() {
    if (!campeonato) return;
    if (!confirm("Encerrar campeonato definitivamente?")) return;
    await supabase.from("campeonatos").update({ status: "encerrado" }).eq("id", campeonato.id);
    toast.info("Campeonato encerrado");
    refetch();
  }

  if (!campeonato) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Nenhum campeonato ativo</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Campeonatos</h1>
      </div>

      <div className="card-copa p-6">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>Campeonato Atual</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="field-label">Nome</span><p className="text-foreground mt-1">{campeonato.nome}</p></div>
          <div><span className="field-label">Edição</span><p className="text-foreground mt-1">{campeonato.edicao ?? "—"}</p></div>
          <div><span className="field-label">Status</span><div className="mt-1"><StatusBadge status={campeonato.status} /></div></div>
          <div><span className="field-label">Máx. Times</span><p className="text-foreground mt-1">{campeonato.max_times}</p></div>
          <div><span className="field-label">Confirmados</span><p className="text-foreground mt-1">{campeonato.times_confirmados}</p></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {campeonato.inscricoes_abertas && (
          <button onClick={encerrarInscricoes} disabled={loadingAction === "encerrar"} className="btn-gold flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            {loadingAction === "encerrar" ? "Processando..." : "Encerrar Inscrições"}
          </button>
        )}
      </div>

      <div className="card-copa p-6 border-destructive/30">
        <h3 className="text-lg font-bold mb-4 text-destructive flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
          <AlertTriangle className="w-5 h-5" />
          Zona de Perigo
        </h3>
        <button
          onClick={encerrarCampeonato}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors w-full justify-center font-bold uppercase tracking-wider text-sm"
          style={{ fontFamily: "Oswald, sans-serif" }}
        >
          <Lock className="w-4 h-4" />
          Encerrar Campeonato
        </button>
      </div>
    </div>
  );
}
