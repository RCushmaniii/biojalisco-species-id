'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useGeolocation } from '@/hooks/use-geolocation';
import { CaptureArea } from '@/components/capture-area';
import type { IdentifyPayload } from '@/components/capture-area';
import { ResultTabs } from '@/components/result-tabs';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { IdentifyResponse, IdentifySuccessResponse } from '@/lib/types';

export default function IdentifyPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { position, requestPosition } = useGeolocation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [observationId, setObservationId] = useState<string | null>(null);

  // Request GPS on mount
  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  const handleIdentify = async (payload: IdentifyPayload) => {
    setIsLoading(true);
    setResult(null);
    setObservationId(null);

    // EXIF GPS takes priority over browser geolocation (more accurate, from photo location)
    const lat = payload.exifLatitude ?? position?.latitude ?? null;
    const lon = payload.exifLongitude ?? position?.longitude ?? null;

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: payload.imageData,
          latitude: lat,
          longitude: lon,
          exif_latitude: payload.exifLatitude,
          exif_longitude: payload.exifLongitude,
          date_taken: payload.dateTaken,
          camera_make: payload.cameraMake,
          camera_model: payload.cameraModel,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.id) {
        setObservationId(data.id);
      }
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'Unknown error',
        suggestion: 'Check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isError = result && 'error' in result;
  const isSuccess = result && !isError;

  return (
    <>
      <div className="header">
        <h1>
          <span className="accent">{t('Species', 'Identificador')}</span>{' '}
          {t('Identifier', 'de Especies')}
        </h1>
        <p>
          {t(
            'Photograph any animal and let AI identify it',
            'Fotografia cualquier animal y deja que la IA lo identifique'
          )}
        </p>
      </div>

      <CaptureArea onIdentify={handleIdentify} isLoading={isLoading} />

      {!result && !isLoading && (
        <div className="identify-tips">
          <div className="tips-card">
            <h3>{t('Photo Tips', 'Consejos para Fotos')}</h3>
            <ul className="tips-list">
              <li>{t('Show the full body of the animal, not just the head', 'Muestra el cuerpo completo del animal, no solo la cabeza')}</li>
              <li>{t('Good lighting improves accuracy — avoid heavy shadows', 'Buena iluminacion mejora la precision — evita sombras fuertes')}</li>
              <li>{t('Enable location for regional species filtering', 'Activa la ubicacion para filtrado regional de especies')}</li>
              <li>{t('One animal per photo works best', 'Una foto por animal funciona mejor')}</li>
            </ul>
          </div>
          <Link href="/species-guide" className="guide-link-card">
            <div className="guide-link-text">
              <h3>{t('Protected Species of Jalisco', 'Especies Protegidas de Jalisco')}</h3>
              <p>{t(
                '20 rare and protected vertebrates across mammals, birds, reptiles, and amphibians',
                '20 vertebrados raros y protegidos entre mamiferos, aves, reptiles y anfibios'
              )}</p>
            </div>
            <span className="guide-link-arrow">&#8594;</span>
          </Link>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      <div className="result-container">
        {isError && (
          <div className="result-card visible">
            <div className="result-error">
              <p>{result.error}</p>
              {'suggestion' in result && result.suggestion && (
                <p className="suggestion">{result.suggestion}</p>
              )}
            </div>
          </div>
        )}

        {isSuccess && (
          <>
            <ResultTabs data={result as IdentifySuccessResponse & Record<string, unknown>} />
            {observationId && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push(`/observations/${observationId}`)}
                  style={{ display: 'inline-flex', padding: '0.7rem 1.5rem' }}
                >
                  {t('View Observation', 'Ver Observacion')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
