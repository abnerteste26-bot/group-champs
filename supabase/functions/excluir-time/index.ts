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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) throw new Error("Não autorizado");
    const { data: roleData } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") throw new Error("Apenas admins");

    const { time_id } = await req.json();

    // Buscar dados do time antes de excluir
    const { data: time } = await supabaseAdmin.from("times").select("*, grupo_times(grupo_id)").eq("id", time_id).single();
    const grupoId = time?.grupo_times?.[0]?.grupo_id;

    // Excluir partidas não finalizadas
    await supabaseAdmin.from("partidas")
      .delete()
      .or(`time_a_id.eq.${time_id},time_b_id.eq.${time_id}`)
      .in("status", ["pendente", "enviada"]);

    // Excluir vínculo com grupo
    await supabaseAdmin.from("grupo_times").delete().eq("time_id", time_id);

    // Excluir classificação
    await supabaseAdmin.from("classificacao").delete().eq("time_id", time_id);

    // Excluir usuário auth se existir
    if (time?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(time.user_id);
    }

    // Excluir time
    await supabaseAdmin.from("times").delete().eq("id", time_id);

    // Recalcular classificação do grupo
    if (grupoId && time?.campeonato_id) {
      await supabaseAdmin.rpc("recalcular_classificacao", {
        p_campeonato_id: time.campeonato_id,
        p_grupo_id: grupoId,
      });
    }

    await supabaseAdmin.from("logs_admin").insert({
      user_id: user.id,
      acao: "excluir_time",
      detalhes: { time_id, nome: time?.nome },
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
