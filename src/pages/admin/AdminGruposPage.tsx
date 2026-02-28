import { useState, useEffect } from "react";
import { useCampeonato, useGrupos, usePartidas } from "@/hooks/useCopa";
import { supabase } from "@/integrations/supabase/client";
import ClassificacaoTable from "@/components/ClassificacaoTable";
import PartidasList from "@/components/PartidasList";
import TimeAvatar from "@/components/TimeAvatar";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import {
  BarChart3, Play, RefreshCw, AlertTriangle, Edit, Trash2, Users, CheckCircle, Loader2
} from "lucide-react";

export default function AdminGruposPage() {
  const { campeonato } = useCampeonato();
  const { grupos } = useGrupos(campeonato?.id ?? null);
  const { partidas, loading: pLoading, refetch: refetchPartidas } = usePartidas(campeonato?.id ?? null);
  const [times, setTimes] = useState<any[]>([]);
  const [allClassificacao, setAllClassificacao] = useState<Record<string, any[]>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [editPartida, setEditPartida] = useState<any>(null);

  useEffect(() => { fetchTimes(); fetchClassificacao(); }, [campeonato?.id]);

  async function fetchTimes() {
    if (!campeonato?.id) return;
    const { data } = await supabase
      .from("times")
      .select("*, grupo_times(grupo:grupos(id, nome))")
      .eq("campeonato_id", campeonato.id)
      .order("nome");
    setTimes(data ?? []);
  }

  async function fetchClassificacao() {
    if (!campeonato?.id) return;
    const { data } = await supabase
      .from("classificacao")
      .select("*, time:times(id, nome, escudo_url), grupo:grupos(id, nome)")
      .eq("campeonato_id", campeonato.id)
      .order("posicao");
    const byGrupo: Record<string, any[]> = {};
    (data ?? []).forEach((row) => {
      const g = row.grupo?.nome ?? "?";
      if (!byGrupo[g]) byGrupo[g] = [];
      byGrupo[g].push(row);
    });
    setAllClassificacao(byGrupo);
  }

  async function excluirTime(timeId: string, nome: string) {
    if (!confirm(`Excluir o time "${nome}"?`)) return;
    setLoadingAction(timeId);
    try {
      const { error } = await supabase.functions.invoke("excluir-time", { body: { time_id: timeId } });
      if (error) throw error;
      toast.success(`Time "${nome}" excluído`);
      fetchTimes();
      refetchPartidas();
      fetchClassificacao();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoadingAction(null); }
  }

  async function gerarPartidas() {
    if (!campeonato) return;
    setLoadingAction("gerar");
    try {
      const { data, error } = await supabase.functions.invoke("gerar-partidas", { body: { campeonato_id: campeonato.id } });
      if (error) throw error;
      toast.success(`${data?.count ?? 0} partidas geradas!`);
      refetchPartidas();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoadingAction(null); }
  }

  async function confirmarResultado(partida: any) {
    setLoadingAction(partida.id);
    try {
      const { error } = await supabase.from("partidas").update({
        gols_a: partida.gols_a_enviado ?? partida.gols_a,
        gols_b: partida.gols_b_enviado ?? partida.gols_b,
        status: "confirmada",
      }).eq("id", partida.id);
      if (error) throw error;
      toast.success("Resultado confirmado!");
      refetchPartidas();
      fetchClassificacao();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoadingAction(null); }
  }

  if (!campeonato) {
    return <div className="text-center py-16 text-muted-foreground">Nenhum corujão ativo</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Grupos e Tabela</h1>
      </div>

      {/* Times */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
          <Users className="w-5 h-5 text-primary" /> Times ({times.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {times.map((t) => {
            const grupoNome = t.grupo_times?.[0]?.grupo?.nome;
            return (
              <div key={t.id} className="card-copa p-4">
                <div className="flex items-center gap-3">
                  <TimeAvatar nome={t.nome} escudoUrl={t.escudo_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate">{t.nome}</span>
                      {grupoNome && <span className="grupo-badge shrink-0">{grupoNome}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.responsavel}</p>
                  </div>
                  <button onClick={() => excluirTime(t.id, t.nome)} disabled={loadingAction === t.id} className="text-destructive hover:text-red-300 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Classificação */}
      <section>
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>Classificação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["A", "B", "C", "D"].map((g) => (
            <ClassificacaoTable key={g} grupo={g} times={allClassificacao[g] ?? []} fase={campeonato?.status} />
          ))}
        </div>
      </section>

      {/* Partidas */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Partidas</h2>
          <button onClick={gerarPartidas} disabled={loadingAction === "gerar"} className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
            <Play className="w-4 h-4" />
            {loadingAction === "gerar" ? "Gerando..." : "Gerar"}
          </button>
          <button onClick={refetchPartidas} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Aguardando confirmação */}
        {partidas.filter(p => p.status === "enviada").length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-bold mb-3 text-yellow-400 flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
              <AlertTriangle className="w-4 h-4" />
              Aguardando Confirmação ({partidas.filter(p => p.status === "enviada").length})
            </h3>
            <div className="space-y-2">
              {partidas.filter(p => p.status === "enviada").map(p => (
                <div key={p.id} className="card-copa border border-yellow-400/30 p-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="font-bold">{p.time_a?.nome}</span>
                      <span className="mx-2 font-bold text-primary">{p.gols_a_enviado} × {p.gols_b_enviado}</span>
                      <span className="font-bold">{p.time_b?.nome}</span>
                      {p.grupo && <span className="ml-2 grupo-badge">{p.grupo.nome}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditPartida(p)} className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground">
                        <Edit className="w-3 h-3 inline mr-1" />Editar
                      </button>
                      <button onClick={() => confirmarResultado(p)} disabled={loadingAction === p.id} className="btn-gold text-xs px-3 py-1">
                        {loadingAction === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <PartidasList partidas={partidas} loading={pLoading} showGrupo />
      </section>

      {/* Modal editar resultado */}
      {editPartida && (
        <EditResultadoModal
          partida={editPartida}
          onClose={() => setEditPartida(null)}
          onSuccess={() => { refetchPartidas(); fetchClassificacao(); }}
        />
      )}
    </div>
  );
}

function EditResultadoModal({ partida, onClose, onSuccess }: any) {
  const [gols_a, setGolsA] = useState(String(partida.gols_a_enviado ?? partida.gols_a ?? ""));
  const [gols_b, setGolsB] = useState(String(partida.gols_b_enviado ?? partida.gols_b ?? ""));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ga = parseInt(gols_a), gb = parseInt(gols_b);
    if (isNaN(ga) || isNaN(gb)) { toast.error("Placares inválidos"); return; }
    setLoading(true);
    const { error } = await supabase.from("partidas").update({ gols_a: ga, gols_b: gb, status: "ajustada" }).eq("id", partida.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Resultado ajustado!");
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="card-copa-gold w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-primary mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>Editar Resultado</h3>
        <p className="text-sm text-muted-foreground mb-4">{partida.time_a?.nome} vs {partida.time_b?.nome}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2 items-center">
            <input type="number" min={0} value={gols_a} onChange={e => setGolsA(e.target.value)} className="input-copa text-center text-2xl font-bold h-14" required />
            <div className="text-center text-xl font-bold text-muted-foreground">×</div>
            <input type="number" min={0} value={gols_b} onChange={e => setGolsB(e.target.value)} className="input-copa text-center text-2xl font-bold h-14" required />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-muted-foreground">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 disabled:opacity-60">{loading ? "..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
