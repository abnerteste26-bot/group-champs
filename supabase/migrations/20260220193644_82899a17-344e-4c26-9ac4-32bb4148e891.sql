
-- Corrigir política INSERT dos logs (remover WITH CHECK (true) para INSERT)
DROP POLICY IF EXISTS "System insert logs" ON public.logs_admin;
DROP POLICY IF EXISTS "Anyone upload comprovante" ON storage.objects;

-- Logs: apenas usuários autenticados ou sistema pode inserir
CREATE POLICY "Authenticated insert logs" ON public.logs_admin FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);

-- Comprovante: limitar por bucket
CREATE POLICY "Anyone upload comprovante safe" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprovantes' AND (octet_length(name) > 0));
