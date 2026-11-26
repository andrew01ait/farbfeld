import release from '../../../../../public/version.json';

const sources = import.meta.glob('/public/game/**/*.{js,css}', { query: '?raw', import: 'default' });
const prefix = `/diagnose/assets/${release.version}/`;

export async function GET(request: Request) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith(prefix)) return new Response('Bitte die Diagnose neu öffnen.', { status: 404 });
  const name = path.slice(prefix.length);
  const source = await sources[`/public/game/${name}`]?.();
  if (typeof source !== 'string') return new Response('Datei nicht gefunden.', { status: 404 });
  const media = name.endsWith('.css') ? 'text/css' : 'text/javascript';
  return new Response(source, {
    headers: {
      'Content-Type': `${media}; charset=utf-8`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
