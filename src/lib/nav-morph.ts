import gsap from 'gsap';
import MorphSVGPlugin from 'gsap/MorphSVGPlugin';
import { NAV_O_HEIGHT, navOEm } from './nav-o';

gsap.registerPlugin(MorphSVGPlugin);

const DURATION = 0.4;
const EASE = 'power2.inOut';

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function targetAdvance(path: SVGPathElement, stretched: boolean) {
	const raw = stretched ? path.dataset.advanceStretched : path.dataset.advanceCompact;
	return Number(raw);
}

export function setNavOShape(path: SVGPathElement, stretched: boolean) {
	const d = stretched ? path.dataset.stretched : path.dataset.compact;
	const advance = targetAdvance(path, stretched);
	const svg = path.ownerSVGElement;
	if (!d || !svg || !advance) return;

	gsap.killTweensOf([path, svg]);
	path.setAttribute('d', d);
	svg.setAttribute('viewBox', `0 0 ${advance} ${NAV_O_HEIGHT}`);
	svg.setAttribute('width', navOEm(advance));
}

export function morphNavO(path: SVGPathElement, stretched: boolean) {
	const d = stretched ? path.dataset.stretched : path.dataset.compact;
	const advance = targetAdvance(path, stretched);
	const svg = path.ownerSVGElement;
	if (!d || !svg || !advance) return;

	if (prefersReducedMotion()) {
		setNavOShape(path, stretched);
		return;
	}

	gsap.to(path, {
		duration: DURATION,
		ease: EASE,
		morphSVG: d,
		overwrite: true,
	});
	gsap.to(svg, {
		duration: DURATION,
		ease: EASE,
		attr: { viewBox: `0 0 ${advance} ${NAV_O_HEIGHT}` },
		width: navOEm(advance),
		overwrite: true,
	});
}

export function syncNavOs(link: HTMLElement, stretched: boolean, animate: boolean) {
	const paths = link.querySelectorAll<SVGPathElement>('[data-nav-o-path]');
	for (const path of paths) {
		if (animate) morphNavO(path, stretched);
		else setNavOShape(path, stretched);
	}
}
