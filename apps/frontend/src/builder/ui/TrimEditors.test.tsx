import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	DEFAULT_FINISHING_TAPE,
	DEFAULT_GROMMETS,
	findTrimColor,
	isDesignDocument,
	isDesignDocumentV5,
	isTrimSpec,
	upgradeDesignDocument,
	upgradeV5ToV6,
} from '@uniq/shared';

import { createDefaultDesign } from '@builder/design/default-design';
import {
	setFinishingTapeCommand,
	setGrommetsCommand,
} from '@builder/design/design-commands';
import { describeTrim } from '@builder/grips/grip-labels';
import { useDesignStore } from '@builder/store/design-store';
import { FinishingTapeEditor, GrommetsEditor } from '@builder/ui/TrimEditors';

import type { DesignDocumentV5 } from '@uniq/shared';

const document = (): ReturnType<typeof createDefaultDesign> =>
	useDesignStore.getState().document;

const toV5 = (): DesignDocumentV5 => {
	const v5: Record<string, unknown> = { ...createDefaultDesign(), schemaVersion: 5 };
	delete v5['grommets'];
	delete v5['finishingTape'];
	delete v5['shaftExtendsHead'];
	return v5 as unknown as DesignDocumentV5;
};

describe('trim schema', () => {
	it('validates trim specs', () => {
		expect(isTrimSpec(DEFAULT_GROMMETS)).toBe(true);
		expect(isTrimSpec({ colorId: 'gold', finish: 'matte' })).toBe(true);
		expect(isTrimSpec({ colorId: 'plaid', finish: 'matte' })).toBe(false);
		expect(isTrimSpec({ colorId: 'black', finish: 'satin' })).toBe(false);
		expect(isTrimSpec({ colorId: 3, finish: 'matte' })).toBe(false);
		expect(isTrimSpec(null)).toBe(false);
		expect(findTrimColor({ colorId: 'volt' })?.hex).toBe('#c6ff3d');
	});

	it('accepts no finishing tape and rejects bad trims in a document', () => {
		const base = createDefaultDesign();
		expect(isDesignDocument(base)).toBe(true);
		expect(isDesignDocument({ ...base, finishingTape: null })).toBe(true);
		expect(
			isDesignDocument({ ...base, finishingTape: { colorId: 'x', finish: 'matte' } }),
		).toBe(false);
		expect(isDesignDocument({ ...base, grommets: null })).toBe(false);
	});

	it('upgrades v5 to v6 with default grommets and no tape', () => {
		const v5 = toV5();
		expect(isDesignDocumentV5(v5)).toBe(true);
		expect(isDesignDocumentV5({ ...v5, schemaVersion: 6 })).toBe(false);
		const v6: Record<string, unknown> = {
			...createDefaultDesign(),
			schemaVersion: 6,
			finishingTape: null,
		};
		delete v6['shaftExtendsHead'];
		expect(upgradeV5ToV6(v5)).toEqual(v6);
		expect(upgradeDesignDocument(v5)?.grommets).toEqual(DEFAULT_GROMMETS);
	});
});

describe('trim commands and labels', () => {
	it('sets grommets and tape and skips identical values', () => {
		const base = createDefaultDesign();
		expect(
			setGrommetsCommand({ grommets: { ...base.grommets } }).apply({ document: base }),
		).toBe(base);
		expect(
			setFinishingTapeCommand({ finishingTape: { ...DEFAULT_FINISHING_TAPE } }).apply({
				document: base,
			}),
		).toBe(base);
		expect(
			setGrommetsCommand({ grommets: { colorId: 'red', finish: 'matte' } }).apply({
				document: base,
			}).grommets,
		).toEqual({ colorId: 'red', finish: 'matte' });
		expect(
			setFinishingTapeCommand({ finishingTape: null }).apply({ document: base })
				.finishingTape,
		).toBeNull();
	});

	it('describes trims', () => {
		expect(describeTrim({ trim: null })).toBe('—');
		expect(describeTrim({ trim: DEFAULT_GROMMETS })).toBe('Black · matte');
		expect(describeTrim({ trim: { colorId: 'x', finish: 'matte' } })).toBe(' · matte');
	});
});

describe('GrommetsEditor', () => {
	it('changes grommet color and finish', async () => {
		const user = userEvent.setup();
		render(<GrommetsEditor />);

		await user.click(screen.getByRole('radio', { name: 'Gold' }));
		await user.click(screen.getByRole('radio', { name: 'Matte' }));

		expect(document().grommets).toEqual({ colorId: 'gold', finish: 'matte' });
	});
});

describe('FinishingTapeEditor', () => {
	it('recolors, refinishes, removes and adds the tape back', async () => {
		const user = userEvent.setup();
		render(<FinishingTapeEditor />);

		expect(screen.getByRole('radio', { name: 'White' })).toBeChecked();
		await user.click(screen.getByRole('radio', { name: 'Gloss' }));
		expect(document().finishingTape).toEqual({ colorId: 'white', finish: 'gloss' });

		await user.click(screen.getByRole('radio', { name: 'None' }));
		expect(document().finishingTape).toBeNull();
		expect(screen.queryByRole('group', { name: 'Finish' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Red' }));
		expect(document().finishingTape).toEqual({ colorId: 'red', finish: 'matte' });
	});
});
