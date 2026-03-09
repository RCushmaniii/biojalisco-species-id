'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { ResultTabs } from './result-tabs';
import { TrashIcon, MapPinIcon, CalendarIcon } from './icons';
import type { Observation, IdentifySuccessResponse } from '@/lib/types';

export function ObservationDetail({ observation }: { observation: Observation }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, closeLightbox]);

  const handleDelete = async () => {
    if (!confirm(t('Delete this observation?', 'Eliminar esta observacion?'))) return;
    setDeleting(true);

    try {
      await fetch(`/api/observations/${observation.id}`, { method: 'DELETE' });
      router.push('/dashboard');
      router.refresh();
    } catch {
      setDeleting(false);
      alert(t('Failed to delete', 'Error al eliminar'));
    }
  };

  const date = new Date(observation.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasIdentification = observation.commonName && !observation.error;

  return (
    <>
      <div className="detail-image" onClick={() => setLightboxOpen(true)} role="button" tabIndex={0} aria-label="View full image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={observation.imageUrl} alt={observation.commonName || 'Observation'} />
      </div>

      {lightboxOpen && (
        <div className="detail-lightbox-backdrop" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Full image view">
          <button className="detail-lightbox-close" onClick={closeLightbox} aria-label="Close">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={observation.imageUrl}
            alt={observation.commonName || 'Observation'}
            className="detail-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="detail-meta">
        <div className="detail-meta-item">
          <CalendarIcon className="icon icon-sm" />
          {date}
        </div>
        {observation.latitude && observation.longitude && (
          <div className="detail-meta-item">
            <MapPinIcon className="icon icon-sm" />
            {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
          </div>
        )}
      </div>

      <div className="result-container">
        {observation.error ? (
          <div className="result-card visible">
            <div className="result-error">
              <p>{observation.error}</p>
              {observation.suggestion && (
                <p className="suggestion">{observation.suggestion}</p>
              )}
            </div>
          </div>
        ) : hasIdentification ? (
          <ResultTabs
            data={
              {
                identification: {
                  common_name: observation.commonName!,
                  nombre_comun: observation.nombreComun || observation.commonName!,
                  scientific_name: observation.scientificName || '',
                  breed: observation.breed || null,
                },
                confidence: observation.confidence || 0,
                taxonomy: observation.taxonomy || ({} as IdentifySuccessResponse['taxonomy']),
                ecology: observation.ecology || ({} as IdentifySuccessResponse['ecology']),
                geography: observation.geography || ({} as IdentifySuccessResponse['geography']),
                conservation: observation.conservation || ({} as IdentifySuccessResponse['conservation']),
                similar_species: observation.similarSpecies || [],
                image_orientation: observation.imageOrientation || 'landscape',
                description: observation.description || '',
                descripcion: observation.descripcion || '',
                fun_fact: observation.funFact || '',
              } satisfies IdentifySuccessResponse
            }
          />
        ) : null}
      </div>

      <div className="detail-actions">
        <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
          <TrashIcon className="icon icon-sm" />
          {deleting ? t('Deleting...', 'Eliminando...') : t('Delete', 'Eliminar')}
        </button>
      </div>
    </>
  );
}
