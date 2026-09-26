import { withViewTransition } from '@app/view-transition';

interface TransitionDoc {
	startViewTransition?: unknown;
}

const transitionDoc = (): TransitionDoc => document;

describe('withViewTransition', () => {
	afterEach(() => {
		delete transitionDoc().startViewTransition;
		vi.unstubAllGlobals();
	});

	it('runs the update directly without the API', () => {
		const update = vi.fn();
		withViewTransition({ update });
		expect(update).toHaveBeenCalledOnce();
	});

	it('uses startViewTransition when available', () => {
		const start = vi.fn((callback: () => void) => {
			callback();
		});
		transitionDoc().startViewTransition = start;
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false })),
		);
		const update = vi.fn();

		withViewTransition({ update });

		expect(start).toHaveBeenCalledWith(update);
		expect(update).toHaveBeenCalledOnce();
	});

	it('skips the transition with reduced motion', () => {
		const start = vi.fn();
		transitionDoc().startViewTransition = start;
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true })),
		);
		const update = vi.fn();

		withViewTransition({ update });

		expect(start).not.toHaveBeenCalled();
		expect(update).toHaveBeenCalledOnce();
	});
});
