export const POSTS_PER_PAGE = 9;

export type PageEntry = number | 'ellipsis';

/**
 * Compact page list: [1, '…', 4, 5, 6, '…', 10].
 * Shows every page when there are 7 or fewer.
 */
export function getVisiblePages(current: number, total: number): PageEntry[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, index) => index + 1);
	}

	const pages = new Set<number>([1, total, current - 1, current, current + 1]);
	const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

	const result: PageEntry[] = [];
	let previous = 0;

	for (const page of sorted) {
		if (previous && page - previous > 1) result.push('ellipsis');
		result.push(page);
		previous = page;
	}

	return result;
}
