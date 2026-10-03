import type { Metadata } from "next";
import { Open_Sans, Oswald } from "next/font/google";
import { SelectionProvider } from "@/components/SelectionProvider";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IHO Sale",
  description: "Mobiliario y accesorios de decoración en remate. Elige las piezas y te contactamos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${openSans.variable} ${oswald.variable}`} data-scroll-behavior="smooth">
      <body>
        <SelectionProvider>{children}</SelectionProvider>
      </body>
    </html>
  );
}
