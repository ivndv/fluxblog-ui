import { describe, expect, it } from 'vitest';
import type { PayloadPost } from './payload';
import {
	extractText,
	formatDate,
	getExcerpt,
	getHeadings,
	getReadingTime,
	slugifyHeading,
} from './post-utils';

const post: PayloadPost = {
	id: 1,
	title: 'Test post',
	slug: 'test-post',
	createdAt: '2026-03-12T12:00:00.000Z',
	updatedAt: '2026-03-12T12:00:00.000Z',
	content: {
		root: {
			type: 'root',
			version: 1,
			children: [
				{
					type: 'paragraph',
					version: 1,
					children: [{ type: 'text', version: 1, text: 'Hola mundo' }],
				},
				{
					type: 'paragraph',
					version: 1,
					children: [{ type: 'text', version: 1, text: 'segundo párrafo' }],
				},
			],
		},
	},
};

describe('post-utils', () => {
	it('flattens Lexical nodes into plain text', () => {
		expect(extractText(post.content?.root.children)).toBe('Hola mundo segundo párrafo');
		expect(extractText(undefined)).toBe('');
	});

	it('uses the excerpt field when present', () => {
		expect(getExcerpt({ ...post, excerpt: 'Resumen corto' })).toBe('Resumen corto');
	});

	it('falls back to content and truncates', () => {
		const excerpt = getExcerpt(post, 10);
		expect(excerpt.startsWith('Hola mundo')).toBe(true);
		expect(excerpt.endsWith('…')).toBe(true);
	});

	it('estimates at least one minute of reading', () => {
		expect(getReadingTime(post)).toBe(1);
	});

	it('formats dates per locale', () => {
		expect(formatDate(post.createdAt, 'es')).toContain('2026');
		expect(formatDate(post.createdAt, 'en')).toContain('2026');
		expect(formatDate(undefined, 'es')).toBe('');
		expect(formatDate('not-a-date', 'es')).toBe('');
	});

	it('slugifies headings without diacritics', () => {
		expect(slugifyHeading('La evolución de los gestores')).toBe('la-evolucion-de-los-gestores');
	});

	it('extracts h2/h3 headings with stable ids', () => {
		const nodes = [
			{
				type: 'heading',
				tag: 'h2',
				version: 1,
				children: [{ type: 'text', version: 1, text: 'La evolución' }],
			},
			{
				type: 'paragraph',
				version: 1,
				children: [{ type: 'text', version: 1, text: 'texto' }],
			},
			{
				type: 'heading',
				tag: 'h3',
				version: 1,
				children: [{ type: 'text', version: 1, text: 'Detalle' }],
			},
		];

		expect(getHeadings(nodes)).toEqual([
			{ id: 'la-evolucion', text: 'La evolución', level: 2 },
			{ id: 'detalle', text: 'Detalle', level: 3 },
		]);
	});
});
