import { describe, expect, it } from 'vitest';
import { getPostBySlug, getPosts } from './payload';

describe('payload', () => {
	it('should export getPosts and getPostBySlug', () => {
		expect(getPosts).toBeDefined();
		expect(getPostBySlug).toBeDefined();
	});
});
