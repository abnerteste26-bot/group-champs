
-- Fix: Change ALL policies from RESTRICTIVE to PERMISSIVE
-- PostgreSQL requires at least one PERMISSIVE policy; RESTRICTIVE-only = no access

-- inscricoes_pendentes
DROP POLICY IF EXISTS "Admin manage inscricoes" ON inscricoes_pendentes;
DROP POLICY IF EXISTS "Public insert inscricoes" ON inscricoes_pendentes;
CREATE POLICY "Admin manage inscricoes" ON inscricoes_pendentes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public insert inscricoes" ON inscricoes_pendentes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read inscricoes" ON inscricoes_pendentes FOR SELECT USING (true);

-- campeonatos
DROP POLICY IF EXISTS "Admin manage campeonatos" ON campeonatos;
DROP POLICY IF EXISTS "Public read campeonatos" ON campeonatos;
CREATE POLICY "Admin manage campeonatos" ON campeonatos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read campeonatos" ON campeonatos FOR SELECT USING (true);

-- classificacao
DROP POLICY IF EXISTS "Admin manage classificacao" ON classificacao;
DROP POLICY IF EXISTS "Public read classificacao" ON classificacao;
CREATE POLICY "Admin manage classificacao" ON classificacao FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read classificacao" ON classificacao FOR SELECT USING (true);

-- grupo_times
DROP POLICY IF EXISTS "Admin manage grupo_times" ON grupo_times;
DROP POLICY IF EXISTS "Public read grupo_times" ON grupo_times;
CREATE POLICY "Admin manage grupo_times" ON grupo_times FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read grupo_times" ON grupo_times FOR SELECT USING (true);

-- grupos
DROP POLICY IF EXISTS "Admin manage grupos" ON grupos;
DROP POLICY IF EXISTS "Public read grupos" ON grupos;
CREATE POLICY "Admin manage grupos" ON grupos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read grupos" ON grupos FOR SELECT USING (true);

-- times
DROP POLICY IF EXISTS "Admin manage times" ON times;
DROP POLICY IF EXISTS "Public read times" ON times;
DROP POLICY IF EXISTS "Time update own" ON times;
CREATE POLICY "Admin manage times" ON times FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read times" ON times FOR SELECT USING (true);
CREATE POLICY "Time update own" ON times FOR UPDATE USING (auth.uid() = user_id);

-- partidas
DROP POLICY IF EXISTS "Admin manage partidas" ON partidas;
DROP POLICY IF EXISTS "Public read partidas" ON partidas;
DROP POLICY IF EXISTS "Time submit result" ON partidas;
CREATE POLICY "Admin manage partidas" ON partidas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read partidas" ON partidas FOR SELECT USING (true);
CREATE POLICY "Time submit result" ON partidas FOR UPDATE USING (EXISTS (SELECT 1 FROM times t WHERE (t.id = partidas.time_a_id OR t.id = partidas.time_b_id) AND t.user_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Admin can manage roles" ON user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- logs_admin
DROP POLICY IF EXISTS "Admin read logs" ON logs_admin;
DROP POLICY IF EXISTS "Insert logs authenticated" ON logs_admin;
CREATE POLICY "Admin read logs" ON logs_admin FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Insert logs authenticated" ON logs_admin FOR INSERT WITH CHECK (true);

-- campeonato_timer
DROP POLICY IF EXISTS "Admin manage timer" ON campeonato_timer;
DROP POLICY IF EXISTS "Public read timer" ON campeonato_timer;
CREATE POLICY "Admin manage timer" ON campeonato_timer FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read timer" ON campeonato_timer FOR SELECT USING (true);
