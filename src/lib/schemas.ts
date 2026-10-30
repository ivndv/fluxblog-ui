import { z } from 'zod';

// Lexical AST node. `.loose()` keeps renderer-specific props (url, listType, src, alt, caption…).
export const LexicalNodeSchema: z.ZodType<any> = z.lazy(() =>
	z
		.object({
			type: z.string(),
			tag: z.string().nullish(),
			version: z.number(),
			direction: z.string().nullish(),
			format: z.union([z.string(), z.number()]).nullish(),
			indent: z.number().nullish(),
			text: z.string().nullish(),
			style: z.string().nullish(),
			detail: z.number().nullish(),
			mode: z.string().nullish(),
			children: z.array(LexicalNodeSchema).nullish(),
		})
		.loose(),
);

export const LexicalContentSchema = z.object({
	root: z.object({
		type: z.string(),
		direction: z.string().nullish(),
		format: z.string().nullish(),
		indent: z.number().nullish(),
		version: z.number(),
		children: z.array(LexicalNodeSchema),
	}),
});

const PayloadImageSizeSchema = z.object({
	url: z.string().nullish(),
	width: z.number().nullish(),
	height: z.number().nullish(),
});

export const PayloadMediaSchema = z.object({
	id: z.union([z.string(), z.number()]).nullish(),
	url: z.string().nullish(),
	alt: z.string().nullish(),
	width: z.number().nullish(),
	height: z.number().nullish(),
	sizes: z
		.object({
			thumbnail: PayloadImageSizeSchema.nullish(),
			medium: PayloadImageSizeSchema.nullish(),
		})
		.nullish(),
});

const PayloadAuthorSchema = z.object({
	id: z.union([z.string(), z.number()]).nullish(),
	name: z.string().nullish(),
	role: z.string().nullish(),
});

export const PayloadPostSchema = z.object({
	id: z.union([z.string(), z.number()]),
	title: z.string(),
	slug: z.string(),
	content: LexicalContentSchema.nullish(),
	tags: z.array(z.object({ value: z.string() })).nullish(),
	date: z.string().nullish(),
	excerpt: z.string().nullish(),
	featured: z.boolean().nullish(),
	featuredImage: z.union([z.number(), z.string(), PayloadMediaSchema]).nullish(),
	author: z.union([z.number(), z.string(), PayloadAuthorSchema]).nullish(),
	_status: z.enum(['draft', 'published']).nullish(),
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
