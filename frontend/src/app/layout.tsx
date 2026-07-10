import type { Metadata } from "next";
import { ClientProviders } from "@/components/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAMILIA — Adversarial Evidence Engine",
  description:
    "A dialectical RAG system that finds both supporting and undermining evidence for any claim.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FFFDF5] text-black">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
