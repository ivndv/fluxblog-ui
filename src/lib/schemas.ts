import { z } from 'zod';

// Esquema recursivo para nodos de Lexical
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

export const LexicalContentSchema = z.object({
	root: z.object({
		type: z.string(),
		direction: z.string(),
		format: z.string(),
		indent: z.number(),
		version: z.number(),
		children: z.array(LexicalNodeSchema),
	}),
});

export const PayloadPostSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	content: LexicalContentSchema,
	tags: z.array(z.object({ value: z.string() })).optional(),
	date: z.string().optional(),
	excerpt: z.string().optional(),
	author: z.object({ name: z.string().optional(), role: z.string().optional() }).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const PayloadResponseSchema = z.object({
	docs: z.array(PayloadPostSchema),
	totalDocs: z.number(),
	limit: z.number(),
	totalPages: z.number(),
	page: z.number(),
});
