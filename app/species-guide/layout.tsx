import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protected Species of Jalisco',
  description: 'Rare, threatened, and endangered vertebrates documented in Jalisco, Mexico. Listed under NOM-059-SEMARNAT and IUCN Red List with conservation status and endemic classification.',
  alternates: { canonical: '/species-guide' },
  openGraph: {
    title: 'Protected Species of Jalisco — BioJalisco',
    description: 'Explore endangered and threatened vertebrate species in Jalisco, Mexico, protected under NOM-059-SEMARNAT and IUCN classifications.',
  },
};

export default function SpeciesGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
