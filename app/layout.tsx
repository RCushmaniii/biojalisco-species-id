import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioJalisco Species Identifier',
  description: 'AI-powered species identification for Jalisco biodiversity research. Verified against GBIF, iNaturalist, and CONABIO databases.',
  metadataBase: new URL('https://biojalisco-species-id.vercel.app'),
  openGraph: {
    title: 'BioJalisco Species Identifier',
    description: 'AI-powered species identification verified against GBIF, iNaturalist, and CONABIO. Built for conservation biologists in Jalisco, Mexico.',
    siteName: 'BioJalisco',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BioJalisco Species Identifier',
    description: 'AI-powered species identification verified against GBIF, iNaturalist, and CONABIO.',
  },
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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );

  if (!hasClerkKey) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
