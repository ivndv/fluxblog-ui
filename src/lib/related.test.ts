import { describe, expect, it } from 'vitest';
import type { PayloadPost } from './payload';
import { getAdjacentPosts, rankRelatedPosts } from './related';

function makePost(id: number, slug: string, date: string, tags: string[] = []): PayloadPost {
	return {
		id,
		title: slug,
		slug,
		date,
		createdAt: date,
		updatedAt: date,
		tags: tags.map((value) => ({ value })),
	};
}

const current = makePost(2, 'current', '2026-03-10T00:00:00Z', ['astro', 'cms']);
const posts = [
	makePost(1, 'old-astro', '2026-01-01T00:00:00Z', ['astro']),
	makePost(2, 'current', '2026-03-10T00:00:00Z', ['astro', 'cms']),
	makePost(3, 'new-bun', '2026-04-01T00:00:00Z', ['bun']),
	makePost(4, 'astro-cms', '2026-02-01T00:00:00Z', ['astro', 'cms']),
];

describe('rankRelatedPosts', () => {
	it('excludes the current post and prioritizes tag overlap', () => {
		const related = rankRelatedPosts(posts, current, 2);

		expect(related.map((post) => post.slug)).toEqual(['astro-cms', 'old-astro']);
	});

	it('falls back to the latest posts when there is no overlap', () => {
		const lone = makePost(9, 'lone', '2026-03-11T00:00:00Z', ['rust']);
		const related = rankRelatedPosts(posts, lone, 2);

		expect(related.map((post) => post.slug)).toEqual(['new-bun', 'current']);
	});
});

describe('getAdjacentPosts', () => {
	it('returns older as previous and newer as next', () => {
		const { previous, next } = getAdjacentPosts(posts, current);

		expect(previous?.slug).toBe('astro-cms');
		expect(next?.slug).toBe('new-bun');
	});

	it('returns null at the edges', () => {
		const newest = posts.find((post) => post.slug === 'new-bun')!;
		const oldest = posts.find((post) => post.slug === 'old-astro')!;

		expect(getAdjacentPosts(posts, newest).next).toBeNull();
		expect(getAdjacentPosts(posts, oldest).previous).toBeNull();
	});
});
