import type { z } from 'zod';
import type { PayloadPostSchema, PayloadResponseSchema } from './schema';

/**
 * Variables de entorno y bindings de Cloudflare Pages Functions
 */
export interface Env {
	PAYLOAD_URL?: string;
}

export type PayloadPost = z.infer<typeof PayloadPostSchema>;
export type PayloadResponse = z.infer<typeof PayloadResponseSchema>;
