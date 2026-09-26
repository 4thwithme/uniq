import { lazy, Suspense, useMemo, useState } from 'react';

import { prefersReducedMotion } from '@app/view-transition';

import styles from '@pages/builder/BuilderPage.module.scss';
import { readSceneColors } from '@pages/builder/scene-colors';

import { useDesignAutosave } from '@builder/history/useDesignAutosave';
import { useHistoryShortcuts } from '@builder/history/useHistoryShortcuts';
import {
	LIGHTING_PRESET_IDS,
	LIGHTING_PRESETS,
} from '@builder/lighting/lighting-presets';
import { useLightingStore } from '@builder/lighting/lighting-store';
import { usePrintImage } from '@builder/prints/usePrintImage';
import { useStickerImages } from '@builder/stickers/useStickerImages';
import { useDesignStore } from '@builder/store/design-store';
import { HistoryToolbar } from '@builder/ui/HistoryToolbar';
import { CheckoutFooter, StepsNav } from '@builder/ui/StepsPanel';
import { getToolsTitle } from '@builder/ui/tool-labels';
import { ToolsContent } from '@builder/ui/ToolsContent';

import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon, SidebarIcon } from '@components/icons/Icons';
import { Kbd } from '@components/Kbd/Kbd';
import { LanguageSelect } from '@components/LanguageSelect/LanguageSelect';
import { Panel } from '@components/Panel/Panel';
import { Select } from '@components/Select/Select';
import { ThemeToggle } from '@components/ThemeToggle/ThemeToggle';

import { useMediaQuery } from '@hooks/useMediaQuery';

import { useLanguageStore } from '@store/language-store';
import { useThemeStore } from '@store/theme-store';

import type { CameraFocus } from '@builder/controls/camera-views';
import type { BuilderStep } from '@builder/store/design-store';

const BuilderCanvas = lazy(async () => {
	const module = await import('@builder/scene/BuilderCanvas');
	return { default: module.BuilderCanvas };
});

const TOOLS_ID = 'builder-tools';
// Matches the below-stacked breakpoint in _mixins.scss.
const MOBILE_QUERY = '(width <= 900px)';

const STEP_FOCUS: Readonly<Record<BuilderStep, CameraFocus>> = {
	frame: 'overview',
	handle: 'grip',
	buttCap: 'buttCap',
};
const STEPS_ID = 'builder-steps';

