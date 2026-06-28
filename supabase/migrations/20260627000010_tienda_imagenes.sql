-- Agregar columna de imagen a productos
alter table productos_tienda
  add column if not exists imagen_url text default null;

-- Bucket público para imágenes de productos de la tienda
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tienda-imagenes',
  'tienda-imagenes',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Lectura pública
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'public_read_tienda_imagenes'
  ) then
    create policy "public_read_tienda_imagenes"
      on storage.objects for select
      using (bucket_id = 'tienda-imagenes');
  end if;
end;
$$;
