import type { LexicalNode, PayloadPost } from './payload';
import type { Locale } from './routes';

/** Flatten a Lexical AST into plain text. */
export function extractText(nodes: LexicalNode[] | undefined): string {
	if (!nodes?.length) return '';

	const parts: string[] = [];
	const walk = (node: LexicalNode) => {
		if (node.text) parts.push(node.text);
		if (node.children?.length) {
			for (const child of node.children) walk(child);
		}
	};

	for (const node of nodes) walk(node);

	return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** Prefer the explicit excerpt, fall back to the first chunk of content. */
export function getExcerpt(post: PayloadPost, maxLength = 160): string {
	const source = post.excerpt?.trim() || extractText(post.content?.root?.children);
	if (!source) return '';
	if (source.length <= maxLength) return source;
	return `${source.slice(0, maxLength).trimEnd()}…`;
}

/** Estimated reading time in minutes (never below 1). */
export function getReadingTime(post: PayloadPost, wordsPerMinute = 200): number {
	const text = extractText(post.content?.root?.children);
	const words = text ? text.split(/\s+/).length : 0;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/** URL-safe anchor for a heading. */
export function slugifyHeading(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

export interface Heading {
	id: string;
	text: string;
	level: 2 | 3;
}

/** Extract h2/h3 headings (with stable ids) from a Lexical AST. */
export function getHeadings(nodes: LexicalNode[] | undefined): Heading[] {
	const headings: Heading[] = [];

	const walk = (list: LexicalNode[]) => {
		for (const node of list) {
			if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
				const text = extractText(node.children);
				if (text) {
					headings.push({
						id: slugifyHeading(text),
						text,
						level: node.tag === 'h2' ? 2 : 3,
					});
				}
			}

			if (node.children?.length) walk(node.children);
		}
	};

	if (nodes?.length) walk(nodes);

	return headings;
}

/** Locale-aware short date, e.g. "12 mar 2026". */
export function formatDate(value: string | undefined, locale: Locale): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}
