export type Locale = 'es' | 'en';

export type LegalDoc = 'terms' | 'privacy';

export const locales: Locale[] = ['es', 'en'];
export const defaultLocale: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
	return value === 'es' || value === 'en';
}

export function getLocaleFromPath(pathname: string): Locale {
	return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';
}

/**
 * Public URL map. Spanish lives at the root, English under `/en`.
 * Code stays in English; only the URL segments are localized.
 */
export const routes = {
	home: { es: '/', en: '/en/' },
	blog: { es: '/articulos', en: '/en/blog' },
	about: { es: '/acerca', en: '/en/about' },
	search: { es: '/buscar', en: '/en/search' },
	rss: { es: '/rss.xml', en: '/en/rss.xml' },
} as const;

export const paths = {
	home: (locale: Locale) => routes.home[locale],
	blog: (locale: Locale) => routes.blog[locale],
	blogPage: (locale: Locale, page: number) => `${routes.blog[locale]}/page/${page}`,
	post: (locale: Locale, slug: string) => `${routes.blog[locale]}/${slug}`,
	tag: (locale: Locale, tag: string) =>
		`${locale === 'es' ? '/etiquetas' : '/en/tags'}/${encodeURIComponent(tag)}`,
	about: (locale: Locale) => routes.about[locale],
	legal: (locale: Locale, doc: LegalDoc) =>
		locale === 'es' ? `/legal/${doc === 'terms' ? 'terminos' : 'privacidad'}` : `/en/legal/${doc}`,
	search: (locale: Locale) => routes.search[locale],
	rss: (locale: Locale) => routes.rss[locale],
};

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/**
 * Translate a pathname into the target locale, keeping the current page.
 * `alternateSlug` is required for posts whose localized slugs differ.
 */
export function translatePath(pathname: string, target: Locale, alternateSlug?: string): string {
	const clean = pathname.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
	const withoutLocale = clean === '/en' ? '/' : clean.startsWith('/en/') ? clean.slice(3) : clean;
	const segments = withoutLocale.split('/').filter(Boolean);

	if (segments.length === 0) return paths.home(target);

	const [first, second, third] = segments;

	if ((first === 'articulos' || first === 'blog') && segments.length === 1) {
		return paths.blog(target);
	}

	if ((first === 'articulos' || first === 'blog') && second === 'page' && third) {
		const page = Number.parseInt(third, 10);
		return paths.blogPage(target, Number.isNaN(page) ? 1 : page);
	}

	if (first === 'articulos' || first === 'blog') {
		return paths.post(target, alternateSlug ?? safeDecode(second));
	}

	if (first === 'etiquetas' || first === 'tags') {
		return paths.tag(target, safeDecode(second));
	}

	if (first === 'acerca' || first === 'about') {
		return paths.about(target);
	}

	if (first === 'legal' && second) {
		const doc: LegalDoc = second === 'terminos' || second === 'terms' ? 'terms' : 'privacy';
		return paths.legal(target, doc);
	}

	if (first === 'buscar' || first === 'search') {
		return paths.search(target);
	}

	return paths.home(target);
}

/** Locale variants for `getStaticPaths`. */
export function localizedPaths(): Array<{ params: { locale: string | undefined } }> {
	return [{ params: { locale: undefined } }, { params: { locale: 'en' } }];
}
