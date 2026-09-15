import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { postsController } from '../_controllers/postsController';
import type { Env } from '../_shared/types';

/**
 * Instancia central de la API Hono para Cloudflare Pages Functions
 */
export const app = new Hono<{ Bindings: Env }>().basePath('/api');

// GET /api/health - Comprobación de salud y estado del servicio
app.get('/health', (c) =>
	c.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
	}),
);

// GET /api/posts - Lista de publicaciones
app.get('/posts', postsController.getPosts);

// GET /api/posts/:slug - Detalle de publicación por slug
app.get('/posts/:slug', postsController.getPostBySlug);

// Adaptador para Cloudflare Pages Functions
export const onRequest = handle(app);
