'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Conservation, GBIFData, EncicloVidaData } from '@/lib/types';

function iucnClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('least concern') || s.includes('preocupación menor')) return 'status-lc';
  if (s.includes('near threatened') || s.includes('casi amenazad')) return 'status-nt';
  if (s.includes('vulnerable')) return 'status-vu';
  if (s.includes('endangered') || s.includes('peligro')) return 'status-en';
  if (s.includes('critically') || s.includes('crítico')) return 'status-cr';
  if (s.includes('domestic')) return 'status-dom';
  return 'status-default';
}

export function ConservationPanel({
  conservation,
  gbif,
  enciclovida,
}: {
  conservation: Conservation;
  gbif?: GBIFData | null;
  enciclovida?: EncicloVidaData | null;
}) {
  const { t } = useLanguage();

  const trendCls =
    conservation.population_trend?.toLowerCase() === 'increasing'
      ? 'trend-up'
      : conservation.population_trend?.toLowerCase() === 'decreasing'
        ? 'trend-down'
        : 'trend-stable';

  const trendArrow =
    conservation.population_trend?.toLowerCase() === 'increasing'
      ? '\u2191'
      : conservation.population_trend?.toLowerCase() === 'decreasing'
        ? '\u2193'
        : '\u2192';

  const hasGbifIucn = gbif?.iucnCategory;

  return (
    <>
      {conservation.iucn_status && (
        <>
          <div className={`conservation-status ${iucnClass(conservation.iucn_status)}`}>
            {conservation.iucn_status}
          </div>
          {hasGbifIucn && (
            <span className="verified-badge">
              {t('IUCN Verified', 'UICN Verificado')}
            </span>
          )}
          <br />
        </>
      )}

      {enciclovida?.nom059Status && (
        <div className="nom059-badge">
          <strong>NOM-059-SEMARNAT</strong>
          <span>{enciclovida.nom059Status}</span>
        </div>
      )}

      {enciclovida && enciclovida.characteristics.length > 0 && (
        <div className="info-row">
          <span className="info-label">CONABIO</span>
          <span className="info-value">
            {enciclovida.characteristics.join(' · ')}
          </span>
        </div>
      )}

      {conservation.population_trend && (
        <div className="info-row">
          <span className="info-label">{t('Trend', 'Tendencia')}</span>
          <span className="info-value">
            <span className={`trend-indicator ${trendCls}`}>
              {trendArrow} {conservation.population_trend}
            </span>
          </span>
        </div>
      )}
      {conservation.threats && (
        <div className="info-row">
          <span className="info-label">{t('Threats', 'Amenazas')}</span>
          <span className="info-value">{conservation.threats}</span>
        </div>
      )}

      <div className="info-row">
        <span className="info-label">{t('Sources', 'Fuentes')}</span>
        <span className="info-value" style={{ display: 'flex', gap: '0.75rem' }}>
          {gbif?.gbifUrl && (
            <a href={gbif.gbifUrl} target="_blank" rel="noopener noreferrer" className="gbif-link">GBIF</a>
          )}
          {enciclovida?.enciclovidaUrl && (
            <a href={enciclovida.enciclovidaUrl} target="_blank" rel="noopener noreferrer" className="gbif-link">EncicloVida</a>
          )}
        </span>
      </div>
    </>
  );
}
