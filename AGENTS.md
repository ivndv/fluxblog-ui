# AGENTS.md — Guía para Agentes en FluxBlog UI

Guía operativa y técnica para agentes de Inteligencia Artificial que colaboren en el desarrollo, mantenimiento, testing y optimización de la interfaz web **FluxBlog UI**.

---

## 1. Visión General del Proyecto

**FluxBlog UI** es el frontend web estático de alto rendimiento (SSG - Static Site Generation) diseñado para la publicación y lectura del blog técnico de FluxDev. Consume de forma desacoplada la API de Payload CMS (**`fluxblog-api`**) durante el ciclo de compilación para generar páginas estáticas ultrarrápidas, accesibles y optimizadas para SEO.

* **Propósito:** Brindar una experiencia de lectura moderna con soporte nativo multilingüe (Español `/` e Inglés `/en/`), renderizado nativo de nodos ricos de Lexical, selector de temas y preferencias con Zustand, generación automática de feeds RSS y Sitemap.
* **Dominio en Producción:** [https://fluxdev-nova.mgdc.site/](https://fluxdev-nova.mgdc.site/)
* **Backend / Headless CMS:** [https://fluxblog-api.fluxdv.icu/](https://fluxblog-api.fluxdv.icu/)
* **Repositorio:** [https://github.com/ivndv/fluxblog-ui](https://github.com/ivndv/fluxblog-ui)

---

## 2. Antes de Tocar Código (Contexto con CodeGraph)

* **Uso del MCP CodeGraph:** Antes de realizar búsquedas masivas de texto o explorar múltiples archivos a ciegas, invoca la herramienta `codegraph_explore` para inspeccionar el flujo de llamadas, blast radius y el código fuente verbatim de los símbolos en una sola llamada eficiente.
* **Estado y Sincronización:**
  ```bash
  # Verificar el estado del índice de CodeGraph
  codegraph status /home/ivan/software-dev/fluxblog-ui

  # Sincronizar cambios en el árbol de archivos tras crear o renombrar módulos
  codegraph sync /home/ivan/software-dev/fluxblog-ui
  ```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime & Gestor** | **Bun / Node** | `Bun v1.4.x` (`bun.lock`), `Node >=22.23.4` |
| **Framework Web & SSG** | **Astro 7** | `astro ^7.4.4` (Arquitectura en Islas, rutas estáticas) |
| **Integraciones de Astro** | **@astrojs/react, sitemap, rss** | `@astrojs/react ^7.1.2`, `@astrojs/sitemap ^3.7.4`, `@astrojs/rss ^4.0.19` |
| **Librería de Componentes** | **React 19** | `react 19.3.1`, `react-dom 19.3.1`, `@types/react 19.3.0` |
| **Estilos & Tipografía** | **Tailwind CSS 4** | `tailwindcss ^4.3.3`, `@tailwindcss/vite ^4.3.3`, `@tailwindcss/typography ^0.5.20` |
| **Estado Global del Cliente** | **Zustand 5** | `zustand ^5.0.16` (Slices modulares en `src/store/slices/preferencesSlice.ts`) |
| **Renderizado de Contenido** | **Lexical AST + Marked** | Componente nativo `LexicalRenderer.astro` y `marked ^18.1.2` |
| **Validación de Esquemas** | **Zod 4** | `zod ^4.6.7` (`src/lib/schemas.ts`) |
| **Internacionalización (i18n)** | **Paraglide + Astro i18n** | Rutas localizadas: ES `/articulos`, `/etiquetas`, `/acerca`, `/buscar`; EN `/en/blog`, `/en/tags`, `/en/about`, `/en/search`. Mapa central en `src/lib/routes.ts` |
| **Linter & Formatter** | **Biome 2** | `@biomejs/biome ^2.6.4` (`biome.json` con preset recomendado) |
| **Testing Automatizado** | **Vitest 5** | `vitest ^5.0.5`, `@vitejs/plugin-react ^6.1.2`, `@testing-library/react ^16.3.3`, `jsdom` |
| **Infraestructura Edge** | **Cloudflare Pages** | Despliegue estático global con Pages Functions en `functions/` (`wrangler.toml`) |

---

## 4. Estructura del Código

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

---

## 5. Comandos Útiles (Bun)

### 🚀 Desarrollo y Compilación
```bash
# Iniciar servidor local de desarrollo de Astro
bun run dev

# Compilar y probar localmente con emulador de Cloudflare Pages (puerto 4321)
bun run dev:full

# Compilar sitio estático para producción (directorio dist/)
# Incluye Pagefind: genera índices de búsqueda ES y EN
bun run build

# Previsualizar el build estático localmente
bun run preview
```

### 🧪 Testing y Calidad de Código
```bash
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

---

## 6. Variables de Entorno

Crea un archivo `.env` o define la variable durante el build:

```env
# URL de la API de Payload CMS (Backend)
# Local: http://localhost:3000/api (o http://localhost:3050/api)
# Producción: https://fluxblog-api.fluxdv.icu/api
PAYLOAD_URL=http://localhost:3000/api
```

---

## 7. Qué NO Hacer (Reglas Estrictas para Agentes)

1. **NO hacer commit ni push sin autorización explícita:** Nunca ejecutes `git commit` ni `git push` a menos que el usuario lo solicite expresamente.
2. **NO hidratar componentes innecesariamente:** Prioriza siempre componentes nativos `.astro` sin JavaScript en el cliente. Usa React (`client:load`, `client:idle`) única y exclusivamente para elementos verdaderamente interactivos (ej: `SettingsMenu.tsx`).
3. **NO romper el renderizado de Lexical:** Cualquier adición o cambio en los tipos de contenido de Payload debe reflejarse en `src/components/LexicalRenderer.astro`.
4. **NO degradar el pipeline de calidad:** Ejecuta siempre `bun run test && bun run check && bun run build` antes de dar por terminada cualquier tarea.
