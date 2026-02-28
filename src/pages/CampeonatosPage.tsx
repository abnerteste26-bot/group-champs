import { useState } from "react";
import { Clock, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { useCampeonatos } from "@/hooks/useCopa";

const SECOES = [
    { id: "prozao", nome: "PROZÃO", horario: "16:00 - 18:00" },
    { id: "noitao", nome: "NOITÃO", horario: "19:00 - 21:00" },
    { id: "corujao", nome: "CORUJÃO", horario: "22:00 - 00:00" },
    { id: "madrugadao", nome: "MADRUGADÃO", horario: "00:30 - 02:30" },
];

export default function CampeonatosPage() {
    const [secaoAtiva, setSecaoAtiva] = useState<string>("prozao");
    const { campeonatos, loading } = useCampeonatos();

    // Filtrar campeonatos pela seção ativa (simulado se não tiver campo específico no BD)
    // Como o banco atual não possui o campo "secao" nos campeonatos,
    // por enquanto, vamos exibir o mesmo campeonato na seção CORUJÃO 
    // e exibir vazio nas outras, ou mockar baseado no nome para fins de layout.

    const campeonatosFiltrados = campeonatos.filter(c => {
        // Lógica provisória: se o campeonato contém a palavra da seção no nome,
        // ou se estamos exibindo tudo para testar.
        const cmpNome = c.nome.toLowerCase();

        if (secaoAtiva === "prozao") return cmpNome.includes("proz");
        if (secaoAtiva === "noitao") return cmpNome.includes("noit");
        if (secaoAtiva === "corujao") return cmpNome.includes("coruj") || !cmpNome.includes("proz") && !cmpNome.includes("noit") && !cmpNome.includes("madrug");
        if (secaoAtiva === "madrugadao") return cmpNome.includes("madrug");

        return true;
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
                    CORUJÕES
                </h1>
                <p className="text-muted-foreground text-lg">
                    Escolha um horário para ver os corujões em andamento.
                </p>
            </div>

            {/* Navegação das Seções */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {SECOES.map((secao) => (
                    <button
                        key={secao.id}
                        onClick={() => setSecaoAtiva(secao.id)}
                        className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${secaoAtiva === secao.id
                                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(234,179,8,0.3)] transform scale-105"
                                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                            }`}
                    >
                        <h3 className="text-2xl font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
                            {secao.nome}
                        </h3>
                        <div className={`flex items-center gap-2 text-sm font-medium ${secaoAtiva === secao.id ? 'text-primary' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4 shrink-0" />
                            {secao.horario}
                        </div>
                    </button>
                ))}
            </div>

            {/* Lista de Campeonatos */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Em Andamento - {SECOES.find(s => s.id === secaoAtiva)?.nome}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => <div key={i} className="shimmer h-32 rounded-lg" />)}
                    </div>
                ) : campeonatosFiltrados.length === 0 ? (
                    <div className="card-copa p-12 text-center text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Nenhum corujão disponível neste horário.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {campeonatosFiltrados.map((camp) => (
                            <div key={camp.id} className="card-copa p-6 flex flex-col md:flex-row gap-6 items-center hover:border-primary/40 transition-colors">
                                {camp.logo_url ? (
                                    <img src={camp.logo_url} alt={camp.nome} className="w-20 h-20 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Trophy className="w-10 h-10" />
                                    </div>
                                )}

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                                        <h3 className="text-xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                                            {camp.nome}
                                        </h3>
                                        <StatusBadge status={camp.status} />
                                    </div>

                                    <div className="text-sm text-muted-foreground mb-4 space-y-1">
                                        <p>Edição: {camp.edicao || "—"}</p>
                                        <p>{camp.times_confirmados} de {camp.max_times} times</p>
                                    </div>

                                    <Link to="/classificacao" className="btn-gold inline-block px-6 py-2 text-sm">
                                        Ver Detalhes
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
