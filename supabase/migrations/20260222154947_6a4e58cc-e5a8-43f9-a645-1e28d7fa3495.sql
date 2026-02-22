
-- Fix ALL policies to be PERMISSIVE (they are currently all RESTRICTIVE)

-- user_roles (critical - blocks login flow)
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- inscricoes_pendentes
DROP POLICY IF EXISTS "Public read inscricoes" ON public.inscricoes_pendentes;
DROP POLICY IF EXISTS "Admin manage inscricoes" ON public.inscricoes_pendentes;
DROP POLICY IF EXISTS "Public insert inscricoes" ON public.inscricoes_pendentes;
CREATE POLICY "Public read inscricoes" ON public.inscricoes_pendentes FOR SELECT USING (true);
CREATE POLICY "Admin manage inscricoes" ON public.inscricoes_pendentes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public insert inscricoes" ON public.inscricoes_pendentes FOR INSERT WITH CHECK (true);

-- campeonatos
DROP POLICY IF EXISTS "Admin manage campeonatos" ON public.campeonatos;
DROP POLICY IF EXISTS "Public read campeonatos" ON public.campeonatos;
CREATE POLICY "Public read campeonatos" ON public.campeonatos FOR SELECT USING (true);
CREATE POLICY "Admin manage campeonatos" ON public.campeonatos FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- classificacao
DROP POLICY IF EXISTS "Admin manage classificacao" ON public.classificacao;
DROP POLICY IF EXISTS "Public read classificacao" ON public.classificacao;
CREATE POLICY "Public read classificacao" ON public.classificacao FOR SELECT USING (true);
CREATE POLICY "Admin manage classificacao" ON public.classificacao FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- grupos
DROP POLICY IF EXISTS "Admin manage grupos" ON public.grupos;
DROP POLICY IF EXISTS "Public read grupos" ON public.grupos;
CREATE POLICY "Public read grupos" ON public.grupos FOR SELECT USING (true);
CREATE POLICY "Admin manage grupos" ON public.grupos FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- grupo_times
DROP POLICY IF EXISTS "Admin manage grupo_times" ON public.grupo_times;
DROP POLICY IF EXISTS "Public read grupo_times" ON public.grupo_times;
CREATE POLICY "Public read grupo_times" ON public.grupo_times FOR SELECT USING (true);
CREATE POLICY "Admin manage grupo_times" ON public.grupo_times FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- times
DROP POLICY IF EXISTS "Admin manage times" ON public.times;
DROP POLICY IF EXISTS "Public read times" ON public.times;
DROP POLICY IF EXISTS "Time update own" ON public.times;
CREATE POLICY "Public read times" ON public.times FOR SELECT USING (true);
CREATE POLICY "Admin manage times" ON public.times FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Time update own" ON public.times FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- partidas
DROP POLICY IF EXISTS "Admin manage partidas" ON public.partidas;
DROP POLICY IF EXISTS "Public read partidas" ON public.partidas;
DROP POLICY IF EXISTS "Time submit result" ON public.partidas;
CREATE POLICY "Public read partidas" ON public.partidas FOR SELECT USING (true);
CREATE POLICY "Admin manage partidas" ON public.partidas FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Time submit result" ON public.partidas FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM times t WHERE (t.id = partidas.time_a_id OR t.id = partidas.time_b_id) AND t.user_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- logs_admin
DROP POLICY IF EXISTS "Admin read logs" ON public.logs_admin;
DROP POLICY IF EXISTS "Insert logs authenticated" ON public.logs_admin;
CREATE POLICY "Admin read logs" ON public.logs_admin FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Insert logs authenticated" ON public.logs_admin FOR INSERT WITH CHECK (true);

-- campeonato_timer
DROP POLICY IF EXISTS "Admin manage timer" ON public.campeonato_timer;
DROP POLICY IF EXISTS "Public read timer" ON public.campeonato_timer;
CREATE POLICY "Public read timer" ON public.campeonato_timer FOR SELECT USING (true);
CREATE POLICY "Admin manage timer" ON public.campeonato_timer FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
