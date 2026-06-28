# Cactus Style — Sistema de Diseño

Fuente de verdad del sistema visual usado en Cactus Access. Reutilizar este documento como punto de partida para cualquier proyecto futuro de CACTUS que necesite el mismo lenguaje visual (dashboards, paneles internos, SaaS B2B).

---

## 1. Filosofía Visual

**Minimalista, corporativo, verde-lima ("forest & lime").**

- Fondo casi blanco con un tinte mint sutil — nunca gris puro. El neutro de toda la paleta nace del mismo hue que el verde de marca (hue ~150°), no de un gris genérico.
- Un solo color de marca protagonista: **lime brillante** (`--primary`) para acciones y datos positivos, combinado con un **verde bosque profundo** (`--accent`) para contraste y jerarquía secundaria.
- Las superficies son blancas/limpias (`--card`), con bordes muy sutiles tintados de lima en lugar de gris neutro — esto evita que el producto se vea "genérico" aunque la composición sea minimalista.
- Esquinas muy redondeadas (`rounded-2xl` en contenedores, `rounded-xl`/`rounded-lg` en elementos internos) — sensación amigable y suave, nunca afilada.
- Sombras casi inexistentes; la jerarquía se construye con color, contraste de fondo y bordes, no con elevación. Usar sombra solo para elementos flotantes reales (tooltips, popovers) o estados activos puntuales (pestañas seleccionadas, blobs decorativos).
- Al portar este estilo a un nuevo proyecto: conservar la fórmula (fondo tintado + un color de marca + un acento oscuro + bordes tintados + radios grandes), pero el matiz (hue) puede cambiar si la marca no es verde-lima. La estructura es lo reutilizable, no necesariamente el lima en sí.

---

## 2. Variables de Diseño (de `globals.css`)

### Espacio de color: OKLCH
Todos los colores están definidos en `oklch(L C H)` para mantener contraste perceptual consistente al generar variantes claras/oscuras de un mismo hue.

### Paleta — Modo claro

| Token | Valor | Uso |
|---|---|---|
| `--background` | `oklch(0.975 0.012 150)` | Fondo de página, tinte mint muy sutil |
| `--foreground` | `oklch(0.24 0.04 158)` | Texto principal (verde casi-negro, no negro puro) |
| `--card` | `oklch(1 0 0)` | Fondo de tarjetas — blanco puro, contrasta con el fondo tintado |
| `--card-foreground` | `oklch(0.24 0.04 158)` | Texto sobre tarjetas |
| `--primary` | `oklch(0.82 0.18 138)` | **Verde lima** — color de marca, CTAs, datos positivos |
| `--primary-foreground` | `oklch(0.26 0.06 155)` | Texto sobre primary |
| `--secondary` | `oklch(0.93 0.06 140)` | Superficies suaves (fondos de badges, pills, secciones) |
| `--secondary-foreground` | `oklch(0.3 0.05 158)` | Texto sobre secondary |
| `--muted` / `--muted-foreground` | `oklch(0.94 0.035 148)` / `oklch(0.52 0.045 152)` | Texto/fondos de baja énfasis (labels, descripciones) |
| `--accent` | `oklch(0.27 0.06 156)` | **Verde bosque** — segundo color de marca, alto contraste |
| `--accent-foreground` | `oklch(0.97 0.02 150)` | Texto sobre accent |
| `--destructive` | `oklch(0.6 0.2 22)` | Errores / acciones destructivas |
| `--success` | `oklch(0.62 0.16 150)` | Estados de éxito |
| `--border` / `--input` | `oklch(0.86 0.07 140)` | Bordes — **tintados de lima**, no gris neutro |
| `--ring` | `oklch(0.82 0.18 138)` | Focus ring, igual al primary |
| `--chart-1` … `--chart-5` | de forest a lime | Familia de color para gráficos, en degradado bosque→lima |
| `--radius` | `1rem` | Radio base; todos los demás (`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`) son múltiplos de este |
| `--sidebar*` | variantes propias | Sidebar tiene su propio set de tokens (fondo, borde, accent) ligeramente distinto al resto de la app |

### Modo oscuro
Mismo esquema de hues (140–158°), invirtiendo luminosidad: fondo oscuro verdoso (`oklch(0.2 0.025 158)`), tarjetas un punto más claras que el fondo, `--primary` se mantiene casi igual (el lima funciona en ambos modos), bordes con alpha (`/ 50%`) en lugar de un tono sólido.

