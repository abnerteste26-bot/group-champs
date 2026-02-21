import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import InscricaoForm from "@/components/InscricaoForm";

export default function InscricaoPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
          Inscrição no Campeonato
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para participar. Após análise, seu time receberá login e senha.
        </p>
      </div>

      <div className="card-copa p-6 mb-4">
        <h2 className="text-lg font-bold text-primary mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
          📋 Regulamento Resumido
        </h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Campeonato com 16 times, 4 grupos de 4 times</li>
          <li>Fase de grupos: todos contra todos com jogos apenas de ida</li>
          <li>Os dois melhores de cada grupo avançam para o mata-mata</li>
          <li>Pontuação: vitória = 3pts, empate = 1pt, derrota = 0</li>
          <li>Desempate: saldo de gols, gols pró, confronto direto</li>
          <li>Resultados devem ser confirmados no site pelo time vencedor</li>
          <li>O time vencedor é o único autorizado a confirmar o placar da partida</li>
        </ul>
      </div>

      <div className="card-copa p-6">
        <InscricaoForm />
      </div>

      <div className="text-center mt-6">
        <Link to="/login" className="text-muted-foreground hover:text-primary text-sm transition-colors">
          Já tem conta? Entrar →
        </Link>
      </div>
    </div>
  );
}
