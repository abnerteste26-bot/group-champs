import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { X } from "lucide-react";

interface ResultadoModalProps {
  partida: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResultadoModal({ partida, onClose, onSuccess }: ResultadoModalProps) {
  const { timeId } = useAuth();
  const [gols_a, setGolsA] = useState("");
  const [gols_b, setGolsB] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ga = parseInt(gols_a);
    const gb = parseInt(gols_b);
    if (isNaN(ga) || isNaN(gb) || ga < 0 || gb < 0) {
      toast.error("Informe placares válidos");
      return;
    }

    // Validar que não é empate (empate não tem vencedor para confirmar)
    if (ga === gb) {
      toast.error("Em caso de empate, o admin deve registrar o resultado.");
      return;
    }

    // Validar que o time logado é o vencedor
    const isTimeA = partida.time_a_id === timeId;
    const isTimeB = partida.time_b_id === timeId;

    if (!isTimeA && !isTimeB) {
      toast.error("Você não participa desta partida.");
      return;
    }

    const meuTimeVenceu = (isTimeA && ga > gb) || (isTimeB && gb > ga);
    if (!meuTimeVenceu) {
      toast.error("Apenas o time vencedor pode confirmar o resultado.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("confirmar-resultado", {
        body: {
          partida_id: partida.id,
          gols_a: ga,
          gols_b: gb,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Resultado confirmado e classificação atualizada!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="card-copa-gold w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
            Confirmar Resultado
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm mb-2">Partida</p>
          <p className="font-bold text-lg">
            {partida.time_a?.nome} <span className="text-muted-foreground">vs</span> {partida.time_b?.nome}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-center">
            <div className="text-center">
              <label className="field-label block mb-1.5 text-xs">{partida.time_a?.nome}</label>
              <input
                type="number"
                min={0}
                max={99}
                value={gols_a}
                onChange={(e) => setGolsA(e.target.value)}
                required
                className="input-copa text-center text-3xl font-bold h-16"
                style={{ fontFamily: "Oswald, sans-serif" }}
              />
            </div>
            <div className="text-center text-2xl font-bold text-muted-foreground">×</div>
            <div className="text-center">
              <label className="field-label block mb-1.5 text-xs">{partida.time_b?.nome}</label>
              <input
                type="number"
                min={0}
                max={99}
                value={gols_b}
                onChange={(e) => setGolsB(e.target.value)}
                required
                className="input-copa text-center text-3xl font-bold h-16"
                style={{ fontFamily: "Oswald, sans-serif" }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Apenas o <strong className="text-primary">time vencedor</strong> pode confirmar o resultado.
              O placar será validado automaticamente.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 disabled:opacity-60">
              {loading ? "Validando..." : "Confirmar Resultado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
