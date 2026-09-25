// Sesión portable: una cookie firmada con HMAC-SHA256.
//
// Sustituye a la identidad que inyectaba la plataforma de ChatGPT Sites por
// cabeceras. Aquella sólo era segura porque el proxy de la plataforma las
// ponía y las limpiaba; fuera de ahí, cualquiera podía enviarlas y hacerse
// pasar por otro. Aquí el navegador guarda un texto que sólo el servidor sabe
// firmar, así que no se puede fabricar sin el secreto.
//
// No depende de bindings de Cloudflare ni de ningún proveedor: sólo WebCrypto,
// que existe igual en Workers y en Node.

export const SESSION_COOKIE = 'zanja_sesion';
export const SESSION_DAYS = 180;

export type Session = { uid: string; name: string; exp: number };

const bytes = new TextEncoder();

const toBase64Url = (raw: Uint8Array) => {
  let text = '';
  for (const byte of raw) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const full = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  return Uint8Array.from(atob(full), c => c.charCodeAt(0));
};

const hmacKey = (secret: string) =>
  crypto.subtle.importKey('raw', bytes.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

/** Firma la sesión. El resultado es `cuerpo.firma`, ambos en base64url. */
export async function signSession(session: Session, secret: string): Promise<string> {
  const body = toBase64Url(bytes.encode(JSON.stringify(session)));
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(secret), bytes.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(mac))}`;
}

/** Devuelve la sesión sólo si la firma es válida y no ha caducado. */
export async function verifySession(token: string | null, secret: string): Promise<Session | null> {
  if (!token) return null;
  const cut = token.indexOf('.');
  if (cut < 1) return null;
  const body = token.slice(0, cut);
  try {
    const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromBase64Url(token.slice(cut + 1)), bytes.encode(body));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Session;
    if (typeof session?.uid !== 'string' || typeof session?.name !== 'string') return null;
    if (!(session.exp > Date.now())) return null;
    return session;
  } catch {
    return null;
  }
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

/** HttpOnly para que el JavaScript de la página no pueda leerla ni robarla. */
export function sessionCookie(req: Request, value: string, seconds: number): string {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure}`;
}

/**
 * El identificador se deriva del nombre y del secreto, así que la misma
 * persona vuelve a entrar como sí misma desde otro dispositivo, y el id no se
 * puede calcular desde fuera.
 */
export async function userIdFor(name: string, secret: string): Promise<string> {
  const normalized = name.trim().toLocaleLowerCase('es');
  const digest = await crypto.subtle.digest('SHA-256', bytes.encode(`${secret}\n${normalized}`));
  return 'u_' + [...new Uint8Array(digest).slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const NAME_MIN = 2;
export const NAME_MAX = 24;

/** Nombre visible: letras, números, espacios y guiones. Nada de HTML ni control. */
export function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < NAME_MIN || name.length > NAME_MAX) return null;
  if (!/^[\p{L}\p{N} .'\-]+$/u.test(name)) return null;
  return name;
}
