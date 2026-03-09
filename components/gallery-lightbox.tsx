'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';

export interface GalleryItem {
  id: string;
  imageUrl: string;
  commonName: string | null;
  nombreComun: string | null;
  scientificName: string | null;
  confidence: number | null;
  iucnStatus: string | null;
  imageOrientation: string | null;
  featured: boolean | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  descripcion: string | null;
  createdAt: string;
}

function confColor(conf: number | null): string {
  if (!conf) return 'var(--cream-50)';
  if (conf >= 80) return 'var(--green-bright)';
  if (conf >= 50) return 'var(--orange)';
  return 'var(--red)';
}

function iucnBadge(status: string | undefined | null): string | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.includes('least concern') || s === 'lc') return 'LC';
  if (s.includes('near threatened') || s === 'nt') return 'NT';
  if (s.includes('vulnerable') || s === 'vu') return 'VU';
  if (s.includes('endangered') && !s.includes('critically') || s === 'en') return 'EN';
  if (s.includes('critically') || s === 'cr') return 'CR';
  if (s.includes('domesticated')) return null;
  return null;
}

function iucnClass(badge: string): string {
  if (badge === 'LC') return 'iucn-lc';
  if (badge === 'NT') return 'iucn-nt';
  if (badge === 'VU') return 'iucn-vu';
  if (badge === 'EN') return 'iucn-en';
  if (badge === 'CR') return 'iucn-cr';
  return '';
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const observations = items;
  const { lang, t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % observations.length);
  }, [lightboxIndex, observations.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + observations.length) % observations.length);
  }, [lightboxIndex, observations.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  return (
    <>
      <div className="gallery-grid">
        {observations.map((obs, i) => {
          const badge = iucnBadge(obs.iucnStatus);
          const displayName = (lang === 'es' ? obs.nombreComun : obs.commonName) || obs.commonName;
          return (
            <button
              key={obs.id}
              className={`gallery-cell ${obs.imageOrientation === 'portrait' ? 'gallery-cell-tall' : ''}`}
              onClick={() => openLightbox(i)}
              aria-label={`${t('View', 'Ver')} ${displayName || t('observation', 'observacion')}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={obs.imageUrl}
                alt={displayName || t('Observation', 'Observacion')}
                className="gallery-cell-image"
                loading="lazy"
              />
              <div className="gallery-cell-overlay">
                {obs.featured && (
                  <span className="gallery-featured-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </span>
                )}
                <div className="gallery-cell-meta">
                  <span className="gallery-cell-name">
                    {displayName || t('Unknown', 'Desconocido')}
                  </span>
                  {obs.scientificName && (
                    <span className="gallery-cell-sci">{obs.scientificName}</span>
                  )}
                </div>
                <div className="gallery-cell-badges">
                  {obs.confidence !== null && (
                    <span
                      className="gallery-cell-conf"
                      style={{ color: confColor(obs.confidence) }}
                    >
                      {obs.confidence}%
                    </span>
                  )}
                  {badge && (
                    <span className={`gallery-iucn-badge ${iucnClass(badge)}`}>
                      {badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          observations={observations}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </>
  );
}

function Lightbox({
  observations,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  observations: GalleryItem[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { lang, t } = useLanguage();
  const obs = observations[index];
  const badge = iucnBadge(obs.iucnStatus);
  const displayName = (lang === 'es' ? obs.nombreComun : obs.commonName) || obs.commonName;
  const displayDesc = (lang === 'es' ? obs.descripcion : obs.description) || obs.description;

  const dateLocale = lang === 'es' ? 'es-MX' : 'en-US';
  const date = new Date(obs.createdAt).toLocaleDateString(dateLocale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={t('Image viewer', 'Visor de imagen')}>
      <div className="lightbox-content">
        {/* Close button */}
        <button className="lightbox-close" onClick={onClose} aria-label={t('Close', 'Cerrar')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {observations.length > 1 && (
          <>
            <button className="lightbox-nav lightbox-prev" onClick={(e) => { stop(e); onPrev(); }} aria-label={t('Previous', 'Anterior')}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="lightbox-nav lightbox-next" onClick={(e) => { stop(e); onNext(); }} aria-label={t('Next', 'Siguiente')}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <div className="lightbox-image-wrap" onClick={stop}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={obs.imageUrl}
            alt={displayName || t('Observation', 'Observacion')}
            className="lightbox-image"
          />
        </div>

        {/* Info panel */}
        <div className="lightbox-info" onClick={stop}>
          <div className="lightbox-info-primary">
            <h2 className="lightbox-species-name">
              {displayName || t('Unknown Species', 'Especie Desconocida')}
            </h2>
            {obs.scientificName && (
              <p className="lightbox-sci-name">{obs.scientificName}</p>
            )}
          </div>

          <div className="lightbox-info-details">
            <span className="lightbox-detail">{date}</span>
            {obs.confidence !== null && (
              <span className="lightbox-detail" style={{ color: confColor(obs.confidence) }}>
                {obs.confidence}% {t('confidence', 'confianza')}
              </span>
            )}
            {badge && (
              <span className={`gallery-iucn-badge ${iucnClass(badge)}`}>{badge}</span>
            )}
            {obs.latitude && obs.longitude && (
              <span className="lightbox-detail lightbox-detail-muted">
                {obs.latitude.toFixed(2)}, {obs.longitude.toFixed(2)}
              </span>
            )}
          </div>

          {displayDesc && (
            <p className="lightbox-description">{displayDesc}</p>
          )}

          <div className="lightbox-counter">
            {index + 1} / {observations.length}
          </div>
        </div>
      </div>
    </div>
  );
}
