'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { NavBrand } from '@/components/nav-brand';
import { SiteFooter } from '@/components/site-footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  protectedSpeciesJalisco,
  GROUP_LABELS,
  NOM059_LABELS,
  type ProtectedSpecies,
} from '@/lib/species-data';

type GroupKey = 'all' | 'mammals' | 'birds' | 'reptiles' | 'amphibians';

const GROUPS: GroupKey[] = ['all', 'mammals', 'birds', 'reptiles', 'amphibians'];

function GroupIcon({ group, className = '' }: { group: string; className?: string }) {
  const cl = `species-group-icon ${className}`;
  switch (group) {
    case 'mammals':
      return (
        <svg className={cl} viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="1.2" fill="currentColor" />
          <circle cx="15" cy="10" r="1.2" fill="currentColor" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'birds':
      return (
        <svg className={cl} viewBox="0 0 24 24">
          <path d="M16 7c0-2.2-1.8-4-4-4S8 4.8 8 7c0 .7.2 1.4.5 2L3 15h4l1 4h8l1-4h4l-5.5-6c.3-.6.5-1.3.5-2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'reptiles':
      return (
        <svg className={cl} viewBox="0 0 24 24">
          <path d="M5 12c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 15c1-1 2.5-1.5 4-1s2.5 2 4 2 2.5-1.5 4-2 3 0 4 1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="9" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'amphibians':
      return (
        <svg className={cl} viewBox="0 0 24 24">
          <ellipse cx="12" cy="14" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="16" cy="8" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

function SpeciesCard({ species, lang }: { species: ProtectedSpecies; lang: string }) {
  const isEs = lang === 'es';
  const nom = species.nom059 ? NOM059_LABELS[species.nom059] : null;

  return (
    <div className="species-card glass-card">
      <div className="species-card-header">
        <div className="species-card-names">
          <h3 className="species-common">
            {isEs ? species.commonNameEs : species.commonNameEn}
          </h3>
          <p className="species-scientific">{species.scientificName}</p>
        </div>
        <GroupIcon group={species.group} className="species-card-group-icon" />
      </div>
      <div className="species-card-badges">
        {nom && (
          <span className={`species-badge ${nom.color}`}>
            NOM-059: {isEs ? nom.es : nom.en}
          </span>
        )}
        {species.iucn && (
          <span className={`species-badge iucn-${species.iucn.toLowerCase().replace(/\s+/g, '-')}`}>
            IUCN: {species.iucn}
          </span>
        )}
        {species.endemic && (
          <span className="species-badge endemic">
            {isEs ? 'Endemico de Mexico' : 'Endemic to Mexico'}
          </span>
        )}
      </div>
      <p className="species-card-notes">
        {isEs ? species.notesEs : species.notesEn}
      </p>
    </div>
  );
}

export default function SpeciesGuidePage() {
  const { lang, t } = useLanguage();
  const [activeGroup, setActiveGroup] = useState<GroupKey>('all');

  const filtered = activeGroup === 'all'
    ? protectedSpeciesJalisco
    : protectedSpeciesJalisco.filter(s => s.group === activeGroup);

  const stats = {
    total: protectedSpeciesJalisco.length,
    nom059: protectedSpeciesJalisco.filter(s => s.nom059).length,
    endemic: protectedSpeciesJalisco.filter(s => s.endemic).length,
    endangered: protectedSpeciesJalisco.filter(s => s.nom059 === 'P').length,
  };

  return (
    <>
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/sign-in" className="nav-link">{t('Sign In', 'Iniciar Sesion')}</Link>
        </div>
      </nav>

      <div className="species-guide">
        <div className="species-guide-header">
          <h1>
            <span className="accent">{t('Protected', 'Especies')}</span>{' '}
            {t('Species of Jalisco', 'Protegidas de Jalisco')}
          </h1>
          <p>
            {t(
              'Rare, threatened, and endangered vertebrates documented in Jalisco, Mexico. Listed under NOM-059-SEMARNAT and IUCN Red List.',
              'Vertebrados raros, amenazados y en peligro documentados en Jalisco, Mexico. Listados bajo NOM-059-SEMARNAT y Lista Roja de UICN.'
            )}
          </p>
        </div>

        <div className="species-stats">
          <div className="species-stat">
            <span className="species-stat-number">{stats.total}</span>
            <span className="species-stat-label">{t('Species', 'Especies')}</span>
          </div>
          <div className="species-stat">
            <span className="species-stat-number">{stats.nom059}</span>
            <span className="species-stat-label">NOM-059</span>
          </div>
          <div className="species-stat">
            <span className="species-stat-number">{stats.endemic}</span>
            <span className="species-stat-label">{t('Endemic', 'Endemicas')}</span>
          </div>
          <div className="species-stat">
            <span className="species-stat-number">{stats.endangered}</span>
            <span className="species-stat-label">{t('Endangered', 'En Peligro')}</span>
          </div>
        </div>

        <div className="species-filters">
          {GROUPS.map(g => (
            <button
              key={g}
              className={`species-filter-btn ${activeGroup === g ? 'active' : ''}`}
              onClick={() => setActiveGroup(g)}
            >
              {g !== 'all' && <GroupIcon group={g} />}
              {g === 'all'
                ? t('All', 'Todos')
                : lang === 'es'
                  ? GROUP_LABELS[g].es
                  : GROUP_LABELS[g].en}
            </button>
          ))}
        </div>

        <div className="species-nom-key">
          <h4>{t('NOM-059-SEMARNAT Key', 'Clave NOM-059-SEMARNAT')}</h4>
          <div className="nom-key-items">
            <span className="species-badge nom-p">P = {t('Endangered', 'En peligro de extincion')}</span>
            <span className="species-badge nom-a">A = {t('Threatened', 'Amenazada')}</span>
            <span className="species-badge nom-pr">Pr = {t('Special Protection', 'Proteccion especial')}</span>
          </div>
        </div>

        <div className="species-grid">
          {filtered.map(species => (
            <SpeciesCard key={species.scientificName} species={species} lang={lang} />
          ))}
        </div>

        <div className="species-guide-cta">
          <p>
            {t(
              'Help document these species. Every identification contributes to biodiversity research in Jalisco.',
              'Ayuda a documentar estas especies. Cada identificacion contribuye a la investigacion de biodiversidad en Jalisco.'
            )}
          </p>
          <Link href="/sign-in" className="btn btn-primary hero-btn" style={{ display: 'inline-flex', padding: '0.85rem 2rem' }}>
            {t('Start Identifying', 'Comenzar a Identificar')}
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
