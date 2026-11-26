import type { Metadata } from "next";
import { publicSiteUrl } from "../lib/public-site";
import qrcode from "../public/game/vendor/qrcode.js";

const title = "Farbfeld – Würfelspiel online und offline spielen";
const description =
  "Würfle, kreuze Farbfelder an und sammle Punkte. Spiele Farbfeld solo, gegen den Computer oder mit bis zu sechs Personen – im Browser, im WLAN oder online.";
const boardImage = "/landing/spielbrett.webp";
const boardAlt = "Classic-Spielbrett mit vier angekreuzten blauen Feldern rund um Spalte H";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: "Farbfeld",
    locale: "de_AT",
    url: "/",
    title,
    description,
    images: [{ url: boardImage, width: 776, height: 410, alt: boardAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: boardImage, alt: boardAlt }],
  },
};

const gameMetadata = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Farbfeld",
  url: publicSiteUrl + "/",
  description,
  image: publicSiteUrl + boardImage,
  inLanguage: "de",
  genre: "Würfelspiel",
  gamePlatform: "Webbrowser",
  playMode: ["https://schema.org/SinglePlayer", "https://schema.org/MultiPlayer"],
  isAccessibleForFree: true,
};

const gameModes = [
  {
    name: "Internet-Spielraum",
    detail: "Jede Person spielt auf ihrem Gerät. Verschicke einen Einladungslink oder Raumcode. Auf Wunsch erinnert dich Farbfeld, wenn du am Zug bist.",
    color: "lime",
  },
  {
    name: "Direktspiel per QR-Code",
    detail: "Koppelt eure Geräte per QR-Code und spielt im selben WLAN oder Hotspot. Ist Farbfeld offline bereit, braucht ihr dafür kein Internet.",
    color: "sky",
  },
  {
    name: "Ein Handy weitergeben",
    detail: "Alle am selben Tisch? Reicht ein Gerät nach jedem Zug weiter. Jede Person spielt auf ihrem eigenen Blatt.",
    color: "pink",
  },
  {
    name: "Solo oder gegen den Computer",
    detail: "Jage deinen Bestwert in 30 Würfen oder fordere den Computer auf drei Schwierigkeitsstufen heraus.",
    color: "gold",
  },
];

const variants = [
  {
    name: "Schatzsuche",
    topic: "schatzsuche",
    scene: "schatz-spur",
    alt: "Die Schatzsuche zeigt den Heiß-Hinweis und die Spur der letzten Züge",
    detail: "Heiß, warm oder kalt? Verfolge die Hinweise nach deinen Zügen und finde drei versteckte Schätze.",
    color: "gold",
  },
  {
    name: "Schiffsboni",
    topic: "schiffe",
    scene: "schiffe-auslegen",
    alt: "Flottenaufstellung mit markierten Schiffsfeldern auf dem farbigen Brett",
    detail: "Legt zu zweit eure Flotten aus. Trefft beim Ankreuzen die gegnerischen Schiffe. Punkte gibt es für vollständig versenkte Schiffe.",
    color: "sky",
  },
  {
    name: "Öffentliche Aufträge",
    topic: "auftraege",
    scene: "auftraege-plan",
    alt: "Drei öffentliche Aufträge mit ihrem Fortschritt und den verbleibenden Runden",
    detail: "Erfülle drei gemeinsame Aufträge zu Spalten, Sternen und Farben. Dein Fortschritt und die Frist stehen direkt am Brett.",
    color: "pink",
  },
];

