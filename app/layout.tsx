import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioJalisco Species Identifier',
  description: 'AI-powered species identification for Jalisco biodiversity research',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
