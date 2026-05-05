interface LexicalNode {
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
	children?: LexicalNode[];
}

interface LexicalContent {
	root: {
		type: string;
		direction: string;
		format: string;
		indent: number;
		version: number;
		children: LexicalNode[];
	};
}

export interface PayloadPost {
	id: string;
	title: string;
	slug: string;
	content: LexicalContent;
	tags?: { value: string }[];
	date?: string;
	excerpt?: string;
	author?: { name?: string; role?: string };
	createdAt: string;
	updatedAt: string;
}

export interface PayloadResponse<T> {
	docs: T[];
	totalDocs: number;
	limit: number;
	totalPages: number;
	page: number;
}

const PAYLOAD_URL = import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3000/api';

export async function getPosts(locale: string = 'es'): Promise<PayloadPost[]> {
	const url = `${PAYLOAD_URL}/posts?limit=100&sort=-createdAt&locale=${locale}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			const errorText = await res.text();
			console.error(`[Payload] Error fetching posts: ${res.status} ${res.statusText}`, errorText);
			return [];
		}
		const data: PayloadResponse<PayloadPost> = await res.json();
		return data.docs;
	} catch (error) {
		console.error(`[Payload] CRITICAL CONNECTION ERROR fetching posts from ${url}:`, error);
		// Re-lanzamos el error para que el build se detenga pero con info en el log
		throw error;
	}
}

export async function getPostBySlug(
	slug: string,
	locale: string = 'es',
): Promise<PayloadPost | null> {
	const url = `${PAYLOAD_URL}/posts?where[slug][equals]=${slug}&locale=${locale}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			console.error(`[Payload] Error fetching post by slug: ${res.status}`);
			return null;
		}
		const data: PayloadResponse<PayloadPost> = await res.json();
		return data.docs[0] || null;
	} catch (error) {
		console.error(`[Payload] CRITICAL CONNECTION ERROR fetching slug ${slug} from ${url}:`, error);
		throw error;
	}
}
