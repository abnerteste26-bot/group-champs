import TimeAvatar from "./TimeAvatar";
import StatusBadge from "./StatusBadge";

interface PartidasListProps {
  partidas: any[];
  loading: boolean;
  onEnviarResultado?: (partida: any) => void;
  timeId?: string | null;
  showGrupo?: boolean;
}

export default function PartidasList({
  partidas,
  loading,
  onEnviarResultado,
  timeId,
  showGrupo = true,
}: PartidasListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (partidas.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Nenhuma partida gerada ainda.</p>
      </div>
    );
  }

  const byRodada: Record<number, any[]> = {};
  partidas.forEach((p) => {
    const r = p.rodada ?? 0;
    if (!byRodada[r]) byRodada[r] = [];
    byRodada[r].push(p);
  });

  return (
    <div className="space-y-6">
      {Object.entries(byRodada).sort(([a], [b]) => Number(a) - Number(b)).map(([rodada, ps]) => (
        <div key={rodada}>
          {Number(rodada) > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Rodada {rodada}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="space-y-2">
            {ps.map((p) => {
              const canSubmit =
                onEnviarResultado &&
                timeId &&
                (p.time_a_id === timeId || p.time_b_id === timeId) &&
                p.status === "pendente";

              return (
                <div key={p.id} className="card-copa p-3">
                  <div className="flex items-center gap-2">
                    {showGrupo && p.grupo && (
                      <span className="grupo-badge text-xs shrink-0">{p.grupo.nome}</span>
                    )}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {/* Time A */}
                      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                        <span className="font-medium text-sm truncate">{p.time_a?.nome ?? "—"}</span>
                        <TimeAvatar nome={p.time_a?.nome ?? ""} escudoUrl={p.time_a?.escudo_url} size="sm" />
                      </div>

                      {/* Placar */}
                      <div className="shrink-0 flex items-center gap-1 px-3">
                        {p.status === "confirmada" || p.status === "ajustada" ? (
                          <span className="text-xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                            {p.gols_a} <span className="text-muted-foreground mx-1">×</span> {p.gols_b}
                          </span>
                        ) : p.status === "enviada" ? (
                          <span className="text-sm text-blue-400 font-semibold">Enviado</span>
                        ) : (
                          <span className="text-muted-foreground font-bold">VS</span>
                        )}
                      </div>

                      {/* Time B */}
                      <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                        <TimeAvatar nome={p.time_b?.nome ?? ""} escudoUrl={p.time_b?.escudo_url} size="sm" />
                        <span className="font-medium text-sm truncate">{p.time_b?.nome ?? "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={p.status} />
                      {canSubmit && (
                        <button
                          onClick={() => onEnviarResultado(p)}
                          className="text-xs btn-gold px-3 py-1"
                        >
                          Resultado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
