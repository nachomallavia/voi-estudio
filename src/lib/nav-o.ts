const Y1 = 1434;
const fy = (y: number) => Y1 - y;

export const NAV_O_HEIGHT = 1434;
export const NAV_O_EM = 2048;
export const NAV_O_COMPACT_ADVANCE = 1167;

export type NavOChars = 1 | 2 | 3 | 4 | 5;

export function navOAdvance(chars: NavOChars) {
	return NAV_O_COMPACT_ADVANCE * chars;
}

function oPath(extra: number): string {
	const x0 = 199;
	const x1 = 969 + extra;
	const c = 198;
	const xr = (value: number, right: boolean) => (right ? value + extra : value);

	const outer = [
		`M${x0 + c} ${fy(1434)}`,
		`H${x1 - c}`,
		`L${x1} ${fy(1237)}`,
		`V${fy(195)}`,
		`L${x1 - c} ${fy(0)}`,
		`H${x0 + c}`,
		`L${x0} ${fy(195)}`,
		`V${fy(1237)}`,
		'Z',
	].join('');

	const inner = [
		`M${xr(371, false)} ${fy(238)}`,
		`L${xr(436, false)} ${fy(172)}`,
		`Q${xr(456, false)} ${fy(152)} ${xr(485, false)} ${fy(152)}`,
		`H${xr(682, true)}`,
		`Q${xr(711, true)} ${fy(152)} ${xr(731, true)} ${fy(172)}`,
		`L${xr(797, true)} ${fy(238)}`,
		`Q${xr(817, true)} ${fy(258)} ${xr(817, true)} ${fy(287)}`,
		`V${fy(1145)}`,
		`Q${xr(817, true)} ${fy(1174)} ${xr(797, true)} ${fy(1194)}`,
		`L${xr(731, true)} ${fy(1262)}`,
		`Q${xr(711, true)} ${fy(1282)} ${xr(682, true)} ${fy(1282)}`,
		`H${xr(485, false)}`,
		`Q${xr(456, false)} ${fy(1282)} ${xr(436, false)} ${fy(1262)}`,
		`L${xr(371, false)} ${fy(1194)}`,
		`Q${xr(350, false)} ${fy(1173)} ${xr(350, false)} ${fy(1145)}`,
		`V${fy(287)}`,
		`Q${xr(350, false)} ${fy(259)} ${xr(371, false)} ${fy(238)}`,
		'Z',
	].join('');

	return outer + inner;
}

export function navOPath(chars: NavOChars) {
	return oPath(navOAdvance(chars) - NAV_O_COMPACT_ADVANCE);
}

export const NAV_O_COMPACT = navOPath(1);

export function navOEm(advance: number) {
	return `${advance / NAV_O_EM}em`;
}
