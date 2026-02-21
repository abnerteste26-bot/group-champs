import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) throw new Error("Não autorizado");

    const { partida_id, gols_a, gols_b } = await req.json();

    if (typeof gols_a !== "number" || typeof gols_b !== "number" || gols_a < 0 || gols_b < 0) {
      throw new Error("Placares inválidos");
    }

    // Empate: apenas admin pode registrar
    if (gols_a === gols_b) {
      throw new Error("Em caso de empate, apenas o admin pode registrar o resultado.");
    }

    // Buscar partida
    const { data: partida, error: pErr } = await supabaseAdmin
      .from("partidas")
      .select("*")
      .eq("id", partida_id)
      .single();
    if (pErr || !partida) throw new Error("Partida não encontrada");

    if (partida.status !== "pendente") {
      throw new Error("Esta partida já teve resultado registrado.");
    }

    // Buscar time do usuário
    const { data: timeData } = await supabaseAdmin
      .from("times")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!timeData) throw new Error("Você não possui um time vinculado.");

    const timeId = timeData.id;
    const isTimeA = partida.time_a_id === timeId;
    const isTimeB = partida.time_b_id === timeId;

    if (!isTimeA && !isTimeB) {
      throw new Error("Você não participa desta partida.");
    }

    // Validar que o time logado é o VENCEDOR
    const meuTimeVenceu = (isTimeA && gols_a > gols_b) || (isTimeB && gols_b > gols_a);
    if (!meuTimeVenceu) {
      throw new Error("Apenas o time vencedor pode confirmar o resultado. Você não pode registrar uma derrota.");
    }

    // Confirmar resultado diretamente (sem dupla confirmação)
    const { error: updateErr } = await supabaseAdmin
      .from("partidas")
      .update({
        gols_a,
        gols_b,
        gols_a_enviado: gols_a,
        gols_b_enviado: gols_b,
        status: "confirmada",
        enviado_por: user.id,
      })
      .eq("id", partida_id);

    if (updateErr) throw updateErr;

    // Recalcular classificação se partida de grupos
    if (partida.grupo_id) {
      await supabaseAdmin.rpc("recalcular_classificacao", {
        p_campeonato_id: partida.campeonato_id,
        p_grupo_id: partida.grupo_id,
      });
    }

    // Log
    await supabaseAdmin.from("logs_admin").insert({
      user_id: user.id,
      acao: "confirmar_resultado_vencedor",
      detalhes: { partida_id, gols_a, gols_b, time_id: timeId },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
