-- =============================================================================
-- Bucket de imagens (avatares de clientes, imagens de serviços/ordens, logo)
-- =============================================================================
-- useStorage.ts grava na raiz do bucket com nome aleatório e lê via
-- getPublicUrl(), então o bucket precisa ser público para leitura.

insert into storage.buckets (id, name, public)
values ('app-images', 'app-images', true)
on conflict (id) do update set public = true;

-- Leitura pública: as URLs são embutidas em <img> e no layout de impressão.
drop policy if exists "app-images: public read" on storage.objects;
create policy "app-images: public read" on storage.objects
  for select to public
  using (bucket_id = 'app-images');

-- Escrita apenas para usuários autenticados.
drop policy if exists "app-images: authenticated insert" on storage.objects;
create policy "app-images: authenticated insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'app-images');

drop policy if exists "app-images: authenticated update" on storage.objects;
create policy "app-images: authenticated update" on storage.objects
  for update to authenticated
  using (bucket_id = 'app-images');

drop policy if exists "app-images: authenticated delete" on storage.objects;
create policy "app-images: authenticated delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'app-images');
