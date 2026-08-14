import type { APIRoute } from 'astro';
import { RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';

export const prerender = false;

const FROM = 'VOI Estudio <contacto@nachomallavia.com>';
// const TO = 'info@voi-estudio.com.ar';
const TO = 'nachomallavia@gmail.com';

const MAX_NOMBRE = 120;
const MAX_EMAIL = 254;
const MAX_MENSAJE = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactoBody = {
	nombre?: unknown;
	email?: unknown;
	mensaje?: unknown;
};

function json(status: number, payload: { ok: boolean; error?: string }) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function readString(value: unknown, max: number) {
	if (typeof value !== 'string') return '';
	return value.trim().slice(0, max);
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

export const POST: APIRoute = async ({ request }) => {
	if (!RESEND_API_KEY) {
		return json(500, { ok: false, error: 'El envío no está configurado.' });
	}

	let body: ContactoBody;
	try {
		body = await request.json();
	} catch {
		return json(400, { ok: false, error: 'Pedido inválido.' });
	}

	const nombre = readString(body.nombre, MAX_NOMBRE);
	const email = readString(body.email, MAX_EMAIL);
	const mensaje = readString(body.mensaje, MAX_MENSAJE);

	if (!nombre || !email || !mensaje || !EMAIL_PATTERN.test(email)) {
		return json(400, { ok: false, error: 'Completá nombre, mail y mensaje.' });
	}

	const resend = new Resend(RESEND_API_KEY);
	const safeNombre = escapeHtml(nombre);
	const safeEmail = escapeHtml(email);
	const safeMensaje = escapeHtml(mensaje).replaceAll('\n', '<br>');

	const { error } = await resend.emails.send({
		from: FROM,
		to: TO,
		replyTo: email,
		subject: `Contacto — ${nombre}`,
		text: `Nombre: ${nombre}\nE-mail: ${email}\n\n${mensaje}`,
		html: `
			<p><strong>Nombre:</strong> ${safeNombre}</p>
			<p><strong>E-mail:</strong> ${safeEmail}</p>
			<p>${safeMensaje}</p>
		`,
	});

	if (error) {
		console.error('Resend error:', error.message);
		return json(502, { ok: false, error: 'No se pudo enviar. Probá de nuevo.' });
	}

	return json(200, { ok: true });
};
