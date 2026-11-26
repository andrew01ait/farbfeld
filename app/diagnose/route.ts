import html from '../../public/play.html?raw';
import release from '../../public/version.json';

const assets = `/diagnose/assets/${release.version}`;
const diagnose = html
  .replace(/<link rel="manifest"[^>]*>/, '')
  .replace('<body data-farbfeld-app=', '<body data-animation-diagnose data-farbfeld-app=')
  .replace('/game/style.css', `${assets}/style.css`)
  .replace('/game/app.js', `${assets}/app.js`);

export function GET() {
  return new Response(diagnose, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
