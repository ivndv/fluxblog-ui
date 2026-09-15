import type { Context } from 'hono';
import { PayloadResponseSchema } from '../_shared/schema';
import type { Env } from '../_shared/types';

/**
 * Controlador para gestionar la obtención y consulta de artículos desde Payload CMS
 */
export const postsController = {
	/**
	 * GET /api/posts - Obtiene la lista de posts desde Payload CMS con soporte de idioma
	 */
	async getPosts(c: Context<{ Bindings: Env }>) {
		const locale = c.req.query('locale') || 'es';
		const payloadUrl = c.env.PAYLOAD_URL || 'http://localhost:3000/api';
		const url = `${payloadUrl}/posts?limit=100&sort=-createdAt&locale=${locale}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				return c.json({ error: 'Failed to fetch posts from Payload' }, res.status as any);
			}

			const data = await res.json();
			const validatedData = PayloadResponseSchema.parse(data);

			return c.json(validatedData);
		} catch (error) {
			console.error('[API /posts] Error:', error);
			return c.json({ error: 'Internal Server Error' }, 500);
		}
	},

	/**
	 * GET /api/posts/:slug - Obtiene un post individual por su slug
	 */
	async getPostBySlug(c: Context<{ Bindings: Env }>) {
		const slug = c.req.param('slug');
		const locale = c.req.query('locale') || 'es';
		const payloadUrl = c.env.PAYLOAD_URL || 'http://localhost:3000/api';

		if (!slug) {
			return c.json({ error: 'Slug is required' }, 400);
		}

		const url = `${payloadUrl}/posts?where[slug][equals]=${slug}&locale=${locale}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				return c.json({ error: 'Failed to fetch post from Payload' }, res.status as any);
			}

			const data = await res.json();
			const validatedData = PayloadResponseSchema.parse(data);
			const post = validatedData.docs[0] || null;

			if (!post) {
				return c.json({ error: 'Post not found' }, 404);
			}

			return c.json({ doc: post });
		} catch (error) {
			console.error(`[API /posts/${slug}] Error:`, error);
			return c.json({ error: 'Internal Server Error' }, 500);
		}
	},
};
