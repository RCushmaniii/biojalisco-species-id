'use client';

import Image from 'next/image';
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
        <Image
          src="/images/tropical-bird.webp"
          alt="Motmot — Jalisco's iconic tropical bird"
          width={140}
          height={180}
          className="hero-bird"
          priority
        />
        <h1>
          <span className="accent">{t('Species', 'Identificador')}</span>{' '}
          {t('Identifier', 'de Especies')}
        </h1>
        <p className="hero-subtitle">
          {t(
            'Shazam for wildlife — snap a photo, know the species',
            'Shazam para la vida silvestre — toma una foto, conoce la especie'
          )}
        </p>
      </div>

      <div className="hero-divider" />

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

/* ── Ocelot — Jalisco's iconic wild cat ── */
function MammalIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <ellipse cx="16" cy="14" rx="7" ry="6" />
      {/* Ears */}
      <path d="M10.5 9.5L8 4l3.5 4" />
      <path d="M21.5 9.5L24 4l-3.5 4" />
      {/* Eyes */}
      <ellipse cx="13" cy="13" rx="1.3" ry="1" fill="currentColor" stroke="none" />
      <ellipse cx="19" cy="13" rx="1.3" ry="1" fill="currentColor" stroke="none" />
      {/* Nose + mouth */}
      <path d="M15 16.5h2" />
      <path d="M16 16.5v1" />
      {/* Whiskers */}
      <path d="M12 15.5l-4 0.5" />
      <path d="M12 16.5l-3.5 1.5" />
      <path d="M20 15.5l4 0.5" />
      <path d="M20 16.5l3.5 1.5" />
      {/* Spots (ocelot markings) */}
      <circle cx="11" cy="10.5" r="0.6" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="21" cy="10.5" r="0.6" fill="currentColor" stroke="none" opacity="0.4" />
      {/* Body hint */}
      <path d="M11 19.5c-1 2-1 4.5 0 6" />
      <path d="M21 19.5c1 2 1 4.5 0 6" />
      <path d="M11 25.5h10" />
    </svg>
  );
}

/* ── Motmot — Jalisco's spectacular trogon-relative ── */
function BirdIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="16" cy="8" r="4.5" />
      {/* Eye */}
      <circle cx="17.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      {/* Beak — thick, curved motmot beak */}
      <path d="M20.5 9l4-0.5-3 2.5" />
      {/* Eye stripe (motmot marking) */}
      <path d="M12 7.5h3" strokeWidth="2" opacity="0.3" />
      {/* Body */}
      <ellipse cx="15" cy="17" rx="4.5" ry="5.5" />
      {/* Wing */}
      <path d="M19 14c2 1 3 3 2.5 6" />
      {/* Long racket tail — the motmot's signature */}
      <path d="M14 22.5l-1 3.5" />
      <circle cx="12.5" cy="27.5" r="1.5" />
      {/* Feet */}
      <path d="M13 22v1.5" />
      <path d="M17 22v1.5" />
    </svg>
  );
}

/* ── Green Iguana — common Jalisco reptile ── */
function ReptileIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <path d="M6 14c0-2.5 2-5 5-5h2l3-1 2 1c2.5 0 4 2 4 4" />
      {/* Eye */}
      <circle cx="14" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      {/* Dewlap */}
      <path d="M8 14c-1 2-1 3.5 0 4" />
      {/* Body */}
      <path d="M6 14h16c2 0 3.5 1 4 3" />
      <path d="M8 18h14c1.5 0 3-0.5 4-1" />
      {/* Dorsal spines */}
      <path d="M10 14v-2" />
      <path d="M13 13.5v-2.5" />
      <path d="M16 14v-2" />
      <path d="M19 14v-1.5" />
      <path d="M22 14.5v-1" />
      {/* Front leg */}
      <path d="M10 18l-2 4.5" />
      <path d="M8 22.5l-1.5 0.5m1.5-0.5l1 0.8" />
      {/* Back leg */}
      <path d="M20 18l1 4.5" />
      <path d="M21 22.5l-1 0.8m1-0.8l1.5 0.5" />
      {/* Tail — long, curving */}
      <path d="M26 16c1 0.5 2 1.5 1.5 3s-2 2-3 1" />
    </svg>
  );
}

/* ── Tree Frog — Jalisco's cloud forest amphibian ── */
function AmphibianIcon() {
  return (
    <svg className="hero-group-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Big bulging eyes */}
      <circle cx="11" cy="9" r="3" />
      <circle cx="21" cy="9" r="3" />
      <circle cx="11.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="21.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      {/* Head/body — smooth, round */}
      <path d="M8 11c-3 2-5 5-4 9 1 3 4 5 12 5s11-2 12-5c1-4-1-7-4-9" />
      {/* Smile */}
      <path d="M13 19c1.5 1.5 4 1.5 6 0" />
      {/* Front legs with toe pads */}
      <path d="M8 20l-4 3" />
      <circle cx="3.5" cy="23.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M24 20l4 3" />
      <circle cx="28.5" cy="23.5" r="0.8" fill="currentColor" stroke="none" />
      {/* Back legs */}
      <path d="M10 24l-2 3.5" />
      <path d="M8 27.5l-1 0.3m1-0.3l0.8 0.8m-0.8-0.8l1.2-0.2" />
      <path d="M22 24l2 3.5" />
      <path d="M24 27.5l1 0.3m-1-0.3l-0.8 0.8m0.8-0.8l-1.2-0.2" />
    </svg>
  );
}
