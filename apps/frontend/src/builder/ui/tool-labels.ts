import type { BuilderTool, FrameOption, HandleOption } from '@builder/store/design-store';

export const HANDLE_OPTION_LABELS: Readonly<Record<HandleOption, string>> = {
	grip: 'Grip',
	overgrip: 'Overgrip',
	tape: 'Finishing tape',
};

export const FRAME_OPTION_LABELS: Readonly<Record<FrameOption, string>> = {
	color: 'Color',
	print: 'Print',
	objects: 'Objects',
	logo: 'HEAD logo',
	grommets: 'Grommets',
};

export const getToolsTitle = ({ tool }: { tool: BuilderTool }): string => {
	switch (tool.step) {
		case 'buttCap':
			return 'Grip Cap';
		case 'handle':
			return `Handle · ${HANDLE_OPTION_LABELS[tool.handleOption]}`;
		case 'frame':
			return `Frame · ${FRAME_OPTION_LABELS[tool.frameOption]}`;
	}
};
