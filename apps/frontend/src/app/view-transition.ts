type ViewTransitionDocument = Document & {
	startViewTransition?: (update: () => void) => unknown;
};

export const prefersReducedMotion = (): boolean =>
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const withViewTransition = ({ update }: { update: () => void }): void => {
	const doc = document as ViewTransitionDocument;
	if (typeof doc.startViewTransition !== 'function' || prefersReducedMotion()) {
		update();
		return;
	}
	doc.startViewTransition(update);
};
