import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Users, Calendar, ChevronRight, Star, Shield } from "lucide-react";
import { useCampeonatos, useGrupos, useClassificacao, usePartidas } from "@/hooks/useCopa";
import CampeonatoStats from "@/components/CampeonatoStats";
import CampeonatoCard from "@/components/CampeonatoCard";
import ClassificacaoTable from "@/components/ClassificacaoTable";
import PartidasList from "@/components/PartidasList";
import StatusBadge from "@/components/StatusBadge";

export default function Index() {
  const { campeonatos, loading } = useCampeonatos();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const campeonato = campeonatos[selectedIdx] ?? campeonatos[0] ?? null;

  const { grupos } = useGrupos(campeonato?.id ?? null);
  const { classificacao } = useClassificacao(campeonato?.id ?? null);
  const { partidas, loading: pLoading } = usePartidas(campeonato?.id ?? null);

  const ultimasPartidas = partidas.filter(p => p.status === "confirmada" || p.status === "ajustada").slice(-6);
  const hasOpenInscriptions = campeonatos.some((c: any) => c.inscricoes_abertas);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section
        className="relative py-24 px-4 overflow-hidden text-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(42 95% 52% / 0.3) 40px, hsl(42 95% 52% / 0.3) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(42 95% 52% / 0.3) 40px, hsl(42 95% 52% / 0.3) 41px)`,
        }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 text-primary text-sm font-semibold mb-6" style={{ background: "hsl(42 95% 52% / 0.1)" }}>
            <Star className="w-4 h-4" />
            {campeonato?.nome ?? "Copa Master 2025"}
          </div>

          <h1
            className="text-5xl md:text-7xl font-black text-foreground mb-4 leading-none"
            style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "-0.02em" }}
          >
            COPA
            <br />
            <span className="text-primary" style={{ textShadow: "0 0 40px hsl(42 95% 52% / 0.6)" }}>
              MASTER
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            O campeonato mais emocionante da região. Fase de grupos, mata-mata e muito mais.
          </p>

          {campeonato && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <StatusBadge status={campeonato.status} />
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {hasOpenInscriptions && (
              <Link to="/inscricao" className="btn-gold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Inscreva seu Time
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/classificacao"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all font-semibold uppercase tracking-wider text-sm"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              <Trophy className="w-5 h-5" />
              Ver Classificação
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Cards dos Campeonatos */}
        {campeonatos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
              Campeonatos Ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campeonatos.map((c: any, i: number) => (
                <CampeonatoCard
                  key={c.id}
                  campeonato={c}
                  selected={selectedIdx === i}
                  onClick={() => setSelectedIdx(i)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        {campeonato && (
          <section>
            <CampeonatoStats campeonato={campeonato} grupos={grupos} />
          </section>
        )}

        {/* Times Participantes (quando inscrições abertas) */}
        {campeonato && (campeonato.status === "inscricoes_abertas" || campeonato.status === "inscricoes_encerradas") && grupos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
              Times Participantes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {grupos
                .flatMap((g: any) => (g.grupo_times ?? []).map((gt: any) => gt.time))
                .filter(Boolean)
                .map((time: any) => (
                  <div key={time.id} className="card-copa p-3 flex items-center gap-3 animate-fade-in">
                    {time.escudo_url ? (
                      <img src={time.escudo_url} alt={time.nome} className="w-10 h-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Shield className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-sm font-semibold truncate">{time.nome}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Classificação Resumida (somente após início dos jogos) */}
        {campeonato && campeonato.status !== "inscricoes_abertas" && campeonato.status !== "inscricoes_encerradas" && Object.keys(classificacao).length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                Classificação
              </h2>
              <Link to="/classificacao" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                Ver completa <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["A", "B", "C", "D"].filter(g => classificacao[g]?.length > 0).slice(0, 4).map((g) => (
                <ClassificacaoTable
                  key={g}
                  grupo={g}
                  times={classificacao[g] ?? []}
                  fase={campeonato?.status}
                />
              ))}
            </div>
          </section>
        )}

        {/* Últimas Partidas */}
        {ultimasPartidas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                Últimos Resultados
              </h2>
              <Link to="/partidas" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                Todas as partidas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <PartidasList partidas={ultimasPartidas} loading={pLoading} showGrupo />
          </section>
        )}

        {/* CTA Inscrição */}
        {hasOpenInscriptions && (
          <section>
            <div className="card-copa-gold p-8 text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
                Vagas Limitadas!
              </h2>
              <p className="text-muted-foreground mb-6">
                O campeonato aceita apenas 16 times. Garanta sua vaga agora.
              </p>
              <Link to="/inscricao" className="btn-gold inline-flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Fazer Inscrição
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
