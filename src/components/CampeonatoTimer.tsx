import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCampeonato } from "@/hooks/useCopa";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface TimerData {
  id: string;
  campeonato_id: string;
  status: string;
  started_at: string | null;
  paused_at: string | null;
  tempo_acumulado: number;
}

function formatTime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${String(hours).padStart(2, "0")}h`);
  parts.push(`${String(minutes).padStart(2, "0")}m`);
  parts.push(`${String(seconds).padStart(2, "0")}s`);
  return parts.join(" ");
}

export default function CampeonatoTimer() {
  const { user, isAdmin } = useAuth();
  const { campeonato } = useCampeonato();
  const [timer, setTimer] = useState<TimerData | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTimer = useCallback(async () => {
    if (!campeonato?.id) return;
    const { data } = await supabase
      .from("campeonato_timer")
      .select("*")
      .eq("campeonato_id", campeonato.id)
      .single();
    setTimer(data as TimerData | null);
  }, [campeonato?.id]);

  useEffect(() => {
    fetchTimer();
  }, [fetchTimer]);

  // Calculate display time
  useEffect(() => {
    if (!timer) { setDisplayTime(0); return; }

    function calcTime() {
      if (!timer) return 0;
      let total = timer.tempo_acumulado;
      if (timer.status === "rodando" && timer.started_at) {
        const elapsed = (Date.now() - new Date(timer.started_at).getTime()) / 1000;
        total += elapsed;
      }
      return Math.max(0, total);
    }

    setDisplayTime(calcTime());

    if (timer.status === "rodando") {
      const interval = setInterval(() => setDisplayTime(calcTime()), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  async function ensureTimer() {
    if (!campeonato?.id) return null;
    if (timer) return timer;
    const { data, error } = await supabase
      .from("campeonato_timer")
      .insert({ campeonato_id: campeonato.id, status: "parado", tempo_acumulado: 0 })
      .select()
      .single();
    if (error) throw error;
    setTimer(data as TimerData);
    return data as TimerData;
  }

  async function handleStart() {
    setLoading(true);
    try {
      const t = await ensureTimer();
      if (!t) return;
      await supabase
        .from("campeonato_timer")
        .update({ status: "rodando", started_at: new Date().toISOString(), paused_at: null })
        .eq("id", t.id);
      await fetchTimer();
      toast.success("Cronômetro iniciado!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePause() {
    if (!timer) return;
    setLoading(true);
    try {
      let acumulado = timer.tempo_acumulado;
      if (timer.started_at) {
        acumulado += (Date.now() - new Date(timer.started_at).getTime()) / 1000;
      }
      await supabase
        .from("campeonato_timer")
        .update({
          status: "parado",
          tempo_acumulado: Math.floor(acumulado),
          paused_at: new Date().toISOString(),
          started_at: null,
        })
        .eq("id", timer.id);
      await fetchTimer();
      toast.info("Cronômetro pausado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!timer) return;
    if (!confirm("Resetar o cronômetro do corujão?")) return;
    setLoading(true);
    try {
      await supabase
        .from("campeonato_timer")
        .update({ status: "parado", started_at: null, paused_at: null, tempo_acumulado: 0 })
        .eq("id", timer.id);
      await fetchTimer();
      toast.info("Cronômetro resetado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user || !campeonato) return null;

  const isRunning = timer?.status === "rodando";

  return (
    <div className="border-b border-border" style={{ background: "hsl(160 30% 4% / 0.95)" }}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className={`w-4 h-4 ${isRunning ? "text-green-400 animate-pulse" : "text-muted-foreground"}`} />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold" style={{ fontFamily: "Oswald, sans-serif" }}>
            Tempo de Corujão
          </span>
          <span
            className={`font-bold text-sm tabular-nums ${isRunning ? "text-primary" : "text-foreground"}`}
            style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.05em" }}
          >
            {formatTime(displayTime)}
          </span>
          {isRunning && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-semibold"
              >
                <Play className="w-3 h-3" />
                Iniciar
              </button>
            ) : (
              <button
                onClick={handlePause}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors font-semibold"
              >
                <Pause className="w-3 h-3" />
                Pausar
              </button>
            )}
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
