let pendingScrollTop: number | null = null;
let started = false;

function getMain() {
	return document.querySelector('main');
}

function saveScroll() {
	pendingScrollTop = getMain()?.scrollTop ?? 0;
}

function restoreScroll() {
	const main = getMain();
	if (!main || pendingScrollTop == null) return;
	const max = Math.max(0, main.scrollHeight - main.clientHeight);
	main.scrollTop = Math.min(pendingScrollTop, max);
}

export function startScrollPersist() {
	if (started) return;
	started = true;
	document.addEventListener('astro:before-swap', saveScroll);
	document.addEventListener('astro:after-swap', restoreScroll);
}
