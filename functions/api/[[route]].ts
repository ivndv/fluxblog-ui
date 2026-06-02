import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";

// Esquemas de validación (reutilizando la lógica de tus proyectos)
const LexicalNodeSchema: z.ZodType<any> = z.lazy(() =>
	z.object({
		type: z.string(),
		tag: z.string().optional(),
		version: z.number(),
		direction: z.string().optional(),
		format: z.union([z.string(), z.number()]).optional(),
		indent: z.number().optional(),
		text: z.string().optional(),
		style: z.string().optional(),
		detail: z.number().optional(),
		mode: z.string().optional(),
		children: z.array(LexicalNodeSchema).optional(),
	})
);

const PayloadPostSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	content: z.object({
		root: z.object({
			type: z.string(),
			direction: z.string(),
			format: z.string(),
			indent: z.number(),
			version: z.number(),
			children: z.array(LexicalNodeSchema),
		}),
	}),
	tags: z.array(z.object({ value: z.string() })).optional(),
	date: z.string().optional(),
	excerpt: z.string().optional(),
	author: z.object({ name: z.string().optional(), role: z.string().optional() }).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const PayloadResponseSchema = z.object({
	docs: z.array(PayloadPostSchema),
	totalDocs: z.number(),
	limit: z.number(),
	totalPages: z.number(),
	page: z.number(),
});

type Env = {
	PAYLOAD_URL: string;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

/**
 * GET /api/posts - Obtiene la lista de posts desde Payload CMS.
 */
app.get("/posts", async (c) => {
	const locale = c.req.query("locale") || "es";
	const payloadUrl = c.env.PAYLOAD_URL || "http://localhost:3000/api";
	const url = `${payloadUrl}/posts?limit=100&sort=-createdAt&locale=${locale}`;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			return c.json({ error: "Failed to fetch posts from Payload" }, res.status);
		}
		
		const data = await res.json();
		const validatedData = PayloadResponseSchema.parse(data);

		return c.json(validatedData);
	} catch (error) {
		console.error("[API /posts] Error:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

/**
 * GET /api/posts/:slug - Obtiene un post individual por su slug.
 */
app.get("/posts/:slug", async (c) => {
	const slug = c.req.param("slug");
	const locale = c.req.query("locale") || "es";
	const payloadUrl = c.env.PAYLOAD_URL || "http://localhost:3000/api";
	
	if (!slug) {
		return c.json({ error: "Slug is required" }, 400);
	}

	const url = `${payloadUrl}/posts?where[slug][equals]=${slug}&locale=${locale}`;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			return c.json({ error: "Failed to fetch post from Payload" }, res.status);
		}
		
		const data = await res.json();
		const validatedData = PayloadResponseSchema.parse(data);
		const post = validatedData.docs[0] || null;
		
		if (!post) {
			return c.json({ error: "Post not found" }, 404);
		}

		return c.json({ doc: post });
	} catch (error) {
		console.error(`[API /posts/${slug}] Error:`, error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

// Export manejador para Cloudflare Pages Functions
export const onRequest = handle(app);
