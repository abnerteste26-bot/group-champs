import { Trophy, Users, Calendar, Shield } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface CampeonatoCardProps {
  campeonato: any;
  selected?: boolean;
  onClick?: () => void;
}

export default function CampeonatoCard({ campeonato, selected, onClick }: CampeonatoCardProps) {
  const vagas = (campeonato.max_times ?? 16) - (campeonato.times_confirmados ?? 0);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-300 ease-out p-5 group animate-fade-in hover-scale ${
        selected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/40 scale-[1.02]"
          : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        {campeonato.logo_url ? (
          <img
            src={campeonato.logo_url}
            alt={campeonato.nome}
            className={`w-14 h-14 rounded-lg object-cover shrink-0 transition-all duration-300 ${
              selected ? "ring-2 ring-primary shadow-md" : "opacity-80 group-hover:opacity-100"
            }`}
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
              selected
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            }`}
          >
            <Trophy className="w-7 h-7" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-lg font-bold truncate transition-colors duration-200 group-hover:text-primary"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              {campeonato.nome}
            </h3>
            <StatusBadge status={campeonato.status} />
          </div>

          {campeonato.edicao && (
            <p className="text-xs text-muted-foreground mb-2">
              Edição: {campeonato.edicao}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {campeonato.times_confirmados}/{campeonato.max_times} times
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {vagas > 0 ? `${vagas} vagas` : "Lotado"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {campeonato.status === "inscricoes_abertas"
                ? "Inscrições Abertas"
                : campeonato.status === "grupos"
                ? "Fase de Grupos"
                : campeonato.status === "mata_mata"
                ? "Mata-Mata"
                : campeonato.status === "inscricoes_encerradas"
                ? "Inscrições Encerradas"
                : campeonato.status}
            </span>
          </div>
        </div>

        {/* Indicador de seleção */}
        <div
          className={`w-3 h-3 rounded-full shrink-0 mt-1 transition-all duration-300 ${
            selected
              ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
              : "bg-border group-hover:bg-primary/40"
          }`}
        />
      </div>
    </button>
  );
}
