import type { Metadata } from "next";
export const metadata: Metadata = { title: "Farbfeld – das Würfelspiel", description: "Würfeln, Farben verbinden und Spalten füllen. Eine mobile PWA mit Solo- und Mehrspielermodus.", manifest: "/manifest.webmanifest", icons: { icon: "/icon.svg", apple: "/icon-192.png" } };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="de"><body>{children}</body></html>; }
