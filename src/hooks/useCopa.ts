import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCampeonatos() {
  const [campeonatos, setCampeonatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCampeonatos() {
    const { data } = await supabase
      .from("campeonatos")
      .select("*")
      .not("status", "eq", "encerrado")
      .order("created_at", { ascending: true });
    setCampeonatos(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCampeonatos();
  }, []);

  return { campeonatos, loading, refetch: fetchCampeonatos };
}

// Backward compat: returns the first active championship
export function useCampeonato() {
  const { campeonatos, loading, refetch } = useCampeonatos();
  const campeonato = campeonatos.length > 0 ? campeonatos[0] : null;
  return { campeonato, loading, refetch };
}

// Returns the championship with open inscriptions
export function useCampeonatoAberto() {
  const { campeonatos, loading, refetch } = useCampeonatos();
  const campeonato = campeonatos.find((c: any) => c.inscricoes_abertas) ?? null;
  return { campeonato, loading, refetch };
}

export function useGrupos(campeonatoId: string | null) {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campeonatoId) return;
    setLoading(true);
    supabase
      .from("grupos")
      .select(`
        *,
        grupo_times(
          time:times(id, nome, escudo_url)
        )
      `)
      .eq("campeonato_id", campeonatoId)
      .order("nome")
      .then(({ data }) => {
        setGrupos(data ?? []);
        setLoading(false);
      });
  }, [campeonatoId]);

  return { grupos, loading };
}

export function useClassificacao(campeonatoId: string | null) {
  const [classificacao, setClassificacao] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campeonatoId) return;
    setLoading(true);
    supabase
      .from("classificacao")
      .select(`
        *,
        time:times(id, nome, escudo_url),
        grupo:grupos(id, nome)
      `)
      .eq("campeonato_id", campeonatoId)
      .order("posicao")
      .then(({ data }) => {
        const byGrupo: Record<string, any[]> = {};
        (data ?? []).forEach((row) => {
          const g = row.grupo?.nome ?? "?";
          if (!byGrupo[g]) byGrupo[g] = [];
          byGrupo[g].push(row);
        });
        setClassificacao(byGrupo);
        setLoading(false);
      });
  }, [campeonatoId]);

  return { classificacao, loading };
}

export function usePartidas(campeonatoId: string | null, grupoId?: string | null) {
  const [partidas, setPartidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPartidas() {
    if (!campeonatoId) return;
    setLoading(true);
    let query = supabase
      .from("partidas")
      .select(`
        *,
        time_a:times!partidas_time_a_id_fkey(id, nome, escudo_url),
        time_b:times!partidas_time_b_id_fkey(id, nome, escudo_url),
        grupo:grupos(id, nome)
      `)
      .eq("campeonato_id", campeonatoId)
      .order("rodada")
      .order("created_at");

    if (grupoId) query = query.eq("grupo_id", grupoId);

    const { data } = await query;
    setPartidas(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPartidas();
  }, [campeonatoId, grupoId]);

  return { partidas, loading, refetch: fetchPartidas };
}

export function useInscricoesPendentes() {
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchInscricoes() {
    const { data } = await supabase
      .from("inscricoes_pendentes")
      .select(`*, campeonato:campeonatos(nome)`)
      .eq("status", "pendente")
      .order("created_at");
    setInscricoes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchInscricoes(); }, []);

  return { inscricoes, loading, refetch: fetchInscricoes };
}
