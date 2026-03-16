'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import type { Observation } from '@/lib/types';
import { CheckIcon, XIcon, EditIcon } from '@/components/icons';

interface ReviewQueueProps {
  observations: Observation[];
}

export function ReviewQueue({ observations }: ReviewQueueProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [correctMode, setCorrectMode] = useState<string | null>(null);
  const [corrections, setCorrections] = useState({
    commonName: '',
    nombreComun: '',
    scientificName: '',
  });

  const handleAction = async (id: string, action: 'approve' | 'reject', notes?: string, correctionData?: Record<string, string>) => {
    setProcessingId(id);
    try {
      const body: Record<string, unknown> = { action };
      if (notes) body.notes = notes;
      if (correctionData) body.corrections = correctionData;

      const res = await fetch(`/api/review/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Review action failed');
        return;
      }

      // Refresh the page to update the queue
      router.refresh();
    } finally {
      setProcessingId(null);
      setRejectNotes('');
      setCorrectMode(null);
    }
  };

  if (observations.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="dashboard-empty-card">
          <h2>{t('All Caught Up', 'Todo al Dia')}</h2>
          <p>
            {t(
              'No observations are waiting for review. New submissions will appear here automatically.',
              'No hay observaciones esperando revision. Las nuevas aparecerán aqui automaticamente.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-queue">
      {observations.map((obs) => {
        const isExpanded = expandedId === obs.id;
        const isProcessing = processingId === obs.id;
        const isCorrecting = correctMode === obs.id;
        const date = new Date(obs.createdAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const location = obs.locationInfo?.displayName || (
          obs.latitude != null ? `${obs.latitude.toFixed(4)}, ${obs.longitude?.toFixed(4)}` : null
        );

        return (
          <div key={obs.id} className={`review-card ${isProcessing ? 'processing' : ''}`}>
            <div
              className="review-card-summary"
              onClick={() => setExpandedId(isExpanded ? null : obs.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={obs.imageUrl}
                alt={obs.commonName || 'Observation'}
                className="review-thumb"
              />
              <div className="review-info">
                <div className="review-species">{obs.commonName || 'Unknown'}</div>
                {obs.scientificName && (
                  <div className="review-sci">{obs.scientificName}</div>
                )}
                <div className="review-meta">
                  {obs.confidence != null && <span>{obs.confidence}% confidence</span>}
                  {location && <span>{location}</span>}
                </div>
                <div className="review-date">{date}</div>
              </div>
            </div>

            {isExpanded && (
              <div className="review-expanded">
                {/* Full-size image */}
                <div className="review-image-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={obs.imageUrl} alt={obs.commonName || 'Observation'} />
                </div>

                {/* AI identification details */}
                <div className="review-details">
                  {obs.description && (
                    <div className="review-description">
                      <strong>{t('AI Description:', 'Descripcion IA:')}</strong> {obs.description}
                    </div>
                  )}
                  {obs.taxonomy && (
                    <div className="review-taxonomy">
                      <strong>{t('Taxonomy:', 'Taxonomia:')}</strong>{' '}
                      {obs.taxonomy.order} &gt; {obs.taxonomy.family} &gt; {obs.taxonomy.genus}
                    </div>
                  )}
                  {obs.conservation && (
                    <div className="review-conservation">
                      <strong>IUCN:</strong> {obs.conservation.iucn_status || 'Unknown'}
                    </div>
                  )}
                  {obs.environmentNotes && (
                    <div className="review-env-notes">
                      <strong>{t('Field Notes:', 'Notas de Campo:')}</strong> {obs.environmentNotes}
                    </div>
                  )}
                </div>

                {/* Correction mode */}
                {isCorrecting && (
                  <div className="review-corrections">
                    <h4>{t('Correct Identification', 'Corregir Identificacion')}</h4>
                    <div className="review-correction-fields">
                      <label>
                        {t('Common Name (EN)', 'Nombre Comun (EN)')}
                        <input
                          type="text"
                          value={corrections.commonName}
                          onChange={(e) => setCorrections(c => ({ ...c, commonName: e.target.value }))}
                          placeholder={obs.commonName || ''}
                        />
                      </label>
                      <label>
                        {t('Common Name (ES)', 'Nombre Comun (ES)')}
                        <input
                          type="text"
                          value={corrections.nombreComun}
                          onChange={(e) => setCorrections(c => ({ ...c, nombreComun: e.target.value }))}
                          placeholder={obs.nombreComun || ''}
                        />
                      </label>
                      <label>
                        {t('Scientific Name', 'Nombre Cientifico')}
                        <input
                          type="text"
                          value={corrections.scientificName}
                          onChange={(e) => setCorrections(c => ({ ...c, scientificName: e.target.value }))}
                          placeholder={obs.scientificName || ''}
                        />
                      </label>
                    </div>
                    <div className="review-actions">
                      <button
                        className="btn btn-primary"
                        disabled={isProcessing}
                        onClick={() => {
                          const correctionData: Record<string, string> = {};
                          if (corrections.commonName) correctionData.commonName = corrections.commonName;
                          if (corrections.nombreComun) correctionData.nombreComun = corrections.nombreComun;
                          if (corrections.scientificName) correctionData.scientificName = corrections.scientificName;
                          handleAction(obs.id, 'approve', 'Corrected by reviewer', Object.keys(correctionData).length > 0 ? correctionData : undefined);
                        }}
                      >
                        <CheckIcon className="icon icon-sm" />
                        {t('Correct & Approve', 'Corregir y Aprobar')}
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          setCorrectMode(null);
                          setCorrections({ commonName: '', nombreComun: '', scientificName: '' });
                        }}
                      >
                        {t('Cancel', 'Cancelar')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject mode */}
                {expandedId === obs.id && !isCorrecting && rejectNotes !== '' && (
                  <div className="review-reject-form">
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder={t('Reason for rejection...', 'Razon del rechazo...')}
                      rows={3}
                      className="review-reject-textarea"
                    />
                    <div className="review-actions">
                      <button
                        className="btn btn-danger"
                        disabled={isProcessing || !rejectNotes.trim()}
                        onClick={() => handleAction(obs.id, 'reject', rejectNotes)}
                      >
                        <XIcon className="icon icon-sm" />
                        {t('Confirm Rejection', 'Confirmar Rechazo')}
                      </button>
                      <button className="btn" onClick={() => setRejectNotes('')}>
                        {t('Cancel', 'Cancelar')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!isCorrecting && rejectNotes === '' && (
                  <div className="review-actions">
                    <button
                      className="btn btn-primary"
                      disabled={isProcessing}
                      onClick={() => handleAction(obs.id, 'approve')}
                    >
                      <CheckIcon className="icon icon-sm" />
                      {t('Approve', 'Aprobar')}
                    </button>
                    <button
                      className="btn"
                      disabled={isProcessing}
                      onClick={() => {
                        setCorrectMode(obs.id);
                        setCorrections({
                          commonName: obs.commonName || '',
                          nombreComun: obs.nombreComun || '',
                          scientificName: obs.scientificName || '',
                        });
                      }}
                    >
                      <EditIcon className="icon icon-sm" />
                      {t('Correct', 'Corregir')}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={isProcessing}
                      onClick={() => setRejectNotes(' ')}
                    >
                      <XIcon className="icon icon-sm" />
                      {t('Reject', 'Rechazar')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
