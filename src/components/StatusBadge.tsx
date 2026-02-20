interface StatusBadgeProps {
  status: string;
}

const MAP: Record<string, string> = {
  pendente: "status-pendente",
  enviada: "status-enviada",
  confirmada: "status-confirmada",
  ajustada: "status-ajustada",
  rejeitada: "status-rejeitada",
  aprovada: "status-confirmada",
  inscricoes_abertas: "status-enviada",
  grupos: "status-confirmada",
  mata_mata: "status-ajustada",
  encerrado: "status-rejeitada",
};

const LABELS: Record<string, string> = {
  pendente: "Pendente",
  enviada: "Enviada",
  confirmada: "Confirmada",
  ajustada: "Ajustada",
  rejeitada: "Rejeitada",
  aprovada: "Aprovada",
  inscricoes_abertas: "Inscrições Abertas",
  inscricoes_encerradas: "Inscrições Encerradas",
  grupos: "Fase de Grupos",
  mata_mata: "Mata-Mata",
  encerrado: "Encerrado",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={MAP[status] ?? "status-pendente"}>{LABELS[status] ?? status}</span>;
}
