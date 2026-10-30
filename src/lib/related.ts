import type { PayloadPost } from './payload';

function timestamp(post: PayloadPost): number {
	return new Date(post.date || post.createdAt).getTime();
}

function sameId(a: PayloadPost, b: PayloadPost): boolean {
	return String(a.id) === String(b.id);
}

/**
 * Rank related posts by shared tags, then by recency.
 * Falls back to the latest posts when there is no tag overlap.
 */
export function rankRelatedPosts(
	posts: PayloadPost[],
	current: PayloadPost,
	limit = 3,
): PayloadPost[] {
	const currentTags = new Set((current.tags ?? []).map((tag) => tag.value.toLowerCase()));

	const candidates = posts
		.filter((post) => !sameId(post, current))
		.map((post) => ({
			post,
			score: (post.tags ?? []).filter((tag) => currentTags.has(tag.value.toLowerCase())).length,
		}));

	const ranked = candidates.sort(
		(a, b) => b.score - a.score || timestamp(b.post) - timestamp(a.post),
	);

	return ranked.slice(0, limit).map((entry) => entry.post);
}

/** Previous (older) and next (newer) posts in publication order. */
export function getAdjacentPosts(
	posts: PayloadPost[],
	current: PayloadPost,
): { previous: PayloadPost | null; next: PayloadPost | null } {
	const sorted = [...posts].sort((a, b) => timestamp(b) - timestamp(a));
	const index = sorted.findIndex((post) => sameId(post, current));

	if (index === -1) return { previous: null, next: null };

	return {
		previous: sorted[index + 1] ?? null,
		next: sorted[index - 1] ?? null,
	};
}
