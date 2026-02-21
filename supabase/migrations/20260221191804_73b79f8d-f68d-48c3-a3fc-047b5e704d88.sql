
-- Tornar whatsapp opcional nas tabelas
ALTER TABLE public.inscricoes_pendentes ALTER COLUMN whatsapp SET DEFAULT '';
ALTER TABLE public.times ALTER COLUMN whatsapp SET DEFAULT '';

-- Criar tabela campeonato_timer
CREATE TABLE public.campeonato_timer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campeonato_id uuid NOT NULL REFERENCES public.campeonatos(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'parado' CHECK (status IN ('parado', 'rodando')),
  started_at timestamptz,
  paused_at timestamptz,
  tempo_acumulado bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campeonato_id)
);

ALTER TABLE public.campeonato_timer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read timer" ON public.campeonato_timer
FOR SELECT USING (true);

CREATE POLICY "Admin manage timer" ON public.campeonato_timer
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER set_updated_at_campeonato_timer
BEFORE UPDATE ON public.campeonato_timer
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
