-- Elimina registros huérfanos de empresas que no tienen perfil asociado.
-- Esto limpia intentos de registro incompletos antes de agregar el índice único.
delete from empresas e
where not exists (
  select 1 from profiles p where p.id_empresa = e.id
);

-- Índice único parcial: permite múltiples NULL (registros sin RUC aún),
-- pero prohíbe dos empresas con el mismo RUC no-nulo.
create unique index if not exists empresas_ruc_unique
  on empresas (ruc)
  where ruc is not null;
