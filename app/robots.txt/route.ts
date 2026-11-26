import { publicSiteUrl } from "../../lib/public-site";

export function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /diagnose/assets/

Sitemap: ${publicSiteUrl}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
