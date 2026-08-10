import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
	'/src/content/proyectos/**/*.{jpg,jpeg,png,webp}',
	{ eager: true },
);

/** Resolve a frontmatter-relative image path against a content entry file. */
export function resolveProjectImage(entryFilePath: string, relativePath: string): ImageMetadata {
	const dir = entryFilePath.replace(/\/[^/]+$/, '');
	const cleaned = relativePath.replace(/^\.\//, '');
	const key = `/${dir}/${cleaned}`;
	const mod = modules[key];
	if (!mod) {
		throw new Error(`Missing project image: ${key}`);
	}
	return mod.default;
}
