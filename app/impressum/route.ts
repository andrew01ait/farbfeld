import { env } from "cloudflare:workers";

const cookieName = "farbfeld_imprint";
const tokenPattern = /^[a-f0-9-]{36}$/;
const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, nosnippet",
  "Referrer-Policy": "same-origin",
};

type Contact = { email: string; phone: string };

function getContact(): Contact | undefined {
  try {
    const { email, phone } = JSON.parse(env.FARBFELD_IMPRINT_CONTACT ?? "{}");
    if (
      typeof email === "string" && /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(email) &&
      typeof phone === "string" && /^\+[1-9]\d{6,14}$/.test(phone)
    ) {
      return { email, phone };
    }
  } catch {
    return undefined;
  }
}

function getToken(request: Request) {
  const cookie = request.headers.get("cookie")?.split("; ").find((value) => value.startsWith(cookieName + "="));
  const token = cookie?.slice(cookieName.length + 1);
  return token && tokenPattern.test(token) ? token : undefined;
}

function renderImprint(request: Request, status = 200, message = "", contact?: Contact) {
  const savedToken = getToken(request);
  const token = savedToken ?? crypto.randomUUID();
  const responseHeaders = new Headers(headers);
  if (!savedToken) {
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    responseHeaders.set("Set-Cookie", `${cookieName}=${token}; Path=/impressum; Max-Age=900; HttpOnly; SameSite=Strict${secure}`);
  }

  const contactDetails = contact
    ? `<address data-nosnippet>
        <div>Telefon <a href="tel:${contact.phone}">${contact.phone.replace(/^(\+43)(\d{3})(\d+)$/, "$1 $2 $3")}</a></div>
        <div>E-Mail <a href="mailto:${contact.email}">${contact.email}</a></div>
      </address>`
    : `<p>Telefon und E-Mail werden zum Schutz vor automatischem Auslesen erst nach einem Klick angezeigt.</p>
      ${message ? `<p class="imprint-error" role="alert">${message}</p>` : ""}
      <form action="/impressum" method="post">
        <input type="hidden" name="token" value="${token}">
        <button class="site-button site-button-primary" type="submit">Kontaktdaten anzeigen</button>
      </form>`;

  return new Response(`<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, nosnippet">
  <title>Impressum · Farbfeld</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/landing.css">
</head>
<body>
  <a class="skip-link" href="#inhalt">Zum Inhalt</a>
  <header class="site-header">
    <div class="site-width site-nav">
      <a class="site-brand" href="/" aria-label="Farbfeld Startseite"><img src="/icon.svg" width="42" height="42" alt="">Farbfeld</a>
      <a class="site-button site-button-outline" href="/play">Spiel öffnen</a>
    </div>
  </header>
  <main class="site-width imprint-main" id="inhalt">
    <h1>Impressum</h1>
    <div class="imprint-card">
      <h2>Medieninhaber</h2>
      <p><strong>Andrew Lindley</strong><br>Wien, Österreich</p>
      <p class="imprint-description">Farbfeld ist eine persönliche Umsetzung nach „Noch mal!“. Die Spielidee stammt von Inka und Markus Brand und erschien bei Schmidt Spiele.</p>
      <section class="imprint-contact" aria-labelledby="kontakt">
        <h2 id="kontakt">Kontakt</h2>
        ${contactDetails}
      </section>
    </div>
  </main>
  <footer class="site-width site-footer">
    <a class="site-link" href="/">Zur Farbfeld-Startseite</a>
  </footer>
</body>
</html>`, { status, headers: responseHeaders });
}

export function GET(request: Request) {
  return renderImprint(request);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const sameOrigin = origin
    ? origin === new URL(request.url).origin
    : fetchSite === "same-origin";
  if (!sameOrigin || !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
    return renderImprint(request, 403, "Bitte öffne das Impressum und klicke erneut auf „Kontaktdaten anzeigen“.");
  }

  const token = getToken(request);
  const form = await request.formData().catch(() => null);
  if (!token || form?.get("token") !== token) {
    return renderImprint(request, 400, "Die Anfrage ist abgelaufen. Bitte klicke erneut auf „Kontaktdaten anzeigen“.");
  }

  const contact = getContact();
  return contact
    ? renderImprint(request, 200, "", contact)
    : renderImprint(request, 503, "Die Kontaktdaten sind gerade nicht verfügbar. Bitte versuche es später erneut.");
}
