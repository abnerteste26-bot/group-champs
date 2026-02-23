import { useState } from "react";
import { useCampeonatos, usePartidas } from "@/hooks/useCopa";
import PartidasList from "@/components/PartidasList";
import { Calendar } from "lucide-react";

export default function PartidasPage() {
  const { campeonatos } = useCampeonatos();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const campeonato = campeonatos[selectedIdx] ?? campeonatos[0] ?? null;
  const { partidas, loading } = usePartidas(campeonato?.id ?? null);
  const [grupoFiltro, setGrupoFiltro] = useState<string>("todos");
  const [faseFiltro, setFaseFiltro] = useState<string>("todos");

  const filtradas = partidas.filter((p) => {
    if (grupoFiltro !== "todos" && p.grupo?.nome !== grupoFiltro) return false;
    if (faseFiltro !== "todos" && p.fase !== faseFiltro) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
          Partidas
        </h1>
      </div>

      {/* Tabs de campeonatos */}
      {campeonatos.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {campeonatos.map((c: any, i: number) => (
            <button
              key={c.id}
              onClick={() => { setSelectedIdx(i); setGrupoFiltro("todos"); setFaseFiltro("todos"); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                selectedIdx === i
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

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {["todos", "A", "B", "C", "D"].map((g) => (
            <button
              key={g}
              onClick={() => setGrupoFiltro(g)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                grupoFiltro === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {g === "todos" ? "Todos" : `Grupo ${g}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["todos", "grupos", "oitavas", "quartas", "semi", "final"].map((f) => (
            <button
              key={f}
              onClick={() => setFaseFiltro(f)}
              className={`px-3 py-1 rounded text-sm font-semibold capitalize transition-colors ${
                faseFiltro === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "todos" ? "Todas fases" : f === "grupos" ? "Grupos" : f === "oitavas" ? "Oitavas" : f === "quartas" ? "Quartas" : f === "semi" ? "Semifinal" : "Final"}
            </button>
          ))}
        </div>
      </div>

      <PartidasList partidas={filtradas} loading={loading} showGrupo />
    </div>
  );
}
