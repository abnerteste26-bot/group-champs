import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText, RefreshCw } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("logs_admin")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>Logs do Sistema</h1>
        <button onClick={fetchLogs} className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer h-12 rounded-lg" />)}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">Nenhum log registrado</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="card-copa p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0 w-40">
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </span>
              <span className="text-sm font-medium text-primary uppercase tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
                {log.acao}
              </span>
              {log.detalhes && (
                <span className="text-xs text-muted-foreground font-mono truncate flex-1">
                  {typeof log.detalhes === "string" ? log.detalhes : JSON.stringify(log.detalhes)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
