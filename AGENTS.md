# FluxDev Blog — Frontend Rules

Eres un experto en Astro 6 + React 19. Cuando trabajes en este proyecto, sigue estas reglas.

## Core Principles

1. **Astro Islands**: Componentes interactivos con `client:load` / `client:idle`
2. **React 19**: Componentes en `src/components/` con Server Components donde sea posible
3. **Tailwind CSS v4**: Sin archivos CSS personalizados, todo via `@tailwindcss/vite`
4. **TypeScript Strict**: `astro/tsconfigs/strict`
5. **Linter/Formatter**: Biome con tabs, single quotes (`bun run lint`, `bun run format`)
6. **Package Manager**: Bun
7. **i18n**: Español (default) + Inglés, prefijo solo para inglés

## Code Validation

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Dev server (Astro) |
| `bun run build` | Build producción |
| `bun run preview` | Preview del build |
| `bun run astro` | CLI de Astro |
| `bun run lint` | Biome lint (`biome lint --write .`) |
| `bun run format` | Biome format (`biome format --write .`) |
| `bun run check` | Biome check completo (`biome check --write .`) |
| `bunx biome ci .` | Biome CI (solo reporta, no escribe) |
| `bun run test` | Vitest run |
| `bun run test:watch` | Vitest watch mode |

## CI/CD

El workflow (`.github/workflows/frontend.yml`) corre en `main` y PRs:
1. Setup Bun 1.3.13
2. `bun install`
3. `bun run lint` — Biome lint
4. `bun run check` — Biome check
5. `bun run test` — Vitest
6. `bun run build` — Astro build
7. Deploy a Cloudflare Pages (solo en push a main)

Requiere secret: `CLOUDFLARE_API_TOKEN`

## Testing

- **Framework**: Vitest 4 + jsdom
- **Librerías**: @testing-library/react, @testing-library/jest-dom
- **Tests por archivo**: junto al componente (`.test.ts` o `.test.tsx`)
- **Setup**: `src/test/setup.ts` importa jest-dom matchers

## Project Structure

```
src/
├── components/            # Componentes React (Islands)
│   ├── SettingsMenu.tsx   # Theme/lang switcher
│   ├── Header.astro       # Nav + SettingsMenu
│   ├── Footer.astro       # Links + suscripción
│   └── animations/
│       └── FadeIn.tsx     # Framer Motion wrapper
├── layouts/
│   └── Layout.astro       # Layout principal (SEO, meta)
├── lib/
│   └── payload.ts         # API client para Payload CMS
├── pages/                 # Rutas
│   ├── index.astro        # Home (es)
│   ├── blog/[slug].astro  # Post individual (es)
│   ├── en/index.astro     # Home (en)
│   ├── en/blog/[slug].astro # Post individual (en)
│   └── rss.xml.ts         # RSS feed
├── styles/
│   └── global.css         # Tailwind v4 tokens + base
└── test/
    └── setup.ts           # Setup de Vitest
```

## Technology Stack

| Tecnología | Uso |
|------------|-----|
| Astro 6 | Static Site Generator + SSR |
| React 19 | Interactive components (Islands) |
| Tailwind CSS v4 | Estilos utilitarios |
| Framer Motion 12 | Animaciones |
| Biome 2 | Linter + Formatter |
| Vitest 4 | Test runner |
| @testing-library/react | Testing de componentes React |
| Cloudflare Pages | Hosting/Deploy |
| @astrojs/rss | RSS feed |
| @astrojs/sitemap | Sitemap generation |

## Env Variables

| Variable | Descripción |
|----------|-------------|
| `PUBLIC_PAYLOAD_URL` | URL del backend Payload CMS (ej: `http://localhost:3000/api`) |

## Routing

| Ruta | Descripción |
|------|-------------|
| `/` | Home con posts recientes |
| `/[slug]` | Post individual |
| `/?lang=en` | Versión inglés |

## Coding Conventions

### Componente React (Island)
```tsx
import type { FC } from 'react';

interface Props {
  title: string;
}

const MiComponente: FC<Props> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default MiComponente;
```

## Design System

- **Color primario**: `#141b4d` (dark navy)
- **Background**: `#fcfcfc` / modo oscuro: `#1a1a2e`
- **Tipografía**: System UI (definida por Tailwind)
- **Animaciones**: Framer Motion para transiciones
- **Dark mode**: Clase en `<html>` via Astro + Tailwind `dark:`

## Known Conventions

- `PUBLIC_PAYLOAD_URL` se usa en fetch directo al backend
- No hay store global (cada isla fetch sus datos)
- i18n por rutas: `/en/` para inglés, `/` para español (sin prefijo)
- El modo oscuro usa clase en `<html>` combinado con Tailwind
