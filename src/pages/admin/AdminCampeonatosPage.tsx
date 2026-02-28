import { useCampeonatos } from "@/hooks/useCopa";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Trophy, Lock, Plus, AlertTriangle } from "lucide-react";

export default function AdminCampeonatosPage() {
  const { campeonatos, refetch } = useCampeonatos();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const campeonato = campeonatos[selectedIdx] ?? campeonatos[0] ?? null;
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
    setLoadingAction("encerrar_camp");
    try {
      await supabase.from("campeonatos").update({ status: "encerrado" }).eq("id", campeonato.id);

      // Auto-criar novo campeonato
      const { data: activeCamps } = await supabase.from("campeonatos")
        .select("id, nome")
        .not("status", "eq", "encerrado");

      if ((activeCamps?.length ?? 0) < 4) {
        const baseName = campeonato.nome.replace(/\s+[1-8]$/, "");
        const usedNames = new Set((activeCamps ?? []).map((c: any) => c.nome));
        const suffixes = ["1", "2", "3", "4", "5", "6", "7", "8"];
        let newName = "";
        for (const s of suffixes) {
          const candidate = s ? `${baseName} ${s}` : baseName;
          if (!usedNames.has(candidate)) {
            newName = candidate;
            break;
          }
        }
        if (newName) {
          const { data: newCamp } = await supabase.from("campeonatos").insert({
            nome: newName,
            edicao: campeonato.edicao,
            status: "inscricoes_abertas",
            inscricoes_abertas: true,
            max_times: 16,
            times_confirmados: 0,
          }).select().single();

          if (newCamp) {
            for (const g of ["A", "B", "C", "D"]) {
              await supabase.from("grupos").insert({ campeonato_id: newCamp.id, nome: g });
            }
            await supabase.from("campeonato_timer").insert({
              campeonato_id: newCamp.id, status: "parado", tempo_acumulado: 0,
            });
            toast.success(`Novo campeonato "${newName}" criado automaticamente!`);
          }
        }
      }

      toast.info("Campeonato encerrado");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function criarNovoCampeonato() {
    setLoadingAction("criar");
    try {
      const { data: activeCamps } = await supabase.from("campeonatos")
        .select("id, nome")
        .not("status", "eq", "encerrado");

      if ((activeCamps?.length ?? 0) >= 4) {
        toast.error("Já existem 4 campeonatos ativos. Encerre um antes de criar outro.");
        return;
      }

      const baseName = campeonatos[0]?.nome?.replace(/\s+[1-8]$/, "") ?? "Corujão";
      const usedNames = new Set((activeCamps ?? []).map((c: any) => c.nome));
      const suffixes = ["1", "2", "3", "4", "5", "6", "7", "8"];
      let newName = "";
      for (const s of suffixes) {
        const candidate = s ? `${baseName} ${s}` : baseName;
        if (!usedNames.has(candidate)) {
          newName = candidate;
          break;
        }
      }
      if (!newName) {
        toast.error("Não foi possível gerar um nome disponível.");
        return;
      }

      const edicao = campeonatos[0]?.edicao ?? null;
      const { data: newCamp, error } = await supabase.from("campeonatos").insert({
        nome: newName,
        edicao,
        status: "inscricoes_abertas",
        inscricoes_abertas: true,
        max_times: 16,
        times_confirmados: 0,
      }).select().single();
      if (error) throw error;

      if (newCamp) {
        for (const g of ["A", "B", "C", "D"]) {
          await supabase.from("grupos").insert({ campeonato_id: newCamp.id, nome: g });
        }
        await supabase.from("campeonato_timer").insert({
          campeonato_id: newCamp.id, status: "parado", tempo_acumulado: 0,
        });
      }

      toast.success(`Campeonato "${newName}" criado com sucesso!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  if (!campeonato) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Nenhum campeonato ativo</p>
        <button
          onClick={criarNovoCampeonato}
          disabled={loadingAction === "criar"}
          className="btn-gold flex items-center gap-2 text-sm mx-auto mt-4"
        >
          <Plus className="w-4 h-4" />
          {loadingAction === "criar" ? "Criando..." : "Criar Novo Campeonato"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Campeonatos</h1>
        </div>
        <button
          onClick={criarNovoCampeonato}
          disabled={loadingAction === "criar"}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {loadingAction === "criar" ? "Criando..." : "Criar Novo Campeonato"}
        </button>
      </div>

      {/* Tabs */}
      {campeonatos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {campeonatos.map((c: any, i: number) => (
            <button
              key={c.id}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${selectedIdx === i
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              {c.nome}
            </button>
          ))}
        </div>
      )}

      <div className="card-copa p-6">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
          {campeonato.nome}
        </h3>
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
