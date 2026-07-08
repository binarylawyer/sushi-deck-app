import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sushi Deck",
  description: "Build, generate, and present decks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
