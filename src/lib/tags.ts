import { getAllPosts } from './payload';
import type { Locale } from './routes';

/** Unique, alphabetically sorted tags for a locale. */
export async function getTags(locale: Locale): Promise<string[]> {
	const posts = await getAllPosts(locale);
	const tags = posts.flatMap((post) => post.tags?.map((tag) => tag.value) ?? []);

	return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}
