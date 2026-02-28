import { useState } from "react";
import { useCampeonatos, useClassificacao } from "@/hooks/useCopa";
import ClassificacaoTable from "@/components/ClassificacaoTable";
import StatusBadge from "@/components/StatusBadge";
import { Trophy } from "lucide-react";

export default function ClassificacaoPage() {
  const { campeonatos, loading: campLoad } = useCampeonatos();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const campeonato = campeonatos[selectedIdx] ?? campeonatos[0] ?? null;
  const { classificacao, loading: classLoad } = useClassificacao(campeonato?.id ?? null);
  const loading = campLoad || classLoad;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
            Classificação
          </h1>
          {campeonato && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-muted-foreground text-sm">{campeonato.nome}</span>
              <StatusBadge status={campeonato.status} />
            </div>
          )}
        </div>
      </div>

      {/* Tabs de campeonatos */}
      {campeonatos.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-48 rounded-lg" />)}
        </div>
      ) : !campeonato ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Nenhum corujão ativo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["A", "B", "C", "D"].map((g) => (
            <ClassificacaoTable
              key={g}
              grupo={g}
              times={classificacao[g] ?? []}
              fase={campeonato.status}
            />
          ))}
        </div>
      )}

      <div className="mt-6 card-copa p-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span><strong className="text-foreground">J</strong> = Jogos</span>
        <span><strong className="text-foreground">V</strong> = Vitórias</span>
        <span><strong className="text-foreground">E</strong> = Empates</span>
        <span><strong className="text-foreground">D</strong> = Derrotas</span>
        <span><strong className="text-foreground">GP</strong> = Gols Pró</span>
        <span><strong className="text-foreground">GC</strong> = Gols Contra</span>
        <span><strong className="text-foreground">SG</strong> = Saldo</span>
        <span><strong className="text-primary">PTS</strong> = Pontos</span>
      </div>
    </div>
  );
}
