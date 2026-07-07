import type { Metadata } from 'next';
import { Inter, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { GlobalPlayer } from '@/components/player/GlobalPlayer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SingNow - Hát Karaoke Online',
  description: 'Ứng dụng karaoke miễn phí với kho nhạc YouTube vô tận, lyrics đồng bộ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${beVietnam.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <GlobalPlayer />
        </Providers>
      </body>
    </html>
  );
}
