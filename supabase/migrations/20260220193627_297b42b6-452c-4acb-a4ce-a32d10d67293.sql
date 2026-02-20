
-- =============================================
-- CAMPEONATO COPA DO MUNDO - SCHEMA COMPLETO
-- =============================================

-- ENUMS
CREATE TYPE public.status_campeonato AS ENUM ('inscricoes_abertas', 'inscricoes_encerradas', 'grupos', 'mata_mata', 'encerrado');
CREATE TYPE public.status_partida AS ENUM ('pendente', 'enviada', 'confirmada', 'ajustada');
CREATE TYPE public.status_inscricao AS ENUM ('pendente', 'aprovada', 'rejeitada');
CREATE TYPE public.fase_partida AS ENUM ('grupos', 'oitavas', 'quartas', 'semi', 'final');
CREATE TYPE public.app_role AS ENUM ('admin', 'time');

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'time',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER - check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CAMPEONATOS
CREATE TABLE public.campeonatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  edicao TEXT,
  status public.status_campeonato NOT NULL DEFAULT 'inscricoes_abertas',
  inscricoes_abertas BOOLEAN NOT NULL DEFAULT true,
  max_times INTEGER NOT NULL DEFAULT 16,
  times_confirmados INTEGER NOT NULL DEFAULT 0,
  campeao_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campeonatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read campeonatos" ON public.campeonatos FOR SELECT USING (true);
CREATE POLICY "Admin manage campeonatos" ON public.campeonatos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- GRUPOS (exatamente A, B, C, D por campeonato)
CREATE TABLE public.grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id UUID NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  nome CHAR(1) NOT NULL CHECK (nome IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campeonato_id, nome)
);
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read grupos" ON public.grupos FOR SELECT USING (true);
CREATE POLICY "Admin manage grupos" ON public.grupos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- TIMES
CREATE TABLE public.times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id UUID NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  escudo_url TEXT,
  login_gerado TEXT,
  senha_gerada TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campeonato_id, nome)
);
ALTER TABLE public.times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read times" ON public.times FOR SELECT USING (true);
CREATE POLICY "Admin manage times" ON public.times FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Time update own" ON public.times FOR UPDATE USING (auth.uid() = user_id);

-- GRUPO_TIMES (vínculo time-grupo, fonte de verdade)
CREATE TABLE public.grupo_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  time_id UUID NOT NULL REFERENCES public.times(id) ON DELETE CASCADE,
  data_insercao TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (grupo_id, time_id),
  UNIQUE (time_id) -- time só pode estar em 1 grupo por campeonato
);
ALTER TABLE public.grupo_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read grupo_times" ON public.grupo_times FOR SELECT USING (true);
CREATE POLICY "Admin manage grupo_times" ON public.grupo_times FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- INSCRIÇÕES PENDENTES
CREATE TABLE public.inscricoes_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id UUID NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  nome_time TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  comprovante_url TEXT,
  aceite_regulamento BOOLEAN NOT NULL DEFAULT false,
  status public.status_inscricao NOT NULL DEFAULT 'pendente',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inscricoes_pendentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert inscricoes" ON public.inscricoes_pendentes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage inscricoes" ON public.inscricoes_pendentes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PARTIDAS
CREATE TABLE public.partidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id UUID NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  grupo_id UUID REFERENCES public.grupos(id) ON DELETE SET NULL,
  fase public.fase_partida NOT NULL DEFAULT 'grupos',
  rodada INTEGER,
  time_a_id UUID NOT NULL REFERENCES public.times(id) ON DELETE CASCADE,
  time_b_id UUID NOT NULL REFERENCES public.times(id) ON DELETE CASCADE,
  gols_a INTEGER,
  gols_b INTEGER,
  gols_a_enviado INTEGER,
  gols_b_enviado INTEGER,
  status public.status_partida NOT NULL DEFAULT 'pendente',
  enviado_por UUID REFERENCES auth.users(id),
  contestacao TEXT,
  observacao_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (time_a_id <> time_b_id),
  UNIQUE (campeonato_id, fase, time_a_id, time_b_id)
);
ALTER TABLE public.partidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read partidas" ON public.partidas FOR SELECT USING (true);
CREATE POLICY "Admin manage partidas" ON public.partidas FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Time submit result" ON public.partidas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.times t WHERE (t.id = time_a_id OR t.id = time_b_id) AND t.user_id = auth.uid())
);