export function BuilderPage(): React.JSX.Element {
	useDesignAutosave();
	useHistoryShortcuts();
	const theme = useThemeStore((state) => state.theme);
	const language = useLanguageStore((state) => state.language);
	const sceneColors = useMemo(
		() => readSceneColors({ theme, language }),
		[theme, language],
	);
	const tool = useDesignStore((state) => state.tool);
	const printSource = useDesignStore(
		(state) => state.document.overlays.frame.print?.source ?? null,
	);
	const print = usePrintImage({ source: printSource });
	const layers = useDesignStore((state) => state.document.layers);
	const stickerIds = useMemo(
		() => layers.flatMap((layer) => (layer.kind === 'sticker' ? [layer.stickerId] : [])),
		[layers],
	);
	const stickerImages = useStickerImages({ stickerIds });
	const lighting = useLightingStore((state) => state.presetId);
	const setLighting = useLightingStore((state) => state.setPreset);
	const [isToolsOpen, setIsToolsOpen] = useState(true);
	const [isStepsOpen, setIsStepsOpen] = useState(true);
	const isMobile = useMediaQuery({ query: MOBILE_QUERY });
	const [isViewportMaximized, setIsViewportMaximized] = useState(false);
	const isViewportStatic = isMobile && !isViewportMaximized;
	const isViewportFullscreen = isMobile && isViewportMaximized;

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.brand}>
					<span className={styles.logo}>UNIQ</span>
					<span className={styles.divider} aria-hidden="true" />
					<h1 className={styles.title}>Make your HEAD unique</h1>
				</div>
				<div className={styles.headerActions}>
					<HistoryToolbar className={styles.toolbar} />
					<span className={styles.divider} aria-hidden="true" />
					<span className={styles.languageSelect}>
						<LanguageSelect />
					</span>
					<ThemeToggle />
				</div>
			</header>
			<div
				className={styles.workspace}
				data-tools-open={isToolsOpen}
				data-steps-open={isStepsOpen}
			>
				{isToolsOpen ? (
					<Panel title={getToolsTitle({ tool })} className={styles.toolsPanel}>
						<div
							id={TOOLS_ID}
							key={`${tool.step}:${tool.frameOption}`}
							className={styles.toolsContent}
						>
							<ToolsContent printStatus={print.status} />
						</div>
					</Panel>
				) : null}
				<section
					className={styles.viewport}
					data-maximized={isViewportFullscreen}
					aria-label="3D racket preview"
				>
					<div className={styles.canvasLayer} data-interactive={!isViewportStatic}>
						<Suspense fallback={<p className={styles.loading}>Loading 3D scene…</p>}>
							<BuilderCanvas
								colors={sceneColors}
								printImage={print.image}
								stickerImages={stickerImages}
								focus={STEP_FOCUS[tool.step]}
								lighting={lighting}
								isLightingAnimated={!prefersReducedMotion()}
								resizeSignal={`${Number(isViewportMaximized)}:${Number(isToolsOpen)}:${Number(isStepsOpen)}`}
							/>
						</Suspense>
					</div>
					{isViewportStatic ? (
						<button
							type="button"
							className={styles.expandOverlay}
							onClick={() => {
								setIsViewportMaximized(true);
							}}
						>
							<span className={styles.expandHint}>Tap to rotate</span>
						</button>
					) : null}
					<div className={styles.viewportBar}>
						{isViewportFullscreen ? (
							<IconButton
								label="Close"
								size="md"
								onClick={() => {
									setIsViewportMaximized(false);
								}}
							>
								<CloseIcon />
							</IconButton>
						) : (
							<IconButton
								label={isToolsOpen ? 'Hide tools' : 'Show tools'}
								size="sm"
								aria-pressed={isToolsOpen}
								aria-controls={TOOLS_ID}
								onClick={() => {
									setIsToolsOpen(!isToolsOpen);
								}}
							>
								<SidebarIcon className={styles.flipped} />
							</IconButton>
						)}
						<p className={styles.hints}>
							<span>Drag to rotate</span>
							<span>Scroll to zoom</span>
							<span>
								<Kbd>W</Kbd>
								<Kbd>A</Kbd>
								<Kbd>S</Kbd>
								<Kbd>D</Kbd> move · <Kbd>Q</Kbd>
								<Kbd>E</Kbd> down/up
							</span>
							<span>
								<Kbd>⌘</Kbd>
								<Kbd>Z</Kbd> undo
							</span>
						</p>
						<div className={styles.lighting}>
							<Select
								label="Light"
								isLabelHidden
								size="sm"
								align="end"
								options={LIGHTING_PRESET_IDS.map((id) => ({
									value: id,
									label: LIGHTING_PRESETS[id].label,
									description: LIGHTING_PRESETS[id].description,
								}))}
								value={lighting}
								onChange={({ value }) => {
									setLighting({ presetId: value });
								}}
							/>
						</div>
						{isViewportFullscreen ? null : (
							<IconButton
								label={isStepsOpen ? 'Hide steps' : 'Show steps'}
								size="sm"
								aria-pressed={isStepsOpen}
								aria-controls={STEPS_ID}
								onClick={() => {
									setIsStepsOpen(!isStepsOpen);
								}}
							>
								<SidebarIcon />
							</IconButton>
						)}
					</div>
				</section>
				{isStepsOpen ? (
					<Panel title="Steps" className={styles.stepsPanel} footer={<CheckoutFooter />}>
						<div id={STEPS_ID}>
							<StepsNav />
						</div>
					</Panel>
				) : null}
			</div>
		</div>
	);
}
