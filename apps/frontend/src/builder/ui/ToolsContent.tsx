import { useDesignStore } from '@builder/store/design-store';
import { ButtCapEditor } from '@builder/ui/ButtCapEditor';
import { GripEditor, OvergripEditor } from '@builder/ui/GripEditor';
import { LogoEditor } from '@builder/ui/LogoEditor';
import { ObjectsEditor } from '@builder/ui/ObjectsEditor';
import { PaintPanel } from '@builder/ui/PaintPanel';
import { PrintEditor } from '@builder/ui/PrintEditor';
import { FinishingTapeEditor, GrommetsEditor } from '@builder/ui/TrimEditors';

import type { PrintImageStatus } from '@builder/prints/usePrintImage';

export function ToolsContent({
	printStatus,
}: {
	printStatus: PrintImageStatus;
}): React.JSX.Element {
	const tool = useDesignStore((state) => state.tool);

	if (tool.step === 'buttCap') {
		return <ButtCapEditor />;
	}
	if (tool.step === 'handle') {
		switch (tool.handleOption) {
			case 'grip':
				return <GripEditor />;
			case 'overgrip':
				return <OvergripEditor />;
			case 'tape':
				return <FinishingTapeEditor />;
		}
	}
	switch (tool.frameOption) {
		case 'color':
			return <PaintPanel zoneId="frame" />;
		case 'print':
			return <PrintEditor status={printStatus} />;
		case 'objects':
			return <ObjectsEditor />;
		case 'logo':
			return <LogoEditor />;
		case 'grommets':
			return <GrommetsEditor />;
	}
}
