import { FINISHES } from '@uniq/shared';

import { setZoneFinishCommand } from '@builder/design/design-commands';
import { FINISH_LABELS } from '@builder/design/zone-labels';
import { useDesignStore } from '@builder/store/design-store';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';

import type { ZoneId } from '@uniq/shared';

const FINISH_OPTIONS = FINISHES.map((finish) => ({
	value: finish,
	label: FINISH_LABELS[finish],
}));

export function FinishPicker({ zoneId }: { zoneId: ZoneId }): React.JSX.Element {
	const finish = useDesignStore((state) => state.document.zones[zoneId].finish);
	const execute = useDesignStore((state) => state.execute);

	return (
		<SegmentedControl
			legend="Finish"
			name={`finish-${zoneId}`}
			options={FINISH_OPTIONS}
			value={finish}
			onChange={({ value }) => {
				execute({ command: setZoneFinishCommand({ zoneId, finish: value }) });
			}}
		/>
	);
}
