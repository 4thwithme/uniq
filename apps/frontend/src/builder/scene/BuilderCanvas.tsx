import { ContactShadows, Grid, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { CAMERA_LIMITS } from '@builder/controls/camera-moves';
import { CAMERA_VIEWS } from '@builder/controls/camera-views';
import { CameraFocusControls } from '@builder/controls/CameraFocusControls';
import { WasdControls } from '@builder/controls/WasdControls';
import { LIGHTING_PRESETS } from '@builder/lighting/lighting-presets';
import { Racket } from '@builder/models/Racket';
import { SceneLighting } from '@builder/scene/SceneLighting';
import { useDesignStore } from '@builder/store/design-store';

import type { CameraFocus } from '@builder/controls/camera-views';
import type { PrintImage, StickerImages } from '@builder/decor/surface-painter';
import type { LightingPresetId } from '@builder/lighting/lighting-presets';
import type { SceneColors } from '@pages/builder/scene-colors';

const CAMERA_POSITION = CAMERA_VIEWS.overview.position;
const CAMERA_TARGET = CAMERA_VIEWS.overview.target;
const FLOOR_Y = -0.8;

interface BuilderCanvasProps {
	colors: SceneColors;
	printImage: PrintImage | null;
	stickerImages?: StickerImages | undefined;
	focus: CameraFocus;
	lighting: LightingPresetId;
	isLightingAnimated: boolean;
}

export function BuilderCanvas({
	colors,
	printImage,
	stickerImages,
	focus,
	lighting,
	isLightingAnimated,
}: BuilderCanvasProps): React.JSX.Element {
	const zones = useDesignStore((state) => state.document.zones);
	const overlays = useDesignStore((state) => state.document.overlays);
	const grip = useDesignStore((state) => state.document.grip);
	const buttCap = useDesignStore((state) => state.document.buttCap);
	const grommets = useDesignStore((state) => state.document.grommets);
	const logo = useDesignStore((state) => state.document.logo);
	const finishingTape = useDesignStore((state) => state.document.finishingTape);
	const layers = useDesignStore((state) => state.document.layers);

	return (
		<Canvas
			shadows
			dpr={[1, 2]}
			camera={{ position: CAMERA_POSITION, fov: 40, near: 0.005, far: 50 }}
			frameloop="demand"
		>
			<SceneLighting
				presetId={lighting}
				baseBackground={colors.background}
				isAnimated={isLightingAnimated}
			/>
			<Suspense fallback={null}>
				<Racket
					zones={zones}
					grip={grip}
					buttCap={buttCap}
					grommets={grommets}
					finishingTape={finishingTape}
					overlays={overlays}
					layers={layers}
					printImage={printImage}
					stickerImages={stickerImages}
					logo={logo}
				/>
			</Suspense>
			<Grid
				position={[0, FLOOR_Y - 0.001, 0]}
				cellSize={0.05}
				cellThickness={0.8}
				cellColor={colors.gridCell}
				sectionSize={0.25}
				sectionThickness={1}
				sectionColor={colors.gridSection}
				fadeDistance={5}
				fadeStrength={1.2}
				infiniteGrid
			/>
			<ContactShadows
				position={[0, FLOOR_Y, 0]}
				opacity={LIGHTING_PRESETS[lighting].state.shadowOpacity}
				scale={2}
				blur={2.5}
				far={1}
			/>
			<OrbitControls
				target={CAMERA_TARGET}
				enablePan
				screenSpacePanning
				minDistance={CAMERA_LIMITS.minDistance}
				maxDistance={CAMERA_LIMITS.maxDistance}
				zoomSpeed={0.8}
				maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
				makeDefault
			/>
			<WasdControls />
			<CameraFocusControls focus={focus} />
		</Canvas>
	);
}
