import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const bebasNeue = Bebas_Neue({ variable: '--font-bebas-neue', weight: '400', subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090b',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://creator-os-livid.vercel.app'),
  title: 'Creator OS Lite',
  description: 'Private TikTok content operations dashboard',
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CreatorOS',
  },
  openGraph: {
    title: 'Creator OS Lite',
    description: 'Private TikTok content operations dashboard',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Creator OS Lite' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator OS Lite',
    description: 'Private TikTok content operations dashboard',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-167.png', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* iOS requires this specific tag — Next.js only outputs mobile-web-app-capable */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* iOS splash screens — portrait, per-device */}
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1179x2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1290x2796.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
