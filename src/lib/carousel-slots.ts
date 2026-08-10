export type CarouselDirection = 'init' | 'next' | 'prev' | 'none';

const LEFT_VISIBLE = new Set(['far-left', 'mid-left']);
const RIGHT_VISIBLE = new Set(['far-right', 'mid-right']);
export const LEFT_HIDDEN = 'hidden-left';
export const RIGHT_HIDDEN = 'hidden-right';

export function forwardOffset(index: number, active: number, count: number) {
	return (index - active + count) % count;
}

export function visibleSlot(forward: number, count: number): string | 'hidden' {
	switch (forward) {
		case 0:
			return 'hero';
		case 1:
			return 'mid-right';
		case 2:
			return 'far-right';
		default:
			if (forward === count - 1) return 'mid-left';
			if (forward === count - 2) return 'far-left';
			return 'hidden';
	}
}

/** Pick off-screen side when leaving the visible ring. */
export function hiddenSlotForExit(
	prevSlot: string | undefined,
	direction: CarouselDirection,
): typeof LEFT_HIDDEN | typeof RIGHT_HIDDEN {
	if (direction === 'next') {
		if (LEFT_VISIBLE.has(prevSlot ?? '')) return LEFT_HIDDEN;
		if (RIGHT_VISIBLE.has(prevSlot ?? '')) return RIGHT_HIDDEN;
		return LEFT_HIDDEN;
	}

	if (direction === 'prev') {
		if (RIGHT_VISIBLE.has(prevSlot ?? '')) return RIGHT_HIDDEN;
		if (LEFT_VISIBLE.has(prevSlot ?? '')) return LEFT_HIDDEN;
		return RIGHT_HIDDEN;
	}

	return RIGHT_HIDDEN;
}

/** Pick off-screen side when entering the visible ring from hidden. */
export function hiddenSlotForEntry(nextSlot: string): typeof LEFT_HIDDEN | typeof RIGHT_HIDDEN {
	if (LEFT_VISIBLE.has(nextSlot) || nextSlot === 'hero') return LEFT_HIDDEN;
	if (RIGHT_VISIBLE.has(nextSlot)) return RIGHT_HIDDEN;
	return LEFT_HIDDEN;
}

/** Initial SSR / first paint — forward offset 3 on a 6-up carousel sits off the right edge. */
export function hiddenSlotForInit(forward: number, count: number): typeof LEFT_HIDDEN | typeof RIGHT_HIDDEN {
	return forward <= Math.floor(count / 2) ? RIGHT_HIDDEN : LEFT_HIDDEN;
}

export function resolveSlideSlot(
	index: number,
	active: number,
	count: number,
	prevSlot?: string,
	direction: CarouselDirection = 'init',
): string {
	const forward = forwardOffset(index, active, count);
	const nextVisible = visibleSlot(forward, count);

	if (nextVisible !== 'hidden') {
		return nextVisible;
	}

	// Staying hidden — keep side when possible
	if (prevSlot === LEFT_HIDDEN || prevSlot === RIGHT_HIDDEN) {
		return prevSlot;
	}

	if (direction === 'init') {
		return hiddenSlotForInit(forward, count);
	}

	return hiddenSlotForExit(prevSlot, direction);
}

/** Snap without animating when the hidden buffer side doesn't match the travel direction. */
export function hiddenSnapTarget(
	prevSlot: string | undefined,
	nextSlot: string,
): typeof LEFT_HIDDEN | typeof RIGHT_HIDDEN | null {
	if (nextSlot === LEFT_HIDDEN || nextSlot === RIGHT_HIDDEN) return null;

	const enteringFromHidden = prevSlot === LEFT_HIDDEN || prevSlot === RIGHT_HIDDEN;
	if (!enteringFromHidden) return null;

	const desiredHidden = hiddenSlotForEntry(nextSlot);
	return prevSlot === desiredHidden ? null : desiredHidden;
}
