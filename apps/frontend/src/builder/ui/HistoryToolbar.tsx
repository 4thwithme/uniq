import { useDesignStore } from '@builder/store/design-store';

import { IconButton } from '@components/IconButton/IconButton';
import { RedoIcon, UndoIcon } from '@components/icons/Icons';

interface HistoryToolbarProps {
	className?: string | undefined;
}

export function HistoryToolbar({ className }: HistoryToolbarProps): React.JSX.Element {
	const canUndo = useDesignStore((state) => state.past.length > 0);
	const canRedo = useDesignStore((state) => state.future.length > 0);
	const undo = useDesignStore((state) => state.undo);
	const redo = useDesignStore((state) => state.redo);

	return (
		<div className={className} role="toolbar" aria-label="History">
			<IconButton
				label="Undo"
				onClick={undo}
				disabled={!canUndo}
				aria-keyshortcuts="Control+Z Meta+Z"
			>
				<UndoIcon />
			</IconButton>
			<IconButton
				label="Redo"
				onClick={redo}
				disabled={!canRedo}
				aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
			>
				<RedoIcon />
			</IconButton>
		</div>
	);
}
