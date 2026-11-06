import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, type PayloadPost } from '../../lib/payload';
import { getExcerpt } from '../../lib/post-utils';
import { paths } from '../../lib/routes';

export async function GET(context: APIContext) {
	const { docs: posts } = await getPosts({ limit: 100, locale: 'en' });
	const site = context.site ?? new URL('https://fluxblog.liuma.app');

	return rss({
		title: 'FluxDev Blog (EN)',
		description: 'Personal notes on architecture, modern web development and digital products.',
		site: site.toString(),
		items: posts.map((post: PayloadPost) => ({
			title: post.title,
			pubDate: new Date(post.date || post.createdAt),
			description: getExcerpt(post),
			link: paths.post('en', post.slug),
			categories: post.tags?.map((tag) => tag.value) ?? [],
		})),
		customData: '<language>en-us</language>',
	});
}
