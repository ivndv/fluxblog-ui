import { describe, expect, it } from 'vitest';
import { getVisiblePages } from './pagination';

describe('getVisiblePages', () => {
	it('lists every page when there are 7 or fewer', () => {
		expect(getVisiblePages(1, 1)).toEqual([1]);
		expect(getVisiblePages(3, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	it('collapses gaps around the current page', () => {
		expect(getVisiblePages(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
	});

	it('keeps the first and last page visible on edges', () => {
		expect(getVisiblePages(1, 10)).toEqual([1, 2, 'ellipsis', 10]);
		expect(getVisiblePages(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
	});
});
