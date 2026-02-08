import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "KDP Rocket AI - Free Book Idea & Interior Generator",
  description: "Generate book ideas and create KDP-ready interior PDFs for free. Word search, maze, sudoku, journal, and dot grid generators for Amazon KDP publishers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

