import { useCampeonato } from "@/hooks/useCopa";
import StatusBadge from "@/components/StatusBadge";
import { Settings } from "lucide-react";

export default function AdminConfigPage() {
  const { campeonato } = useCampeonato();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Configurações</h1>
      </div>

      {campeonato ? (
        <div className="card-copa p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>Corujão Atual</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="field-label">Nome</span><p className="text-foreground mt-1">{campeonato.nome}</p></div>
            <div><span className="field-label">Edição</span><p className="text-foreground mt-1">{campeonato.edicao ?? "—"}</p></div>
            <div><span className="field-label">Status</span><div className="mt-1"><StatusBadge status={campeonato.status} /></div></div>
            <div><span className="field-label">Máx. Times</span><p className="text-foreground mt-1">{campeonato.max_times}</p></div>
            <div><span className="field-label">Inscrições Abertas</span><p className="text-foreground mt-1">{campeonato.inscricoes_abertas ? "Sim" : "Não"}</p></div>
            <div><span className="field-label">Confirmados</span><p className="text-foreground mt-1">{campeonato.times_confirmados}</p></div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum corujão ativo.</p>
      )}
    </div>
  );
}
