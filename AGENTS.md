# AGENTS.md — FluxBlog UI

Guía operativa y técnica para agentes de IA que colaboren en el desarrollo, mantenimiento, testing y optimización de la interfaz web **FluxBlog UI**.

## 1. Visión general

**FluxBlog UI** es el frontend web estático de alto rendimiento (SSG, Static Site Generation) diseñado para la publicación y lectura del blog técnico de FluxDev. Consume de forma desacoplada la API de Payload CMS (**`fluxblog-api`**) durante el ciclo de compilación para generar páginas estáticas ultrarrápidas, accesibles y optimizadas para SEO.

- **Propósito:** brindar una experiencia de lectura moderna con soporte nativo multilingüe (español `/` e inglés `/en/`), renderizado nativo de nodos ricos de Lexical, selector de temas y preferencias con Zustand, y generación automática de feeds RSS y Sitemap.
- **Dominio en producción:** [https://fluxdev-nova.mgdc.site/](https://fluxdev-nova.mgdc.site/)
- **Backend / Headless CMS:** [https://fluxblog-api.fluxdv.icu/](https://fluxblog-api.fluxdv.icu/)
- **Repositorio:** [https://github.com/ivndv/fluxblog-ui](https://github.com/ivndv/fluxblog-ui)

## 2. Antes de tocar código

**CodeGraph** (índice de símbolos del repo): usa `codegraph_explore` (`query`, `maxFiles`, `projectPath`) antes de un grep masivo o de leer varios archivos; devuelve fuente verbatim, rutas de llamada e impacto.

- `codegraph sync /home/ivan/software-dev/fluxblog-ui` tras editar, pull o cambiar de rama (incremental, uso normal).
- `codegraph index /home/ivan/software-dev/fluxblog-ui` solo al crear el índice, tras `codegraph upgrade` o si `status` avisa `built by vX` (rebuild completo).
- `codegraph status /home/ivan/software-dev/fluxblog-ui` para comprobar el estado.

## 3. Stack tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime y gestor** | **Bun / Node** | `Bun v1.4.x` (`bun.lock`), `Node >=22.23.4` |
| **Framework web y SSG** | **Astro 7** | `astro ^7.4.4` (arquitectura en islas, rutas estáticas) |
| **Integraciones de Astro** | **@astrojs/react, sitemap, rss** | `@astrojs/react ^7.1.2`, `@astrojs/sitemap ^3.7.4`, `@astrojs/rss ^4.0.19` |
| **Librería de componentes** | **React 19** | `react 19.3.1`, `react-dom 19.3.1`, `@types/react 19.3.0` |
| **Estilos y tipografía** | **Tailwind CSS 4** | `tailwindcss ^4.3.3`, `@tailwindcss/vite ^4.3.3`, `@tailwindcss/typography ^0.5.20` |
| **Estado global del cliente** | **Zustand 5** | `zustand ^5.0.16` (slices modulares en `src/store/slices/preferencesSlice.ts`) |
| **Renderizado de contenido** | **Lexical AST + Marked** | Componente nativo `LexicalRenderer.astro` y `marked ^18.1.2` |
| **Validación de esquemas** | **Zod 4** | `zod ^4.6.7` (`src/lib/schemas.ts`) |
| **Internacionalización (i18n)** | **Paraglide + Astro i18n** | Rutas localizadas: ES `/articulos`, `/etiquetas`, `/acerca`, `/buscar`; EN `/en/blog`, `/en/tags`, `/en/about`, `/en/search`. Mapa central en `src/lib/routes.ts` |
| **Linter y formatter** | **Biome 2** | `@biomejs/biome ^2.6.4` (`biome.json` con preset recomendado) |
| **Testing automatizado** | **Vitest 5** | `vitest ^5.0.5`, `@vitejs/plugin-react ^6.1.2`, `@testing-library/react ^16.3.3`, `jsdom` |
| **Infraestructura edge** | **Cloudflare Pages** | Despliegue estático global con Pages Functions en `functions/` |

## 4. Estructura del código

```
fluxblog-ui/
├── .github/                       → Workflows de CI/CD y composite actions
│   ├── actions/setup/action.yml   → Composite Action reutilizable con caché de Bun
│   └── workflows/ci-cd.yml        → Pipeline automatizado de lint, test, build y deploy
├── functions/                     → Cloudflare Pages Functions (Edge API modular)
│   ├── _controllers/              → Controladores de endpoints (postsController.ts, test)
│   ├── _shared/                   → Esquemas y tipos compartidos (schema.ts, types.ts)
│   └── api/[[route]].ts           → Router Edge principal con /api/health y /api/posts
├── public/                        → Headers, robots.txt, llms.txt (assets alojados en R2 CDN)
├── src/                           → Código fuente de la aplicación Astro + React
│   ├── components/                → Componentes UI organizados por dominio
│   │   ├── blog/                  → Dominio de posts y contenido
│   │   │   ├── AuthorCard.astro   → Tarjeta del autor al final del post
│   │   │   ├── Hero.astro         → Hero de la portada (bio, CTAs, avatar)
│   │   │   ├── HomeContent.astro  → Portada: solo el hero
│   │   │   ├── LexicalRenderer.astro → Renderizador nativo de nodos Lexical AST a HTML
│   │   │   ├── Pagination.astro   → Paginación estática del índice
│   │   │   ├── PostCard.astro     → Tarjeta reutilizable de post
│   │   │   ├── PostContent.astro  → Cuerpo del post (portada, TOC, share, autor)
│   │   │   ├── PostNavigation.astro → Anterior / siguiente
│   │   │   ├── RelatedPosts.astro → Artículos relacionados por tags
│   │   │   ├── ShareLinks.astro   → X, LinkedIn y copiar enlace
│   │   │   ├── TableOfContents.astro → TOC desde headings del AST
│   │   │   └── TagPill.astro      → Chip de etiqueta
│   │   ├── layout/                → Dominio de estructura y layout
│   │   │   ├── Footer.astro       → Pie de página institucional y enlaces
│   │   │   └── Header.astro       → Barra de navegación y acceso a settings
│   │   ├── pages/                 → Vistas compartidas entre rutas ES/EN
│   │   │   ├── AboutPage.astro     → Página /acerca (texto desde Paraglide)
│   │   │   ├── BlogIndexPage.astro → Índice con tags y paginación
│   │   │   ├── BlogPostPage.astro  → Layout de un post
│   │   │   ├── LegalPage.astro     → Términos y privacidad
│   │   │   ├── SearchPage.astro    → Página de resultados de Pagefind (fallback)
│   │   │   └── TagPage.astro       → Listado por etiqueta
│   │   └── ui/                    → Dominio de UI atómica e interactiva
│   │       ├── animations/        → Transiciones visuales (FadeIn.astro)
│   │       ├── icons/             → Iconografía SVG optimizada (Moon, Sun, Github, etc.)
│   │       ├── SettingsMenu.test.ts → Tests unitarios del menú de ajustes
│   │       ├── SearchDialog.tsx   → Modal de búsqueda Pagefind (Cmd/Ctrl+K)
│   │       └── SettingsMenu.tsx   → Componente interactivo React (selector de tema e idioma)
│   ├── layouts/                   → Plantillas maestras de HTML
│   │   └── Layout.astro           → Base HTML, metatags OpenGraph y scripts globales
│   ├── lib/                       → Clientes de API, servicios y esquemas
│   │   ├── pagination.ts          → POSTS_PER_PAGE y getVisiblePages
│   │   ├── payload.test.ts        → Tests unitarios del cliente de Payload
│   │   ├── payload.ts             → Cliente Fetch tipado para la API de Payload CMS
│   │   ├── post-utils.ts          → extractText, excerpt, reading time, headings y fechas
│   │   ├── related.ts              → rankRelatedPosts y getAdjacentPosts
│   │   ├── routes.ts              → Mapa de URLs ES/EN y translatePath
│   │   ├── schemas.ts             → Esquemas Zod para validar respuestas de posts
│   │   └── tags.ts                → Extracción de etiquetas únicas
│   ├── pages/                     → Enrutamiento basado en archivos de Astro
│   │   ├── [...locale]/           → Home unificada (/ y /en/)
│   │   │   └── index.astro
│   │   ├── articulos/             → Rutas ES
│   │   │   ├── index.astro        → /articulos
│   │   │   ├── [slug].astro       → /articulos/[slug]
│   │   │   └── page/[page].astro  → /articulos/page/[page]
│   │   ├── en/
│   │   │   ├── about.astro        → /en/about
│   │   │   ├── blog/              → /en/blog, /en/blog/[slug], /en/blog/page/[page]
│   │   │   ├── legal/[doc].astro  → /en/legal/terms|privacy
│   │   │   ├── rss.xml.ts         → Feed RSS (EN)
│   │   │   ├── search.astro       → /en/search
│   │   │   └── tags/[tag].astro   → /en/tags/[tag]
│   │   ├── acerca.astro           → /acerca
│   │   ├── buscar.astro           → /buscar
│   │   ├── etiquetas/[tag].astro  → /etiquetas/[tag]
│   │   ├── legal/[doc].astro      → /legal/terminos|privacidad
│   │   ├── 404.astro              → Página 404 bilingüe
│   │   └── rss.xml.ts             → Feed RSS (ES)
│   ├── store/                     → Estado del cliente con Zustand (solo tema)
│   │   ├── slices/                → Slices de estado (preferencesSlice.ts)
│   │   └── store.ts               → Store unificado con persistencia
│   ├── styles/                    → Hojas de estilo globales
│   │   └── global.css             → Directivas de Tailwind CSS 4 y variables CSS
│   └── test/                      → Configuración de pruebas
│       └── setup.ts               → Setup y matchers de testing library
├── messages/                      → Traducciones de UI (Paraglide/inlang)
│   ├── es.json
│   └── en.json
├── astro.config.mjs               → Configuración central de Astro (integraciones y routing)
├── biome.json                     → Configuración de formateo y reglas de Biome
├── tsconfig.json                  → Configuración estricta de TypeScript
├── vitest.config.ts               → Configuración de tests unitarios con Vitest y plugin React
└── wrangler.json                  → Configuración de Cloudflare Pages
```

## 5. Arquitectura y flujo de datos

- **Generación estática:** durante `bun run build`, `src/lib/payload.ts` consulta la API de Payload y `src/lib/schemas.ts` valida las respuestas con Zod; el resultado son páginas estáticas por ruta ES/EN.
- **Búsqueda:** Pagefind indexa el HTML generado al final del build y la búsqueda se resuelve en el cliente (`SearchDialog.tsx`, `SearchPage.astro`).
- **Estado del cliente:** mínimo y persistido con Zustand, limitado a las preferencias de tema e idioma.
- **Edge:** Cloudflare Pages sirve `functions/api/[[route]].ts`, un router modular con `/api/health` y `/api/posts` que delega en `functions/_controllers/`.

## 6. Variables de entorno

Se define en un archivo `.env` o durante el build. Nunca documentar valores reales de secretos.

| Variable | Descripción |
| :--- | :--- |
| `PAYLOAD_URL` | URL base de la API de Payload CMS. En local apunta al backend en el puerto 3050; en producción al dominio de la API. |

## 7. Comandos

```bash
# Iniciar servidor local de desarrollo de Astro
bun run dev

# Compilar y probar localmente con emulador de Cloudflare Pages (puerto 4321)
bun run dev:full

# Compilar sitio estático para producción (dist/) e incluir Pagefind con índices ES y EN
bun run build

# Previsualizar el build estático localmente
bun run preview

# Ejecutar todas las pruebas unitarias con Vitest
bun run test

# Ejecutar pruebas en modo observador (watch)
bun run test:watch

# Diagnóstico, formateo y corrección automática con Biome
bun run check

# Formatear archivos con Biome
bun run format

# Ejecutar linter con Biome
bun run lint
```

## 8. Convenciones y reglas críticas

1. **Commit y push:** prohibido ejecutar `git commit` o `git push` sin autorización explícita del usuario.
2. **No hidratar componentes innecesariamente:** priorizar siempre componentes nativos `.astro` sin JavaScript en el cliente. Usar React (`client:load`, `client:idle`) única y exclusivamente para elementos verdaderamente interactivos (ej: `SettingsMenu.tsx`).
3. **No romper el renderizado de Lexical:** cualquier adición o cambio en los tipos de contenido de Payload debe reflejarse en `src/components/LexicalRenderer.astro`.
4. **No degradar el pipeline de calidad:** ejecutar siempre `bun run test && bun run check && bun run build` antes de dar por terminada cualquier tarea.

## 9. Flujo de Git y despliegue

- **Prohibido:** hacer `git commit` o `git push` sin la aprobación explícita del usuario.
- **Ramas:** todo el desarrollo se realiza en `develop`; el merge a `main` solo se hace con aprobación explícita.
- **Mensajes:** Conventional Commits en minúsculas y en español (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`).
- **Despliegue:** Cloudflare Pages sirve el sitio estático y las Pages Functions de `functions/`; el pipeline `.github/workflows/ci-cd.yml` ejecuta lint, test, build y deploy.
