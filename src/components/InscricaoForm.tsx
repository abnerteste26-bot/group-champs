import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCampeonato } from "@/hooks/useCopa";
import { Upload, X, Check } from "lucide-react";
import { toast } from "sonner";

interface InscricaoFormProps {
  onSuccess?: () => void;
}

export default function InscricaoForm({ onSuccess }: InscricaoFormProps) {
  const { campeonato } = useCampeonato();
  const [form, setForm] = useState({
    nome_time: "",
    responsavel: "",
    whatsapp: "",
    aceite_regulamento: false,
  });
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.aceite_regulamento) {
      toast.error("Você deve aceitar o regulamento");
      return;
    }
    if (!campeonato) {
      toast.error("Nenhum campeonato ativo");
      return;
    }
    if (form.nome_time.trim().length < 2) {
      toast.error("Nome do time muito curto");
      return;
    }

    setLoading(true);
    try {
      let comprovante_url: string | null = null;

      if (comprovante) {
        const ext = comprovante.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("comprovantes")
          .upload(path, comprovante);
        if (uploadError) throw uploadError;
        comprovante_url = path;
      }

      const { error } = await supabase.from("inscricoes_pendentes").insert({
        campeonato_id: campeonato.id,
        nome_time: form.nome_time.trim(),
        responsavel: form.responsavel.trim(),
        whatsapp: form.whatsapp.trim(),
        comprovante_url,
        aceite_regulamento: form.aceite_regulamento,
        status: "pendente",
      });

      if (error) throw error;

      setSucesso(true);
      onSuccess?.();
      toast.success("Inscrição enviada! Aguarde a confirmação do admin.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar inscrição");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="card-copa-gold p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
          Inscrição Enviada!
        </h3>
        <p className="text-muted-foreground">
          Sua inscrição foi recebida. O admin irá analisar o comprovante e confirmar em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="field-label block mb-1.5">Nome do Time *</label>
        <input
          name="nome_time"
          value={form.nome_time}
          onChange={handleChange}
          required
          maxLength={50}
          className="input-copa"
          placeholder="Ex: Águias do Norte"
        />
      </div>

      <div>
        <label className="field-label block mb-1.5">Nome do Responsável *</label>
        <input
          name="responsavel"
          value={form.responsavel}
          onChange={handleChange}
          required
          maxLength={80}
          className="input-copa"
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label className="field-label block mb-1.5">WhatsApp *</label>
        <input
          name="whatsapp"
          value={form.whatsapp}
          onChange={handleChange}
          required
          maxLength={20}
          className="input-copa"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label className="field-label block mb-1.5">Comprovante de Pagamento</label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {comprovante ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm text-foreground">{comprovante.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setComprovante(null); }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Clique para selecionar imagem</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF até 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <input
          type="checkbox"
          name="aceite_regulamento"
          id="regulamento"
          checked={form.aceite_regulamento}
          onChange={handleChange}
          className="mt-1 accent-primary"
        />
        <label htmlFor="regulamento" className="text-sm text-muted-foreground cursor-pointer">
          Li e aceito o{" "}
          <span className="text-primary underline cursor-pointer">Regulamento do Campeonato</span>
          . Estou ciente das regras e penalidades previstas.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando..." : "Enviar Inscrição"}
      </button>
    </form>
  );
}
