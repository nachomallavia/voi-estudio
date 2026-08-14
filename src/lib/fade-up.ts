import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FROM = { autoAlpha: 0, y: 24 };
const TO = { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' } as const;
const DETAIL_SELECTOR = '.project-detail [data-fade-up]';

let mm: gsap.MatchMedia | null = null;
let detailTriggers: ScrollTrigger[] = [];
let started = false;

function scroller() {
	return document.querySelector('main') ?? undefined;
}

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pageFadeEls() {
	return [...document.querySelectorAll<HTMLElement>('[data-fade-up]')].filter(
		(el) => !el.closest('.project-detail') && !el.matches('.project-carousel'),
	);
}

function detailFadeEls() {
	return [
		...document.querySelectorAll<HTMLElement>(
			'.project-carousel[data-expanded="true"] [data-detail]:not([hidden]) [data-fade-up]',
		),
	];
}

function fadeTo(targets: gsap.TweenTarget, extra?: gsap.TweenVars) {
	return gsap.fromTo(targets, FROM, { ...TO, ...extra });
}

function resetDetailStyles() {
	const items = document.querySelectorAll(DETAIL_SELECTOR);
	if (!items.length) return;
	gsap.killTweensOf(items);
	if (prefersReducedMotion()) {
		gsap.set(items, { autoAlpha: 1, y: 0 });
		return;
	}
	gsap.set(items, { clearProps: 'opacity,visibility,transform' });
}

function killDetailTriggers() {
	for (const trigger of detailTriggers) trigger.kill();
	detailTriggers = [];
}

function teardown() {
	mm?.revert();
	mm = null;
	resetDetailFadeUp();
}

function parallaxDistance(el: HTMLElement) {
	const raw = Number(el.dataset.parallax);
	if (!Number.isFinite(raw) || raw === 0) return window.innerHeight * 0.45;
	if (Math.abs(raw) <= 1) return raw * window.innerHeight;
	return raw;
}

function bindParallax() {
	const scrollRoot = scroller();
	if (!scrollRoot) return;

	const els = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].filter(
		(el) => getComputedStyle(el).display !== 'none',
	);

	for (const el of els) {
		gsap.to(el, {
			y: () => parallaxDistance(el),
			ease: 'none',
			scrollTrigger: {
				scroller: scrollRoot,
				trigger: scrollRoot.firstElementChild ?? scrollRoot,
				start: 'top top',
				end: 'max',
				scrub: 0.4,
				invalidateOnRefresh: true,
			},
		});
	}
}

function bindDetailFadeUp() {
	killDetailTriggers();
	resetDetailStyles();

	const items = detailFadeEls();
	if (!items.length) return;

	if (prefersReducedMotion()) {
		gsap.set(items, { autoAlpha: 1, y: 0 });
		return;
	}

	gsap.set(items, FROM);
	detailTriggers = ScrollTrigger.batch(items, {
		scroller: scroller(),
		start: 'top 90%',
		once: true,
		onEnter: (batch) => fadeTo(batch, { stagger: 0.08, overwrite: true }),
	});

	ScrollTrigger.refresh();
}

function initFadeUp() {
	teardown();

	const pages = pageFadeEls();
	const hasDetails = document.querySelector(DETAIL_SELECTOR);
	const hasParallax = document.querySelector('[data-parallax]');
	const hasCarousel = document.querySelector('.project-carousel[data-fade-up]');
	if (!pages.length && !hasDetails && !hasParallax && !hasCarousel) return;

	mm = gsap.matchMedia();
	mm.add(
		{
			isDesktop: '(min-width: 1024px)',
			isMobile: '(max-width: 1023px)',
			reduceMotion: '(prefers-reduced-motion: reduce)',
		},
		(context) => {
			const { isDesktop, isMobile, reduceMotion } = context.conditions ?? {};

			if (reduceMotion) {
				gsap.set('[data-fade-up]', { autoAlpha: 1, y: 0 });
				gsap.set('[data-parallax]', { y: 0 });
				return;
			}

			const carousel = document.querySelector<HTMLElement>('.project-carousel[data-fade-up]');
			if (carousel) {
				fadeTo(carousel, { clearProps: 'transform' });
			}

			const items = pageFadeEls();
			if (items.length && isDesktop) {
				fadeTo(items, { stagger: { amount: 0.6 } });
			}

			if (items.length && isMobile) {
				gsap.set(items, FROM);
				ScrollTrigger.batch(items, {
					scroller: scroller(),
					start: 'top 90%',
					once: true,
					onEnter: (batch) => fadeTo(batch, { stagger: 0.08, overwrite: true }),
				});
			}

			bindParallax();
			bindDetailFadeUp();

			return () => {
				killDetailTriggers();
			};
		},
	);
}

export function refreshFadeUp() {
	if (prefersReducedMotion()) {
		gsap.set('[data-fade-up]', { autoAlpha: 1, y: 0 });
		return;
	}
	bindDetailFadeUp();
}

export function killDetailFadeUp() {
	killDetailTriggers();
}

export function resetDetailFadeUp() {
	killDetailTriggers();
	resetDetailStyles();
}

export function startFadeUp() {
	if (started) return;
	started = true;
	initFadeUp();
	document.addEventListener('astro:page-load', initFadeUp);
	document.addEventListener('astro:before-swap', teardown);
}
