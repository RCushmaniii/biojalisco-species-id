import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { PWARegister } from '@/components/pwa-register';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0E0C08' },
    { media: '(prefers-color-scheme: light)', color: '#FAF6EE' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'BioJalisco Species Identifier',
    template: '%s — BioJalisco',
  },
  description: 'AI-powered species identification for Jalisco biodiversity research. Verified against GBIF, iNaturalist, and CONABIO databases.',
  metadataBase: new URL('https://biojalisco-species-id.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'es': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'BioJalisco Species Identifier',
    description: 'AI-powered species identification verified against GBIF, iNaturalist, and CONABIO. Built for conservation biologists in Jalisco, Mexico.',
    siteName: 'BioJalisco',
    locale: 'en_US',
    alternateLocale: 'es_MX',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BioJalisco Species Identifier',
    description: 'AI-powered species identification verified against GBIF, iNaturalist, and CONABIO.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'BioJalisco',
    'mobile-web-app-capable': 'yes',
  },
  manifest: '/site.webmanifest',
};

// Clerk key must be a real key (starts with pk_live_ or pk_test_ followed by actual chars)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const hasClerkKey = clerkKey.length > 20 && !clerkKey.endsWith('...');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <PWARegister />
            <PWAInstallPrompt />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  if (!hasClerkKey) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