const coffeeUrl = "https://www.buymeacoffee.com/ichwardort";
const supportCodes = [
  { name: "PayPal", url: "https://www.paypal.com/qrcodes/p2pqrc/WUJZRNFHFGS9Y", hint: "Mit der PayPal-App scannen." },
  { name: "Buy Me a Coffee", url: coffeeUrl, hint: "Mit der Handykamera scannen." },
].map(({ name, url, hint }) => {
  const qr = qrcode(0, "M");
  qr.addData(url, "Byte");
  qr.make();
  return { name, hint, qrImage: qr.createDataURL(6, 24) };
});

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="/landing.css" precedence="farbfeld" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameMetadata) }} />
      <a className="skip-link" href="#inhalt">Zum Inhalt</a>
      <header className="site-header">
        <div className="site-width site-nav">
          <a className="site-brand" href="/" aria-label="Farbfeld Startseite">
            <img src="/icon.svg" alt="" width="42" height="42" />
            Farbfeld
          </a>
          <nav className="site-nav-links" aria-label="Hauptnavigation">
            <a href="#so-gehts">So geht’s</a>
            <a href="#spielmodi">Spielmodi</a>
            <a href="#varianten">Varianten</a>
          </nav>
          <a className="site-button site-button-outline" href="/play">Spiel öffnen</a>
        </div>
      </header>

      <main id="inhalt">
        <section className="site-width hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="section-label">Das Würfelspiel für den Browser</p>
            <h1 id="hero-title">Würfeln.<br />Kreuzen.<br /><span>Noch eine Runde.</span></h1>
            <p>Ein Wurf, viele Möglichkeiten. Fülle auf deinem Blatt Spalten und Farben, sammle Punkte und spiele allein oder mit bis zu sechs Personen.</p>
            <div className="hero-actions">
              <a className="site-button site-button-primary" href="/play">Jetzt spielen</a>
              <a className="site-link" href="#so-gehts">So funktioniert’s</a>
            </div>
            <p className="hero-note">Kostenlos, ohne Konto und optional als App installierbar.</p>
          </div>

          <figure className="hero-figure">
            <div className="hero-stage">
              <div className="hero-tiles" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
              <img src={boardImage} alt={boardAlt} width="776" height="410" fetchPriority="high" />
              <div className="hero-dice" aria-hidden="true">
                <span className="hero-die hero-die-color">✓</span>
                <span className="hero-die hero-die-number"><i></i><i></i><i></i><i></i></span>
              </div>
            </div>
            <figcaption><span>Classic · Vier blaue Felder rund um Spalte H.</span><a className="board-open" href={boardImage}>Brett vergrößern</a></figcaption>
          </figure>
        </section>

        <section className="site-width rules-section" id="so-gehts" aria-labelledby="rules-title">
          <div className="section-heading">
            <h2 id="rules-title">So geht Farbfeld</h2>
            <a className="site-link" href="/play?anleitung=grundspiel">Spielanleitung mit Videos</a>
          </div>
          <div className="rules-demo">
            <figure>
              <video width="560" height="336" controls playsInline preload="none" poster="/game/tutorial/grundspiel.jpg" aria-label="Beispielzug mit drei gelben Feldern">
                <source src="/game/tutorial/grundspiel.mp4" type="video/mp4" />
                <a href="/game/tutorial/grundspiel.mp4">Spielzug ansehen</a>
              </video>
              <figcaption>Gelb und eine Drei. So entsteht ein Zug auf dem Blatt.</figcaption>
            </figure>
            <ol className="rules-list">
              <li>
                <h3>Würfel kombinieren</h3>
                <p>Wähle einen Farbwürfel und einen Zahlenwürfel. Die Zahl gibt vor, wie viele Felder du ankreuzt.</p>
              </li>
              <li>
                <h3>Felder verbinden</h3>
                <p>Kreuze zusammenhängende Felder in der gewählten Farbe an. Beginne in Spalte H oder schließe an ein vorhandenes Kreuz an.</p>
              </li>
              <li>
                <h3>Punkte sammeln</h3>
                <p>Volle Spalten und Farben bringen Punkte. Lass möglichst wenige Sterne offen und sichere dir die höheren Boni für erste Abschlüsse.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="modes-section" id="spielmodi" aria-labelledby="modes-title">
          <div className="site-width modes-layout">
            <div>
              <p className="section-label">Spielmodi</p>
              <h2 id="modes-title">Ein Blatt für dich. Eine Runde für alle.</h2>
              <p className="section-description">Im Mehrspielermodus können zwei bis sechs Personen mitmachen.</p>
            </div>
            <ul className="modes-list">
              {gameModes.map(({ name, detail, color }) => (
                <li key={name}>
                  <span className={`mode-tile tone-${color}`} aria-hidden="true">✓</span>
                  <div>
                    <h3>{name}</h3>
                    <p>{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="site-width variants-section" id="varianten" aria-labelledby="variants-title">
          <div className="section-heading">
            <div>
              <p className="section-label">Zusatzregeln</p>
              <h2 id="variants-title">Mehr Möglichkeiten pro Wurf</h2>
            </div>
            <p className="section-description">Wähle beim Start, welche Zusatzregeln für eure Partie gelten.</p>
          </div>
          <div className="variant-grid">
            {variants.map(({ name, topic, scene, alt, detail, color }) => (
              <article className="variant-card" key={topic}>
                <a className={`variant-image tone-${color}`} href={`/game/tutorial/${scene}.jpg`} aria-label={`${name} in Originalgröße öffnen`}>
                  <img src={`/game/tutorial/${scene}.jpg`} alt={alt} width="560" height="336" loading="lazy" decoding="async" />
                </a>
                <div className="variant-copy">
                  <h3>{name}</h3>
                  <p>{detail}</p>
                  <a className="site-link" href={`/play?anleitung=${topic}`} aria-label={`Spielanleitung für ${name}`}>Spielanleitung</a>
                </div>
              </article>
            ))}
          </div>
          <p className="more-variants">
            Je nach Spielmodus gibt es auch <strong>Entdeckermodus</strong>, <strong>Farben neu mischen</strong>, <strong>versteckte Minen</strong> und <strong>Luftangriff</strong>.
          </p>
        </section>

        <section className="site-width extras-section" aria-labelledby="extras-title">
          <div className="extras-panel">
            <h2 id="extras-title">Farbfeld auf deinem Gerät</h2>
            <dl className="extras-list">
              <div>
                <dt>Vier Spielbretter</dt>
                <dd>Classic, Flusslauf, Mosaik oder ein neues Zufallsbrett pro Partie.</dd>
              </div>
              <div>
                <dt>Statistik und Gegnerbilanz</dt>
                <dd>Vergleiche deine Bestwerte, Siegesserien und bisherigen Duelle.</dd>
              </div>
              <div>
                <dt>Zoom und Querformat</dt>
                <dd>Zoome ins Blatt oder passe das ganze Brett an den Bildschirm an.</dd>
              </div>
              <div>
                <dt>Als App installierbar</dt>
                <dd>Öffne das Spiel und wähle im Browser „App installieren“ oder „Zum Home-Bildschirm“.</dd>
              </div>
            </dl>
            <a className="site-button site-button-primary" href="/play">Farbfeld spielen</a>
          </div>
        </section>

        <section className="site-width support-section" id="unterstuetzen" aria-labelledby="support-title">
          <div className="support-row">
            <div className="support-copy">
              <h2 id="support-title">Ein Kaffee für Farbfeld</h2>
              <p>Farbfeld ist ein Ein-Personen-Projekt. Ein freiwilliger Beitrag hilft, die laufenden Serverkosten zu decken und das Spiel weiterzuentwickeln.</p>
            </div>
            <a className="site-button site-button-outline" href={coffeeUrl} rel="noreferrer">Buy Me a Coffee</a>
          </div>
          <details className="support-details">
            <summary>PayPal und QR-Codes</summary>
            <div className="support-codes">
              {supportCodes.map(({ name, hint, qrImage }) => (
                <figure key={name}>
                  <img src={qrImage} alt={`QR-Code für ${name}`} width="216" height="216" />
                  <figcaption>{name}<small>{hint}</small></figcaption>
                </figure>
              ))}
            </div>
          </details>
        </section>
      </main>

      <footer className="site-width site-footer">
        <a className="site-brand" href="/">
          <img src="/icon.svg" alt="" width="34" height="34" />
          Farbfeld
        </a>
        <nav aria-label="Links am Seitenende">
          <a href="/play?anleitung">Spielanleitung</a>
          <a href="/impressum">Impressum</a>
        </nav>
      </footer>
    </>
  );
}
