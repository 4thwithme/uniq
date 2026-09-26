import type { StickerId } from '@uniq/shared';

export type StickerCategory = 'flowers' | 'fruits' | 'animals' | 'legends' | 'cities';

export interface StickerDefinition {
	id: StickerId;
	label: string;
	category: StickerCategory;
	aspect: number;
	source: 'fluent' | 'uniq';
}

export const STICKERS: readonly StickerDefinition[] = [
	{ id: 'rose', label: 'Rose', category: 'flowers', aspect: 1, source: 'fluent' },
	{ id: 'hibiscus', label: 'Hibiscus', category: 'flowers', aspect: 1, source: 'fluent' },
	{
		id: 'sunflower',
		label: 'Sunflower',
		category: 'flowers',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'tulip', label: 'Tulip', category: 'flowers', aspect: 1, source: 'fluent' },
	{
		id: 'cherry-blossom',
		label: 'Cherry blossom',
		category: 'flowers',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'lotus', label: 'Lotus', category: 'flowers', aspect: 1, source: 'fluent' },
	{ id: 'blossom', label: 'Blossom', category: 'flowers', aspect: 1, source: 'fluent' },
	{
		id: 'maple-leaf',
		label: 'Maple leaf',
		category: 'flowers',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'cherries', label: 'Cherries', category: 'fruits', aspect: 1, source: 'fluent' },
	{
		id: 'strawberry',
		label: 'Strawberry',
		category: 'fruits',
		aspect: 1,
		source: 'fluent',
	},
	{
		id: 'watermelon',
		label: 'Watermelon',
		category: 'fruits',
		aspect: 1,
		source: 'fluent',
	},
	{
		id: 'pineapple',
		label: 'Pineapple',
		category: 'fruits',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'lemon', label: 'Lemon', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'peach', label: 'Peach', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'grapes', label: 'Grapes', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'banana', label: 'Banana', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'mango', label: 'Mango', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'avocado', label: 'Avocado', category: 'fruits', aspect: 1, source: 'fluent' },
	{
		id: 'hot-pepper',
		label: 'Hot pepper',
		category: 'fruits',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'coconut', label: 'Coconut', category: 'fruits', aspect: 1, source: 'fluent' },
	{ id: 'tiger', label: 'Tiger', category: 'animals', aspect: 1, source: 'fluent' },
	{
		id: 'tiger-face',
		label: 'Tiger face',
		category: 'animals',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'lion', label: 'Lion', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'wolf', label: 'Wolf', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'fox', label: 'Fox', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'eagle', label: 'Eagle', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'panda', label: 'Panda', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'leopard', label: 'Leopard', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'shark', label: 'Shark', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'dolphin', label: 'Dolphin', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'octopus', label: 'Octopus', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'parrot', label: 'Parrot', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'peacock', label: 'Peacock', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'flamingo', label: 'Flamingo', category: 'animals', aspect: 1, source: 'fluent' },
	{
		id: 'butterfly',
		label: 'Butterfly',
		category: 'animals',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'owl', label: 'Owl', category: 'animals', aspect: 1, source: 'fluent' },
	{ id: 'snake', label: 'Snake', category: 'animals', aspect: 1, source: 'fluent' },
	{
		id: 'horse-face',
		label: 'Horse face',
		category: 'animals',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'dragon', label: 'Dragon', category: 'legends', aspect: 1, source: 'fluent' },
	{
		id: 'dragon-face',
		label: 'Dragon face',
		category: 'legends',
		aspect: 1,
		source: 'fluent',
	},
	{
		id: 'phoenix',
		label: 'Phoenix bird',
		category: 'legends',
		aspect: 1,
		source: 'fluent',
	},
	{ id: 'unicorn', label: 'Unicorn', category: 'legends', aspect: 1, source: 'fluent' },
	{ id: 'fire', label: 'Fire', category: 'legends', aspect: 1, source: 'fluent' },
	{ id: 'crown', label: 'Crown', category: 'legends', aspect: 1, source: 'fluent' },
	{ id: 'skull', label: 'Skull', category: 'legends', aspect: 1, source: 'fluent' },
	{ id: 'sparkles', label: 'Sparkles', category: 'legends', aspect: 1, source: 'fluent' },
	{ id: 'rainbow', label: 'Rainbow', category: 'legends', aspect: 1, source: 'fluent' },
	{
		id: 'tennis-ball',
		label: 'Tennis',
		category: 'legends',
		aspect: 1,
		source: 'fluent',
	},
	{
		id: 'city-paris',
		label: 'Paris',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-london',
		label: 'London',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-new-york',
		label: 'New York',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-tokyo',
		label: 'Tokyo',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-melbourne',
		label: 'Melbourne',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-barcelona',
		label: 'Barcelona',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-miami',
		label: 'Miami',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{ id: 'city-rome', label: 'Rome', category: 'cities', aspect: 3.3333, source: 'uniq' },
	{
		id: 'city-madrid',
		label: 'Madrid',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-dubai',
		label: 'Dubai',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{ id: 'city-kyiv', label: 'Kyiv', category: 'cities', aspect: 3.3333, source: 'uniq' },
	{
		id: 'city-vienna',
		label: 'Vienna',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-berlin',
		label: 'Berlin',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
	{
		id: 'city-monaco',
		label: 'Monaco',
		category: 'cities',
		aspect: 3.3333,
		source: 'uniq',
	},
];

export const STICKER_CATEGORIES: readonly { id: StickerCategory; label: string }[] = [
	{ id: 'flowers', label: 'Flowers' },
	{ id: 'fruits', label: 'Fruits' },
	{ id: 'animals', label: 'Animals' },
	{ id: 'legends', label: 'Legends' },
	{ id: 'cities', label: 'Cities' },
];

const BY_ID = new Map(STICKERS.map((sticker) => [sticker.id, sticker]));

export const findSticker = ({
	stickerId,
}: {
	stickerId: StickerId;
}): StickerDefinition | null => BY_ID.get(stickerId) ?? null;

export const getStickerUrl = ({ stickerId }: { stickerId: StickerId }): string =>
	`${import.meta.env.BASE_URL}stickers/${stickerId}.svg`;
