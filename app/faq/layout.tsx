import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Learn about BioJalisco — how species identification works, what data is collected, who can access observations, and how AI and scientific databases verify results.',
  alternates: { canonical: '/faq', languages: { 'en': '/faq', 'es': '/faq', 'x-default': '/faq' } },
  openGraph: {
    title: 'FAQ — BioJalisco Species Identifier',
    description: 'Everything you need to know about AI-powered species identification for biodiversity research in Jalisco, Mexico.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