### Escala de radios (derivada de `--radius`)
```
--radius-sm:  calc(var(--radius) * 0.6)   → ~0.6rem
--radius-md:  calc(var(--radius) * 0.8)   → ~0.8rem
--radius-lg:  var(--radius)               → 1rem   (= rounded-xl en Tailwind)
--radius-xl:  calc(var(--radius) * 1.4)   → ~1.4rem
--radius-2xl: calc(var(--radius) * 1.8)   → ~1.8rem (= rounded-2xl, el radio "de tarjeta")
--radius-3xl: calc(var(--radius) * 2.2)
--radius-4xl: calc(var(--radius) * 2.6)
```

### Sombras
No se define una escala de `--shadow-*` en `globals.css`. El sistema deliberadamente evita sombras como herramienta de jerarquía. Las únicas excepciones observadas en componentes:
- `shadow-sm` — para indicar el estado "activo" de un tab/segmento dentro de un selector (ej. `bg-secondary/60` con tabs, el tab activo recibe `bg-card shadow-sm`).
- `shadow-lg shadow-primary/30` — únicamente en elementos decorativos circulares/blobs (ej. avatar de IA), para dar sensación de "glow" de marca.
- `shadow-xl` — en tooltips de gráficos (popover flotante real).

**Regla:** no añadir sombra a tarjetas de contenido normales. Solo a: overlays flotantes, estados de selección activa, o elementos decorativos puntuales.

---

## 3. Patrones de Componentes

### Tarjeta estándar (el patrón base de toda la app)
```html
<section class="flex flex-col rounded-2xl border border-border bg-card p-5">
  ...
</section>
```
Esto es el 90% de las superficies de contenido: `rounded-2xl` + `border border-border` + `bg-card` + `p-5`. Se usa tanto en `<section>` semánticas como en componentes shadcn (`Card`).

### Cabecera de tarjeta
```html
<div class="flex items-center justify-between">
  <h2 class="text-base font-semibold text-foreground">Título</h2>
  <button class="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
    <MoreHorizontal class="size-4" />
  </button>
</div>
```
- Título: `text-base font-semibold text-foreground` (o `font-medium` vía `CardTitle` de shadcn).
- Acción de cabecera (menú, filtro): botón cuadrado pequeño `size-7`/`size-8`, `rounded-lg`, sin fondo en reposo, `hover:bg-secondary`.

### Tarjeta "hero" / con color de marca (variante destacada)
Para la única tarjeta principal de cada vista (ej. KPI más importante):
```html
<section class="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground">
  <!-- anillos decorativos -->
  <div class="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full border-[20px] border-primary-foreground/10" />
  ...
</section>
```
Patrón: fondo sólido de marca (`bg-primary` o `bg-accent`), texto invertido (`text-primary-foreground`), círculos decorativos con `border-foreground/10` posicionados absolutamente y recortados con `overflow-hidden`. Máximo una de estas por vista — es el elemento que rompe la monotonía del resto de tarjetas blancas.

### Jerarquía visual — cómo se construye sin sombras
1. **Color de fondo**: `bg-background` (página) → `bg-card` (tarjeta) → `bg-secondary/40-60` (sub-bloque dentro de tarjeta) → `bg-primary`/`bg-accent` (énfasis máximo, solo 1 elemento por vista).
2. **Borde**: todo lo que es una superficie separada del fondo lleva `border border-border`, incluso dentro de otra tarjeta (subtarjetas, filas de tabla).
3. **Texto**: `text-foreground` (primario) → `text-muted-foreground` (secundario/labels) → `text-accent` (dato numérico destacado, ej. porcentajes) → color de marca en iconos/badges.
4. **Tamaño tipográfico**: títulos de tarjeta `text-base font-semibold`; KPIs grandes `text-2xl`/`text-3xl font-bold tracking-tight`; labels `text-xs font-medium text-muted-foreground`; metadatos mínimos `text-[11px]`/`text-[10px]`.
5. **Radio**: contenedor > sub-elemento. Tarjeta = `rounded-2xl`, bloque interno = `rounded-xl`, chip/botón pequeño = `rounded-lg`, pill/badge = `rounded-full`.

### Botones (de `components/ui/button.tsx`, vía CVA)
| Variante | Clases clave | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground` | Acción principal |
| `secondary` | `bg-secondary text-secondary-foreground` | Acción alternativa suave |
| `outline` | `border-border bg-background hover:bg-muted` | Acción terciaria |
| `ghost` | sin fondo, `hover:bg-muted` | Iconos / acciones de bajo énfasis |
| `destructive` | `bg-destructive/10 text-destructive` | Tono suave, no rojo sólido |
| `link` | `text-primary underline-offset-4` | Inline |

Radio de botón base: `rounded-lg`. Tamaños van de `h-6` (xs) a `h-9` (lg); iconos sueltos siempre cuadrados (`size-N`).

### Botones "pill" de acción dentro de tarjetas hero
```html
<button class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-foreground/90 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-foreground transition-colors">
  Texto <Icon class="size-4" />
