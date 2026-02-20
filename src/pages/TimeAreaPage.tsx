import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCampeonato, usePartidas } from "@/hooks/useCopa";
import { supabase } from "@/integrations/supabase/client";
import PartidasList from "@/components/PartidasList";
import ClassificacaoTable from "@/components/ClassificacaoTable";
import ResultadoModal from "@/components/ResultadoModal";
import TimeAvatar from "@/components/TimeAvatar";
import { Shield, Calendar, Trophy, Upload } from "lucide-react";
import { toast } from "sonner";

export default function TimeAreaPage() {
  const { user, timeId } = useAuth();
  const { campeonato } = useCampeonato();
  const { partidas, loading: pLoading, refetch } = usePartidas(campeonato?.id ?? null);
  const [time, setTime] = useState<any>(null);
  const [grupo, setGrupo] = useState<any>(null);
  const [classificacaoGrupo, setClassificacaoGrupo] = useState<any[]>([]);
  const [resultadoPartida, setResultadoPartida] = useState<any>(null);
  const [tab, setTab] = useState<"partidas" | "classificacao">("partidas");
  const [escudoFile, setEscudoFile] = useState<File | null>(null);
  const [uploadingEscudo, setUploadingEscudo] = useState(false);

  useEffect(() => {
    if (!timeId) return;
    supabase.from("times").select("*").eq("id", timeId).single().then(({ data }) => setTime(data));
    supabase
      .from("grupo_times")
      .select("grupo:grupos(id, nome)")
      .eq("time_id", timeId)
      .single()
      .then(({ data }) => {
        if (data?.grupo) {
          setGrupo(data.grupo);
          // Fetch classificação do grupo
          supabase
            .from("classificacao")
            .select("*, time:times(id, nome, escudo_url), grupo:grupos(id, nome)")
            .eq("grupo_id", (data.grupo as any).id)
            .order("posicao")
            .then(({ data: cData }) => setClassificacaoGrupo(cData ?? []));
        }
      });
  }, [timeId]);

  async function handleUploadEscudo() {
    if (!escudoFile || !timeId) return;
    setUploadingEscudo(true);
    try {
      const ext = escudoFile.name.split(".").pop();
      const path = `${timeId}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("escudos").upload(path, escudoFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("escudos").getPublicUrl(path);
      await supabase.from("times").update({ escudo_url: urlData.publicUrl }).eq("id", timeId);
      setTime((t: any) => ({ ...t, escudo_url: urlData.publicUrl }));
      setEscudoFile(null);
      toast.success("Escudo atualizado!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingEscudo(false);
    }
  }

  const minhasPartidas = partidas.filter(
    (p) => p.time_a_id === timeId || p.time_b_id === timeId
  );

  if (!timeId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sem time associado</h2>
        <p className="text-muted-foreground">Sua conta ainda não possui um time vinculado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header do Time */}
      <div className="card-copa-gold p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <TimeAvatar nome={time?.nome ?? ""} escudoUrl={time?.escudo_url} size="lg" />
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer">
              <Upload className="w-3 h-3 text-primary-foreground" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEscudoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
              {time?.nome ?? "Carregando..."}
            </h1>
            <p className="text-muted-foreground text-sm">Responsável: {time?.responsavel}</p>
            {grupo && (
              <div className="flex items-center gap-2 mt-1">
                <span className="grupo-badge">{grupo.nome}</span>
                <span className="text-xs text-muted-foreground">Grupo {grupo.nome}</span>
              </div>
            )}
          </div>
          {escudoFile && (
            <button
              onClick={handleUploadEscudo}
              disabled={uploadingEscudo}
              className="btn-gold px-4 py-2 text-sm"
            >
              {uploadingEscudo ? "Salvando..." : "Salvar Escudo"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/30 rounded-lg p-1 w-fit">
        {([
          { key: "partidas", label: "Meus Jogos", icon: Calendar },
          { key: "classificacao", label: "Classificação", icon: Trophy },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "partidas" && (
        <PartidasList
          partidas={minhasPartidas}
          loading={pLoading}
          onEnviarResultado={setResultadoPartida}
          timeId={timeId}
          showGrupo={false}
        />
      )}

      {tab === "classificacao" && grupo && (
        <ClassificacaoTable
          grupo={grupo.nome}
          times={classificacaoGrupo}
          fase={campeonato?.status}
        />
      )}

      {resultadoPartida && (
        <ResultadoModal
          partida={resultadoPartida}
          onClose={() => setResultadoPartida(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
