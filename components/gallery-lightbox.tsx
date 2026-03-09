'use client';

import { useState, useEffect, useCallback } from 'react';
export interface GalleryItem {
  id: string;
  imageUrl: string;
  commonName: string | null;
  scientificName: string | null;
  confidence: number | null;
  iucnStatus: string | null;
  imageOrientation: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
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
          return (
            <button
              key={obs.id}
              className={`gallery-cell ${obs.imageOrientation === 'portrait' ? 'gallery-cell-tall' : ''}`}
              onClick={() => openLightbox(i)}
              aria-label={`View ${obs.commonName || 'observation'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={obs.imageUrl}
                alt={obs.commonName || 'Observation'}
                className="gallery-cell-image"
                loading="lazy"
              />
              <div className="gallery-cell-overlay">
                <div className="gallery-cell-meta">
                  <span className="gallery-cell-name">
                    {obs.commonName || 'Unknown'}
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
  const obs = observations[index];
  const badge = iucnBadge(obs.iucnStatus);

  const date = new Date(obs.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {observations.length > 1 && (
          <>
            <button className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <div className="lightbox-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={obs.imageUrl}
            alt={obs.commonName || 'Observation'}
            className="lightbox-image"
          />
        </div>

        {/* Info panel overlaid on bottom */}
        <div className="lightbox-info">
          <div className="lightbox-info-primary">
            <h2 className="lightbox-species-name">
              {obs.commonName || 'Unknown Species'}
            </h2>
            {obs.scientificName && (
              <p className="lightbox-sci-name">{obs.scientificName}</p>
            )}
          </div>

          <div className="lightbox-info-details">
            <span className="lightbox-detail">{date}</span>
            {obs.confidence !== null && (
              <span className="lightbox-detail" style={{ color: confColor(obs.confidence) }}>
                {obs.confidence}% confidence
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

          {obs.description && (
            <p className="lightbox-description">{obs.description}</p>
          )}

          <div className="lightbox-counter">
            {index + 1} / {observations.length}
          </div>
        </div>
      </div>
    </div>
  );
}
