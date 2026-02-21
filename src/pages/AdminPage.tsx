import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInscricoesPendentes, useCampeonato, useGrupos, usePartidas } from "@/hooks/useCopa";
import PartidasList from "@/components/PartidasList";
import ClassificacaoTable from "@/components/ClassificacaoTable";
import StatusBadge from "@/components/StatusBadge";
import TimeAvatar from "@/components/TimeAvatar";
import { toast } from "sonner";
import {
  Shield, Users, Trophy, Calendar, Settings, CheckCircle, XCircle,
  Trash2, Edit, Play, Lock, RefreshCw, AlertTriangle
} from "lucide-react";

type AdminTab = "inscricoes" | "times" | "partidas" | "classificacao" | "configuracoes";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("inscricoes");
  const { inscricoes, loading: inscrLoad, refetch: refetchIns } = useInscricoesPendentes();
  const { campeonato, refetch: refetchCamp } = useCampeonato();
  const { grupos } = useGrupos(campeonato?.id ?? null);
  const { partidas, loading: pLoading, refetch: refetchPartidas } = usePartidas(campeonato?.id ?? null);
  const [times, setTimes] = useState<any[]>([]);
  const [editPartida, setEditPartida] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [allClassificacao, setAllClassificacao] = useState<Record<string, any[]>>({});

  useEffect(() => { fetchTimes(); }, [campeonato]);
  useEffect(() => { fetchClassificacao(); }, [campeonato]);

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

  async function confirmarInscricao(ins: any) {
    setLoadingAction(ins.id);
    try {
      // 1. Criar usuário auth
      const email = `${ins.nome_time.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@copamaster.com`;
      const senha = Math.random().toString(36).slice(-8) + "X1";

      const { data: authData, error: authErr } = await supabase.auth.admin
        ? await (supabase as any).auth.admin.createUser({ email, password: senha, email_confirm: true })
        : { data: null, error: new Error("Admin API não disponível no cliente") };

      // Fallback: usar Edge Function via invoke
      const { data: fnData, error: fnErr } = await supabase.functions.invoke("confirmar-inscricao", {
        body: {
          inscricao_id: ins.id,
          campeonato_id: ins.campeonato_id,
          nome_time: ins.nome_time,
          responsavel: ins.responsavel,
        },
      });

      if (fnErr) throw fnErr;
      if (fnData?.error) throw new Error(fnData.error);

      toast.success(`Time "${ins.nome_time}" confirmado! Login: ${fnData.email} | Senha: ${fnData.senha}`);
      refetchIns();
      fetchTimes();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao confirmar inscrição");
    } finally {
      setLoadingAction(null);
    }
  }

  async function rejeitarInscricao(insId: string) {
    await supabase.from("inscricoes_pendentes").update({ status: "rejeitada" }).eq("id", insId);
    toast.info("Inscrição rejeitada");
    refetchIns();
  }

  async function excluirTime(timeId: string, nome: string) {
    if (!confirm(`Excluir o time "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setLoadingAction(timeId);
    try {
      const { error } = await supabase.functions.invoke("excluir-time", { body: { time_id: timeId } });
      if (error) throw error;
      toast.success(`Time "${nome}" excluído`);
      fetchTimes();
      refetchPartidas();
      fetchClassificacao();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function gerarPartidas() {
    if (!campeonato) return;
    setLoadingAction("gerar");
    try {
      const { data, error } = await supabase.functions.invoke("gerar-partidas", {
        body: { campeonato_id: campeonato.id },
      });
      if (error) throw error;
      toast.success(`${data?.count ?? 0} partidas geradas!`);
      refetchPartidas();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function confirmarResultado(partida: any) {
    setLoadingAction(partida.id);
    try {
      const { error } = await supabase
        .from("partidas")
        .update({
          gols_a: partida.gols_a_enviado ?? partida.gols_a,
          gols_b: partida.gols_b_enviado ?? partida.gols_b,
          status: "confirmada",
        })
        .eq("id", partida.id);
      if (error) throw error;
      toast.success("Resultado confirmado!");
      refetchPartidas();
      fetchClassificacao();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function encerrarInscricoes() {
    if (!campeonato) return;
    if (!confirm("Encerrar inscrições e gerar partidas automaticamente?")) return;
    setLoadingAction("encerrar");
    try {
      await supabase.from("campeonatos").update({ status: "inscricoes_encerradas", inscricoes_abertas: false }).eq("id", campeonato.id);
      const { data, error } = await supabase.functions.invoke("gerar-partidas", { body: { campeonato_id: campeonato.id } });
      if (error) throw error;
      toast.success(`Inscrições encerradas. ${data?.count ?? 0} partidas geradas!`);
      refetchCamp();
      refetchPartidas();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  const tabs: { key: AdminTab; label: string; icon: any; badge?: number }[] = [
    { key: "inscricoes", label: "Inscrições", icon: Users, badge: inscricoes.length },
    { key: "times", label: "Times", icon: Shield },
    { key: "partidas", label: "Partidas", icon: Calendar },
    { key: "classificacao", label: "Classificação", icon: Trophy },
    { key: "configuracoes", label: "Config", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Painel Admin</h1>
            {campeonato && <div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">{campeonato.nome}</span><StatusBadge status={campeonato.status} /></div>}
          </div>
        </div>
        {campeonato?.inscricoes_abertas && (
          <button onClick={encerrarInscricoes} disabled={loadingAction === "encerrar"} className="btn-gold flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            {loadingAction === "encerrar" ? "Processando..." : "Encerrar Inscrições"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-muted/20 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all relative ${
              tab === t.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* === INSCRIÇÕES PENDENTES === */}
      {tab === "inscricoes" && (
        <div className="space-y-3">
          {inscrLoad ? (
            <div className="shimmer h-20 rounded-lg" />
          ) : inscricoes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
              <p>Nenhuma inscrição pendente</p>
            </div>
          ) : (
            inscricoes.map((ins) => (
              <div key={ins.id} className="card-copa p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">{ins.nome_time}</span>
                      <StatusBadge status={ins.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">Resp: {ins.responsavel}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ins.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmarInscricao(ins)}
                      disabled={loadingAction === ins.id}
                      className="flex items-center gap-1.5 btn-gold px-3 py-1.5 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {loadingAction === ins.id ? "Processando..." : "Confirmar"}
                    </button>
                    <button
                      onClick={() => rejeitarInscricao(ins.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === TIMES === */}
      {tab === "times" && (
        <div>
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
                      {t.login_gerado && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Login: <span className="text-foreground font-mono">{t.login_gerado}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => excluirTime(t.id, t.nome)}
                      disabled={loadingAction === t.id}
                      className="text-destructive hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {times.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum time confirmado</p>
            </div>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Total: <strong className="text-foreground">{times.length}</strong> times
          </div>
        </div>
      )}

      {/* === PARTIDAS === */}
      {tab === "partidas" && (
        <div>
          <div className="flex gap-3 mb-5">
            <button
              onClick={gerarPartidas}
              disabled={loadingAction === "gerar"}
              className="btn-gold flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {loadingAction === "gerar" ? "Gerando..." : "Gerar Partidas"}
            </button>
            <button onClick={refetchPartidas} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>

          {/* Partidas aguardando confirmação */}
          {partidas.filter(p => p.status === "enviada").length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-yellow-400 flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
                <AlertTriangle className="w-5 h-5" />
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
                        <button
                          onClick={() => setEditPartida(p)}
                          className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => confirmarResultado(p)}
                          disabled={loadingAction === p.id}
                          className="btn-gold text-xs px-3 py-1"
                        >
                          {loadingAction === p.id ? "..." : "Confirmar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PartidasList partidas={partidas} loading={pLoading} showGrupo />
        </div>
      )}

      {/* === CLASSIFICAÇÃO === */}
      {tab === "classificacao" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["A", "B", "C", "D"].map((g) => (
            <ClassificacaoTable key={g} grupo={g} times={allClassificacao[g] ?? []} fase={campeonato?.status} />
          ))}
        </div>
      )}

      {/* === CONFIGURAÇÕES === */}
      {tab === "configuracoes" && campeonato && (
        <div className="space-y-4">
          <div className="card-copa p-6">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>Campeonato Atual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="field-label">Nome</span><p className="text-foreground mt-1">{campeonato.nome}</p></div>
              <div><span className="field-label">Edição</span><p className="text-foreground mt-1">{campeonato.edicao ?? "—"}</p></div>
              <div><span className="field-label">Status</span><div className="mt-1"><StatusBadge status={campeonato.status} /></div></div>
              <div><span className="field-label">Máx. Times</span><p className="text-foreground mt-1">{campeonato.max_times}</p></div>
            </div>
          </div>

          <div className="card-copa p-6">
            <h3 className="text-lg font-bold mb-4 text-destructive flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </h3>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (!confirm("Encerrar campeonato definitivamente?")) return;
                  await supabase.from("campeonatos").update({ status: "encerrado" }).eq("id", campeonato.id);
                  toast.info("Campeonato encerrado");
                  refetchCamp();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors w-full justify-center"
              >
                <Lock className="w-4 h-4" />
                Encerrar Campeonato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar resultado */}
      {editPartida && (
        <AdminEditResultadoModal
          partida={editPartida}
          onClose={() => setEditPartida(null)}
          onSuccess={() => { refetchPartidas(); fetchClassificacao(); }}
        />
      )}
    </div>
  );
}

function AdminEditResultadoModal({ partida, onClose, onSuccess }: any) {
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
