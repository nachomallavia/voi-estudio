import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const proyectos = defineCollection({
	loader: glob({
		base: './src/content/proyectos',
		pattern: '**/index.md',
		generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
	}),
	schema: z.object({
		code: z.string(),
		category: z.string(),
		locality: z.string(),
		region: z.string(),
		order: z.number(),
		/** Superficie en m² */
		mts: z.number(),
		/** Path relative to the entry folder, e.g. `./cover.jpg` */
		cover: z.string(),
		coverAlt: z.string(),
		/** Nav/logo ink when project is expanded: dark = voi-black, light = voi-white */
		navTheme: z.enum(['light', 'dark']).default('dark'),
	}),
});

export const collections = { proyectos };
