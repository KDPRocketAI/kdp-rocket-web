import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// Header is rendered globally for all pages including /interior-generator
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
          <meta name="google-site-verification" content="MI4Z6_gVtrS_rvFnRNy-Ns9JrA5qTooH8zrLtZWe4bw" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={inter.className}>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

