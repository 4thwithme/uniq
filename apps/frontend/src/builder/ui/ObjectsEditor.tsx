import { useState } from 'react';

import styles from '@builder/ui/BuilderPanel.module.scss';
import { LinesEditor } from '@builder/ui/LinesEditor';
import { ShapesEditor } from '@builder/ui/ShapesEditor';
import { StickersEditor } from '@builder/ui/StickersEditor';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';

import type { SegmentedOption } from '@components/SegmentedControl/SegmentedControl';

type ObjectTab = 'lines' | 'shapes' | 'stickers';

const TABS: readonly SegmentedOption<ObjectTab>[] = [
	{ value: 'lines', label: 'Lines' },
	{ value: 'shapes', label: 'Shapes' },
	{ value: 'stickers', label: 'Stickers' },
];

export function ObjectsEditor(): React.JSX.Element {
	const [tab, setTab] = useState<ObjectTab>('lines');

	return (
		<div className={styles.section}>
			<SegmentedControl
				legend="Objects"
				name="objects-tab"
				options={TABS}
				value={tab}
				onChange={({ value }) => {
					setTab(value);
				}}
			/>
			{tab === 'lines' ? <LinesEditor /> : null}
			{tab === 'shapes' ? <ShapesEditor /> : null}
			{tab === 'stickers' ? <StickersEditor /> : null}
		</div>
	);
}
