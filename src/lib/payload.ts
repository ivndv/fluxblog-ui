import { defaultLocale, type Locale } from './routes';
import { PayloadResponseSchema } from './schemas';

export interface LexicalNode {
	type: string;
	tag?: string;
	version: number;
	direction?: string;
	format?: string | number;
	indent?: number;
	text?: string;
	style?: string;
	detail?: number;
	mode?: string;
	url?: string;
	listType?: 'bullet' | 'number';
	src?: string;
	alt?: string;
	caption?: string;
	children?: LexicalNode[];
}

export interface LexicalContent {
	root: {
		type: string;
		direction?: string;
		format?: string;
		indent?: number;
		version: number;
		children: LexicalNode[];
	};
}

export interface PayloadMedia {
	id?: string | number;
	url?: string;
	alt?: string;
	width?: number;
	height?: number;
	sizes?: {
		thumbnail?: { url?: string; width?: number; height?: number };
		medium?: { url?: string; width?: number; height?: number };
	};
}

export interface PayloadAuthor {
	id?: string | number;
	name?: string;
	role?: string;
}

export interface PayloadPost {
	id: string | number;
	title: string;
	slug: string;
	content?: LexicalContent | null;
	tags?: { value: string }[] | null;
	date?: string | null;
	excerpt?: string | null;
	featured?: boolean | null;
	featuredImage?: PayloadMedia | string | number | null;
	author?: PayloadAuthor | string | number | null;
	_status?: 'draft' | 'published' | null;
	createdAt: string;
	updatedAt: string;
}

export interface PostsResult {
	docs: PayloadPost[];
	totalDocs: number;
	totalPages: number;
	page: number;
	limit: number;
}

export interface GetPostsOptions {
	locale?: Locale;
	page?: number;
	limit?: number;
	tag?: string;
	sort?: string;
	depth?: number;
}

function normalizePayloadUrl(rawUrl?: string): string {
	const base = (rawUrl || 'http://localhost:3000/api').replace(/\/+$/, '');
	return base.endsWith('/api') ? base : `${base}/api`;
}

// Solo se ejecuta en el servidor durante el build (SSG): PAYLOAD_URL no se expone al cliente.
const PAYLOAD_API_URL = normalizePayloadUrl(import.meta.env.PAYLOAD_URL);
const PAYLOAD_ORIGIN = PAYLOAD_API_URL.replace(/\/api$/, '');

// Cachea las promesas durante un mismo build para no repetir requests.
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
	const existing = cache.get(key) as Promise<T> | undefined;
	if (existing) return existing;

	const promise = loader();
	cache.set(key, promise);
	return promise;
}

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url);

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(
			`[Payload] ${res.status} ${res.statusText} — ${url}${body ? `: ${body.slice(0, 200)}` : ''}`,
		);
	}

	return res.json();
}

/** Absolute URL for a Payload upload, usable by <img>/<Image>. */
export function getMediaUrl(media?: PayloadMedia | string | number | null): string | undefined {
	if (!media || typeof media === 'string' || typeof media === 'number') return undefined;
	if (!media.url) return undefined;
	if (/^https?:\/\//.test(media.url)) return media.url;
	return `${PAYLOAD_ORIGIN}${media.url}`;
}

/** Paginated, published-only posts for one locale. */
export async function getPosts(options: GetPostsOptions = {}): Promise<PostsResult> {
	const {
		locale = defaultLocale,
		page = 1,
		limit = 9,
		tag,
		sort = '-createdAt',
		depth = 1,
	} = options;

	const params = new URLSearchParams();
	params.set('limit', String(limit));
	params.set('page', String(page));
	params.set('sort', sort);
	params.set('depth', String(depth));
	params.set('locale', locale);
	params.set('where[_status][equals]', 'published');
	if (tag) params.set('where[tags.value][equals]', tag);

	const url = `${PAYLOAD_API_URL}/posts?${params.toString()}`;

	return cached(`posts:${url}`, async () => {
		const data = PayloadResponseSchema.parse(await fetchJson(url));
		return data as PostsResult;
	});
}

/** All published posts of a locale (indexes, tags, related posts, static paths). */
export async function getAllPosts(locale: Locale = defaultLocale): Promise<PayloadPost[]> {
	const { docs } = await getPosts({ locale, limit: 100, page: 1 });
	return docs;
}

export async function getPostBySlug(
	slug: string,
	locale: Locale = defaultLocale,
): Promise<PayloadPost | null> {
	const params = new URLSearchParams();
	params.set('where[slug][equals]', slug);
	params.set('where[_status][equals]', 'published');
	params.set('limit', '1');
	params.set('depth', '1');
	params.set('locale', locale);

	const url = `${PAYLOAD_API_URL}/posts?${params.toString()}`;

	return cached(`post:${url}`, async () => {
		const data = PayloadResponseSchema.parse(await fetchJson(url));
		return data.docs[0] ?? null;
	});
}
