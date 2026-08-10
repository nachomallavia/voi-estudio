import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveProjectImage } from './project-images';

export type ProjectView = {
	id: string;
	data: Omit<CollectionEntry<'proyectos'>['data'], 'cover'> & {
		cover: ImageMetadata;
	};
};

export async function getProjects(): Promise<ProjectView[]> {
	const entries = (await getCollection('proyectos')).sort(
		(a, b) => a.data.order - b.data.order,
	);

	return entries.map((entry) => {
		const filePath = entry.filePath;
		if (!filePath) {
			throw new Error(`Project entry ${entry.id} is missing filePath`);
		}

		return {
			id: entry.id,
			data: {
				...entry.data,
				cover: resolveProjectImage(filePath, entry.data.cover),
			},
		};
	});
}
