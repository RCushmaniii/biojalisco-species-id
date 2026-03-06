'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useGeolocation } from '@/hooks/use-geolocation';
import { CaptureArea } from '@/components/capture-area';
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

  const handleIdentify = async (imageData: string) => {
    setIsLoading(true);
    setResult(null);
    setObservationId(null);

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: imageData,
          latitude: position?.latitude ?? null,
          longitude: position?.longitude ?? null,
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
            <ResultTabs data={result as IdentifySuccessResponse} />
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
