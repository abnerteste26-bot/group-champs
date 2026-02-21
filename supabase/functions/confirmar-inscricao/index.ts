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

    // Verificar se o caller é admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) throw new Error("Não autorizado");

    const { data: roleData } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") throw new Error("Apenas admins podem confirmar inscrições");

    const { inscricao_id, campeonato_id, nome_time, responsavel } = await req.json();

    // Verificar campeonato ativo
    const { data: camp } = await supabaseAdmin.from("campeonatos").select("*").eq("id", campeonato_id).single();
    if (!camp) throw new Error("Campeonato não encontrado");
    if (!camp.inscricoes_abertas) throw new Error("Inscrições encerradas");

    // Verificar vagas
    const { count } = await supabaseAdmin.from("grupo_times").select("id", { count: "exact" }).in(
      "grupo_id",
      (await supabaseAdmin.from("grupos").select("id").eq("campeonato_id", campeonato_id)).data?.map((g: any) => g.id) ?? []
    );
    if ((count ?? 0) >= camp.max_times) throw new Error("Campeonato já atingiu o limite de times");

    // Criar usuário
    const email = `${nome_time.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")}.${Date.now()}@copamaster.com`;
    const senha = Math.random().toString(36).slice(-6).toUpperCase() + Math.random().toString(36).slice(-4);

    const { data: authUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: nome_time, role: "time" },
    });
    if (createErr) throw createErr;

    const userId = authUser.user!.id;

    // Atribuir role de time
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "time" });

    // Criar time
    const { data: time, error: timeErr } = await supabaseAdmin.from("times").insert({
      campeonato_id,
      user_id: userId,
      nome: nome_time,
      responsavel,
      whatsapp: "",
      login_gerado: email,
      senha_gerada: senha,
      ativo: true,
    }).select().single();
    if (timeErr) throw timeErr;

    // Distribuir no grupo
    const { error: grupoErr } = await supabaseAdmin.rpc("distribuir_time_em_grupo", {
      p_time_id: time.id,
      p_campeonato_id: campeonato_id,
    });
    if (grupoErr) throw grupoErr;

    // Marcar inscrição como aprovada
    await supabaseAdmin.from("inscricoes_pendentes").update({ status: "aprovada" }).eq("id", inscricao_id);

    // Atualizar contador
    await supabaseAdmin.from("campeonatos").update({
      times_confirmados: (count ?? 0) + 1,
    }).eq("id", campeonato_id);

    // Verificar se atingiu 16 times - fechar e gerar partidas
    if ((count ?? 0) + 1 >= camp.max_times) {
      await supabaseAdmin.from("campeonatos").update({
        status: "grupos",
        inscricoes_abertas: false,
      }).eq("id", campeonato_id);
      await supabaseAdmin.rpc("gerar_partidas_grupos", { p_campeonato_id: campeonato_id });
    }

    // Log
    await supabaseAdmin.from("logs_admin").insert({
      user_id: user.id,
      acao: "confirmar_inscricao",
      detalhes: { inscricao_id, time_id: time.id, nome_time, email },
    });

    return new Response(JSON.stringify({ success: true, email, senha, time_id: time.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
