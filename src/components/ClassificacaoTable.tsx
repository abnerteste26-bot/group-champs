import TimeAvatar from "./TimeAvatar";

interface ClassificacaoTableProps {
  grupo: string;
  times: any[];
  fase?: string;
}

export default function ClassificacaoTable({ grupo, times, fase }: ClassificacaoTableProps) {
  return (
    <div className="card-copa overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
        <span className="grupo-badge">{grupo}</span>
        <h3 className="font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
          Grupo {grupo}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-copa">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left w-6">#</th>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-center">J</th>
              <th className="px-3 py-2 text-center">V</th>
              <th className="px-3 py-2 text-center">E</th>
              <th className="px-3 py-2 text-center">D</th>
              <th className="px-3 py-2 text-center">GP</th>
              <th className="px-3 py-2 text-center">GC</th>
              <th className="px-3 py-2 text-center">SG</th>
              <th className="px-3 py-2 text-center font-bold text-primary">PTS</th>
            </tr>
          </thead>
          <tbody>
            {times.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum time neste grupo
                </td>
              </tr>
            ) : (
              times.map((t, i) => {
                const classificado = i < 2;
                const posClass = i === 0 ? "posicao-1" : i === 1 ? "posicao-2" : "text-muted-foreground";
                const sgClass = t.saldo_gols > 0 ? "text-green-400 font-medium" : t.saldo_gols < 0 ? "text-red-400 font-medium" : "";
                return (
                  <tr
                    key={t.time_id}
                    className={`hover:bg-muted/20 transition-colors ${classificado && fase === "grupos" ? "border-l-2 border-green-500" : ""}`}
                  >
                    <td className={`px-3 py-2.5 ${posClass}`}>{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <TimeAvatar nome={t.time?.nome ?? ""} escudoUrl={t.time?.escudo_url} size="sm" />
                        <span className="font-medium">{t.time?.nome ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{t.jogos}</td>
                    <td className="px-3 py-2.5 text-center text-green-400">{t.vitorias}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{t.empates}</td>
                    <td className="px-3 py-2.5 text-center text-red-400">{t.derrotas}</td>
                    <td className="px-3 py-2.5 text-center">{t.gols_pro}</td>
                    <td className="px-3 py-2.5 text-center">{t.gols_contra}</td>
                    <td className={`px-3 py-2.5 text-center ${sgClass}`}>
                      {t.saldo_gols > 0 ? `+${t.saldo_gols}` : t.saldo_gols}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-primary text-base">{t.pontos}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {fase === "grupos" && times.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
          Classificado para o Mata-Mata
        </div>
      )}
    </div>
  );
}
