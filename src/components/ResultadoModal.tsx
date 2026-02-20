import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface ResultadoModalProps {
  partida: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResultadoModal({ partida, onClose, onSuccess }: ResultadoModalProps) {
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
    setLoading(true);
    try {
      const { error } = await supabase
        .from("partidas")
        .update({
          gols_a_enviado: ga,
          gols_b_enviado: gb,
          status: "enviada",
        })
        .eq("id", partida.id);
      if (error) throw error;
      toast.success("Resultado enviado! Aguarde confirmação do admin.");
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
            Enviar Resultado
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

          <p className="text-xs text-muted-foreground text-center">
            O resultado será confirmado pelo administrador.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 disabled:opacity-60">
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
