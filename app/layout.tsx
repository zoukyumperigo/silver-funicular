import type { Metadata } from 'next';
import { Inter, Crimson_Text, EB_Garamond } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alexandria - The Premier Digital Community for Liberal Arts Knowledge',
  description:
    'Discover, trade, and learn from the greatest books in the Liberal Arts. Join Alexandria, the digital successor to the ancient Library of Alexandria.',
  keywords: [
    'liberal arts',
    'classical education',
    'trivium',
    'quadrivium',
    'book marketplace',
    'book trading',
    'online learning',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable} ${ebGaramond.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
