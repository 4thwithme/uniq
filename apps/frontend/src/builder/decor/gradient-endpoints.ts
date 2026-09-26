export const getGradientEndpointsForRect = ({
	angle,
	width,
	height,
}: {
	angle: number;
	width: number;
	height: number;
}): [number, number, number, number] => {
	const radians = (angle * Math.PI) / 180;
	const dx = (Math.cos(radians) * width) / 2;
	const dy = (Math.sin(radians) * height) / 2;
	const cx = width / 2;
	const cy = height / 2;

	return [cx - dx, cy - dy, cx + dx, cy + dy];
};
