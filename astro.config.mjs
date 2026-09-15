// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://fluxdev-nova.mgdc.site/',
	i18n: {
		defaultLocale: 'es',
		locales: ['es', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [react(), sitemap()],
	vite: {
		plugins: [
			tailwindcss(),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/paraglide',
				emitTsDeclarations: true,
				strategy: ['url', 'globalVariable', 'baseLocale'],
				trailingSlash: 'always',
				urlPatterns: [
					{
						pattern: '/:path(.*)?',
						localized: [
							['en', '/en/:path(.*)?'],
							['es', '/:path(.*)?'],
						],
					},
				],
			}),
		],
	},
});
