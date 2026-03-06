'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { CameraIcon } from './icons';

const ANIMAL_GROUPS = [
  { en: 'Mammals', es: 'Mamiferos', icon: MammalIcon },
  { en: 'Birds', es: 'Aves', icon: BirdIcon },
  { en: 'Reptiles', es: 'Reptiles', icon: ReptileIcon },
  { en: 'Amphibians', es: 'Anfibios', icon: AmphibianIcon },
];

export function HeroSection({ count }: { count: number }) {
  const { t } = useLanguage();

  return (
    <div className="hero">
      <div className="hero-header">
        <h1>
          <span className="accent">{t('Species', 'Identificador')}</span>{' '}
          {t('Identifier', 'de Especies')}
        </h1>
        <p className="hero-subtitle">
          {t(
            'AI-powered vertebrate identification for Jalisco field research',
            'Identificacion de vertebrados con IA para investigacion de campo en Jalisco'
          )}
        </p>
      </div>

      <div className="hero-groups">
        {ANIMAL_GROUPS.map((group) => (
          <div key={group.en} className="hero-group-card">
            <group.icon />
            <span>{t(group.en, group.es)}</span>
          </div>
        ))}
      </div>

      <div className="hero-cta">
        <Link href="/identify" className="btn btn-primary hero-btn">
          <CameraIcon />
          {t('Start Identifying', 'Comenzar a Identificar')}
        </Link>
        {count > 0 && (
          <p className="hero-count">
            {count} {t('observations recorded', 'observaciones registradas')}
          </p>
        )}
      </div>

      <div className="hero-features">
        <div className="hero-feature">
          <div className="hero-feature-number">4</div>
          <div className="hero-feature-label">{t('Animal Groups', 'Grupos Animales')}</div>
          <div className="hero-feature-detail">
            {t('Mammals, birds, reptiles, amphibians', 'Mamiferos, aves, reptiles, anfibios')}
          </div>
        </div>
        <div className="hero-feature">
          <div className="hero-feature-number">2</div>
          <div className="hero-feature-label">{t('Languages', 'Idiomas')}</div>
          <div className="hero-feature-detail">
            {t('English & Spanish results', 'Resultados en ingles y espanol')}
          </div>
        </div>
        <div className="hero-feature">
          <div className="hero-feature-number">8</div>
          <div className="hero-feature-label">{t('Data Categories', 'Categorias de Datos')}</div>
          <div className="hero-feature-detail">
            {t('Taxonomy, ecology, conservation & more', 'Taxonomia, ecologia, conservacion y mas')}
          </div>
        </div>
      </div>
    </div>
  );
}

function MammalIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="18" rx="10" ry="7" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8 11c-2-3-1-6 1-6s3 2 2 5" />
      <path d="M24 11c2-3 1-6-1-6s-3 2-2 5" />
      <path d="M14 22c0 1 1 2 2 2s2-1 2-2" />
    </svg>
  );
}

function BirdIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18c0-6 4-12 12-12 2 0 4 1 5 3l3-1-1 4c1 2 1 4 0 6" />
      <path d="M25 18c-2 4-6 7-12 7-4 0-7-2-7-7" />
      <circle cx="20" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M26 10l4-1-3 3" />
    </svg>
  );
}

function ReptileIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16c2-2 4-3 7-3h10c3 0 5 1 7 3" />
      <path d="M11 13c0-3 2-5 5-5s5 2 5 5" />
      <circle cx="13.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="M4 16l-2 3m0 0h3" />
      <path d="M28 16l2 3m0 0h-3" />
      <path d="M16 19v4m-2 0h4" />
    </svg>
  );
}

function AmphibianIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="18" rx="9" ry="6" />
      <circle cx="11" cy="11" r="2.5" />
      <circle cx="21" cy="11" r="2.5" />
      <circle cx="11" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="21" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <path d="M13 21c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
      <path d="M7 20l-3 4m0 0l2 .5m-2-.5l.5 2" />
      <path d="M25 20l3 4m0 0l-2 .5m2-.5l-.5 2" />
    </svg>
  );
}
