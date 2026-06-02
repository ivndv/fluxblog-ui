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
	children?: LexicalNode[];
}

export interface LexicalContent {
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

// Se ejecuta solo en el servidor durante el build (SSG), por lo que PAYLOAD_URL es seguro y no se expone al cliente.
const PAYLOAD_URL = import.meta.env.PAYLOAD_URL || 'http://localhost:3000/api';

export async function getPosts(locale: string = 'es'): Promise<PayloadPost[]> {
	const url = `${PAYLOAD_URL}/posts?limit=100&sort=-createdAt&locale=${locale}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			const errorText = await res.text();
			console.error(`[Payload] Error fetching posts: ${res.status} ${res.statusText}`, errorText);
			return [];
		}
		const data = await res.json();
		return data.docs;
	} catch (error) {
		console.error(`[Payload] CRITICAL CONNECTION ERROR fetching posts from ${url}:`, error);
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
		const data = await res.json();
		return data.docs[0] || null;
	} catch (error) {
		console.error(`[Payload] CRITICAL CONNECTION ERROR fetching slug ${slug} from ${url}:`, error);
		throw error;
	}
}
