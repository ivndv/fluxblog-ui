import { describe, expect, it, vi } from 'vitest';
import { app } from '../api/[[route]]';

describe('API Routes (Cloudflare Pages Functions)', () => {
	it('GET /api/health should return status ok and timestamp', async () => {
		const req = new Request('http://localhost/api/health');
		const res = await app.fetch(req, {});

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.status).toBe('ok');
		expect(data.timestamp).toBeDefined();
	});

	it('GET /api/posts should return posts from Payload CMS', async () => {
		const mockResponse = {
			docs: [
				{
					id: 1,
					title: 'Post de prueba',
					slug: 'post-de-prueba',
					content: {
						root: {
							type: 'root',
							direction: 'ltr',
							format: '',
							indent: 0,
							version: 1,
							children: [
								{
									type: 'paragraph',
									version: 1,
									text: 'Hola mundo',
								},
							],
						},
					},
					createdAt: '2026-03-20T00:00:00.000Z',
					updatedAt: '2026-03-20T00:00:00.000Z',
				},
			],
			totalDocs: 1,
			limit: 100,
			totalPages: 1,
			page: 1,
		};

		// Mock global fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response);

		const req = new Request('http://localhost/api/posts?locale=es');
		const res = await app.fetch(req, { PAYLOAD_URL: 'http://localhost:3000/api' });

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data).toEqual(mockResponse);
	});

	it('GET /api/posts/:slug should return 404 when post is not found', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				docs: [],
				totalDocs: 0,
				limit: 10,
				totalPages: 1,
				page: 1,
			}),
		} as Response);

		const req = new Request('http://localhost/api/posts/no-existe');
		const res = await app.fetch(req, { PAYLOAD_URL: 'http://localhost:3000/api' });

		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data).toEqual({ error: 'Post not found' });
	});
});