-- CLASSIFICAÇÃO (calculada via trigger)
CREATE TABLE public.classificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id UUID NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  time_id UUID NOT NULL REFERENCES public.times(id) ON DELETE CASCADE,
  jogos INTEGER NOT NULL DEFAULT 0,
  vitorias INTEGER NOT NULL DEFAULT 0,
  empates INTEGER NOT NULL DEFAULT 0,
  derrotas INTEGER NOT NULL DEFAULT 0,
  gols_pro INTEGER NOT NULL DEFAULT 0,
  gols_contra INTEGER NOT NULL DEFAULT 0,
  saldo_gols INTEGER NOT NULL DEFAULT 0,
  pontos INTEGER NOT NULL DEFAULT 0,
  posicao INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campeonato_id, grupo_id, time_id)
);
ALTER TABLE public.classificacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read classificacao" ON public.classificacao FOR SELECT USING (true);
CREATE POLICY "Admin manage classificacao" ON public.classificacao FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- LOGS ADMIN
CREATE TABLE public.logs_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  detalhes JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.logs_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read logs" ON public.logs_admin FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert logs" ON public.logs_admin FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_campeonatos_updated BEFORE UPDATE ON public.campeonatos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_times_updated BEFORE UPDATE ON public.times FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_partidas_updated BEFORE UPDATE ON public.partidas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_inscricoes_updated BEFORE UPDATE ON public.inscricoes_pendentes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Função: criar profile automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função: recalcular classificação de um grupo
CREATE OR REPLACE FUNCTION public.recalcular_classificacao(p_campeonato_id UUID, p_grupo_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_time RECORD;
  v_jogos INT; v_vit INT; v_emp INT; v_der INT;
  v_gp INT; v_gc INT; v_pts INT; v_pos INT;
BEGIN
  -- Zerar classificação do grupo
  DELETE FROM public.classificacao WHERE campeonato_id = p_campeonato_id AND grupo_id = p_grupo_id;
  
  FOR v_time IN 
    SELECT gt.time_id FROM public.grupo_times gt WHERE gt.grupo_id = p_grupo_id
  LOOP
    SELECT 
      COUNT(*) FILTER (WHERE status = 'confirmada' OR status = 'ajustada'),
      COUNT(*) FILTER (WHERE (status = 'confirmada' OR status = 'ajustada') AND ((time_a_id = v_time.time_id AND gols_a > gols_b) OR (time_b_id = v_time.time_id AND gols_b > gols_a))),
      COUNT(*) FILTER (WHERE (status = 'confirmada' OR status = 'ajustada') AND gols_a = gols_b),
      COUNT(*) FILTER (WHERE (status = 'confirmada' OR status = 'ajustada') AND ((time_a_id = v_time.time_id AND gols_a < gols_b) OR (time_b_id = v_time.time_id AND gols_b < gols_a))),
      COALESCE(SUM(CASE WHEN time_a_id = v_time.time_id AND (status = 'confirmada' OR status = 'ajustada') THEN gols_a WHEN time_b_id = v_time.time_id AND (status = 'confirmada' OR status = 'ajustada') THEN gols_b ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN time_a_id = v_time.time_id AND (status = 'confirmada' OR status = 'ajustada') THEN gols_b WHEN time_b_id = v_time.time_id AND (status = 'confirmada' OR status = 'ajustada') THEN gols_a ELSE 0 END), 0)
    INTO v_jogos, v_vit, v_emp, v_der, v_gp, v_gc
    FROM public.partidas
    WHERE grupo_id = p_grupo_id AND (time_a_id = v_time.time_id OR time_b_id = v_time.time_id);
    
    v_pts := (v_vit * 3) + v_emp;
    
    INSERT INTO public.classificacao (campeonato_id, grupo_id, time_id, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols, pontos)
    VALUES (p_campeonato_id, p_grupo_id, v_time.time_id, v_jogos, v_vit, v_emp, v_der, v_gp, v_gc, v_gp - v_gc, v_pts)
    ON CONFLICT (campeonato_id, grupo_id, time_id) DO UPDATE SET
      jogos = EXCLUDED.jogos, vitorias = EXCLUDED.vitorias, empates = EXCLUDED.empates,
      derrotas = EXCLUDED.derrotas, gols_pro = EXCLUDED.gols_pro, gols_contra = EXCLUDED.gols_contra,
      saldo_gols = EXCLUDED.saldo_gols, pontos = EXCLUDED.pontos, updated_at = now();
  END LOOP;
  
  -- Atualizar posições
  v_pos := 1;
  FOR v_time IN 
    SELECT time_id FROM public.classificacao 
    WHERE campeonato_id = p_campeonato_id AND grupo_id = p_grupo_id
    ORDER BY pontos DESC, saldo_gols DESC, gols_pro DESC
  LOOP
    UPDATE public.classificacao SET posicao = v_pos 
    WHERE campeonato_id = p_campeonato_id AND grupo_id = p_grupo_id AND time_id = v_time.time_id;
    v_pos := v_pos + 1;
  END LOOP;
END; $$;

-- Trigger: recalcular ao confirmar resultado
CREATE OR REPLACE FUNCTION public.trg_recalcular_apos_resultado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.status IN ('confirmada', 'ajustada') AND NEW.grupo_id IS NOT NULL) THEN
    PERFORM public.recalcular_classificacao(NEW.campeonato_id, NEW.grupo_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_partida_confirmada
  AFTER UPDATE ON public.partidas
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalcular_apos_resultado();

-- Função: distribuir time ao grupo correto
CREATE OR REPLACE FUNCTION public.distribuir_time_em_grupo(p_time_id UUID, p_campeonato_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_grupo_id UUID;
BEGIN
  SELECT g.id INTO v_grupo_id
  FROM public.grupos g
  WHERE g.campeonato_id = p_campeonato_id
    AND (SELECT COUNT(*) FROM public.grupo_times gt WHERE gt.grupo_id = g.id) < 4
  ORDER BY g.nome ASC
  LIMIT 1;
  
  IF v_grupo_id IS NULL THEN
    RAISE EXCEPTION 'Todos os grupos estão cheios';
  END IF;
  
  INSERT INTO public.grupo_times (grupo_id, time_id)
  VALUES (v_grupo_id, p_time_id);
  
  -- Criar registro inicial na classificação
  INSERT INTO public.classificacao (campeonato_id, grupo_id, time_id)
  VALUES (p_campeonato_id, v_grupo_id, p_time_id)
  ON CONFLICT DO NOTHING;
  
  RETURN v_grupo_id;
END; $$;

-- Função: gerar partidas de fase de grupos
CREATE OR REPLACE FUNCTION public.gerar_partidas_grupos(p_campeonato_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_grupo RECORD;
  v_times UUID[];
  v_i INT; v_j INT;
  v_rodada INT;
  v_count INT := 0;
BEGIN
  FOR v_grupo IN SELECT * FROM public.grupos WHERE campeonato_id = p_campeonato_id ORDER BY nome
  LOOP
    SELECT ARRAY_AGG(gt.time_id ORDER BY t.nome) INTO v_times
    FROM public.grupo_times gt
    JOIN public.times t ON t.id = gt.time_id
    WHERE gt.grupo_id = v_grupo.id;
    
    IF array_length(v_times, 1) < 2 THEN CONTINUE; END IF;
    
    v_rodada := 1;
    FOR v_i IN 1..array_length(v_times, 1)
    LOOP
      FOR v_j IN (v_i+1)..array_length(v_times, 1)
      LOOP
        INSERT INTO public.partidas (campeonato_id, grupo_id, fase, rodada, time_a_id, time_b_id, status)
        VALUES (p_campeonato_id, v_grupo.id, 'grupos', v_rodada, v_times[v_i], v_times[v_j], 'pendente')
        ON CONFLICT DO NOTHING;
        v_count := v_count + 1;
        v_rodada := v_rodada + 1;
      END LOOP;
    END LOOP;
  END LOOP;
  
  RETURN v_count;
END; $$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('escudos', 'escudos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone upload comprovante" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprovantes');
CREATE POLICY "Admin view comprovantes" ON storage.objects FOR SELECT USING (bucket_id = 'comprovantes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public view escudos" ON storage.objects FOR SELECT USING (bucket_id = 'escudos');
CREATE POLICY "Authenticated upload escudo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'escudos' AND auth.uid() IS NOT NULL);

-- Inserir campeonato inicial
INSERT INTO public.campeonatos (nome, edicao, status) 
VALUES ('Copa dos Campeões', '2025', 'inscricoes_abertas')
ON CONFLICT DO NOTHING;

-- Criar grupos A, B, C, D para o campeonato inicial
DO $$
DECLARE v_camp_id UUID;
BEGIN
  SELECT id INTO v_camp_id FROM public.campeonatos LIMIT 1;
  INSERT INTO public.grupos (campeonato_id, nome) VALUES
    (v_camp_id, 'A'), (v_camp_id, 'B'), (v_camp_id, 'C'), (v_camp_id, 'D')
  ON CONFLICT DO NOTHING;
END $$;