</button>
```
Patrón recurrente: icono a la derecha del texto, `gap-1.5`, `rounded-xl`, `font-semibold`, `text-sm`.

### Avatares / iconos circulares de identidad
`size-8`/`size-9`/`size-10` + `rounded-full` + `bg-accent` (o `bg-primary/15` para variante suave) + texto/icono centrado.

### Tabla de datos (lista, ej. checkins recientes)
- Cabeceras de columna: `bg-secondary/60`, primera y última celda con `rounded-l-lg`/`rounded-r-lg`, `text-xs font-medium`, padding `px-3 py-2.5`.
- Filas: `border-b border-border`, `last:border-0`, `hover:bg-secondary/30`.
- Badges de estado (ej. "a tiempo"/"tarde"): `inline-flex rounded-full px-2.5 py-1 text-xs font-medium`, color de fondo semántico suave (no sólido).

### Selector de pestañas / segmented control
```html
<div class="grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1">
  <button class="rounded-lg px-3 py-2 text-xs font-medium bg-card text-foreground shadow-sm">Activo</button>
  <button class="rounded-lg px-3 py-2 text-xs font-medium">Inactivo</button>
</div>
```
Único lugar donde `shadow-sm` es apropiado: marcar el segmento activo dentro de un riel.

---

## 4. Reglas de Estilo (defaults de Tailwind a mantener)

Usar siempre estas clases como default, no reinventar valores por componente:

| Propósito | Clase(s) por defecto |
|---|---|
| Separación entre secciones/columnas de layout (grid de dashboard) | `gap-5` |
| Separación entre filas de página | `flex flex-col gap-5` en el contenedor raíz |
| Padding interno de tarjeta | `p-5` |
| Padding interno de sub-bloque dentro de tarjeta | `p-3` o `p-4` |
| Radio de tarjeta/contenedor principal | `rounded-2xl` |
| Radio de sub-bloque / botón mediano | `rounded-xl` |
| Radio de elemento pequeño (icon-button, badge cuadrado) | `rounded-lg` |
| Radio de pill/avatar/indicador | `rounded-full` |
| Borde de cualquier superficie separada | `border border-border` |
| Fondo de superficie de contenido | `bg-card` |
| Fondo de bloque de énfasis bajo dentro de tarjeta | `bg-secondary/40` a `bg-secondary/60` (usar opacidad, no un token nuevo) |
| Texto de label/metadato | `text-xs font-medium text-muted-foreground` |
| Texto de título de tarjeta | `text-base font-semibold text-foreground` |
| Texto de KPI/número grande | `text-2xl`/`text-3xl font-bold tracking-tight` |
| Transiciones de color en hover | `transition-colors hover:bg-secondary` (o `hover:opacity-90` sobre fondos de color sólido) |
| Iconos sueltos en botón cuadrado | `flex size-7/8/9 items-center justify-center rounded-lg` o `rounded-full` |
| Grid responsivo de dashboard | `grid grid-cols-1 gap-5 lg:grid-cols-12` + `lg:col-span-N` por tarjeta |
| Ancho máximo de contenido | `mx-auto max-w-[1400px]` |

**No usar:** `shadow-md`/`shadow-lg` en tarjetas de contenido normal, bordes grises neutros (`border-gray-200`, etc. — siempre usar el token `border-border`), radios pequeños (`rounded-md` o menos) en contenedores de nivel superior.

---

## 5. Cómo reutilizar esto en un proyecto nuevo

1. Copiar el bloque `@theme inline` + los tokens `:root`/`.dark` de `globals.css`, ajustando solo el hue (H en OKLCH) si la marca no es verde-lima — mantener la misma estructura de L/C relativos entre tokens.
2. Mantener `--radius: 1rem` como base; no bajar de eso si se quiere conservar la sensación "amigable/corporativa".
3. Reutilizar el patrón de tarjeta base (`rounded-2xl border border-border bg-card p-5`) como el átomo de toda la UI.
4. Reservar el color `primary` sólido como fondo (no solo como acento) para **máximo una tarjeta hero por vista**; todo lo demás debe ser `bg-card` blanco con bordes tintados.
5. No introducir una escala de sombras nueva — si se necesita elevación, usar `shadow-sm` para estados activos y nada más, salvo overlays reales (popover/tooltip).
