import { Trophy, Shield, Users, Calendar } from "lucide-react";

interface StatsProps {
  campeonato: any;
  grupos: any[];
}

export default function CampeonatoStats({ campeonato, grupos }: StatsProps) {
  const totalTimes = grupos.reduce((acc, g) => acc + (g.grupo_times?.length ?? 0), 0);
  const vagasRestantes = (campeonato?.max_times ?? 16) - totalTimes;

  const stats = [
    { label: "Times Inscritos", value: totalTimes, icon: Users, color: "text-green-400" },
    { label: "Vagas Restantes", value: vagasRestantes, icon: Shield, color: "text-primary" },
    { label: "Grupos", value: grupos.length, icon: Trophy, color: "text-yellow-400" },
    { label: "Fase", value: campeonato?.status === "grupos" ? "Grupos" : campeonato?.status === "mata_mata" ? "Mata-Mata" : "Inscrições", icon: Calendar, color: "text-blue-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card-copa p-4 text-center">
          <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
          <div className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: "Oswald, sans-serif" }}>{s.value}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
