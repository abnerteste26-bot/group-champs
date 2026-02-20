
-- Corrigir função handle_new_user com search_path explícito
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- Remover política permissiva de logs e substituir por uma mais restritiva
DROP POLICY IF EXISTS "Authenticated insert logs" ON public.logs_admin;
CREATE POLICY "Insert logs authenticated" ON public.logs_admin FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
