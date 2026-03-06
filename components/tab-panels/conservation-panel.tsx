'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Conservation } from '@/lib/types';

function iucnClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('least concern')) return 'status-lc';
  if (s.includes('near threatened')) return 'status-nt';
  if (s.includes('vulnerable')) return 'status-vu';
  if (s.includes('endangered')) return 'status-en';
  if (s.includes('critically')) return 'status-cr';
  if (s.includes('domestic')) return 'status-dom';
  return 'status-default';
}

export function ConservationPanel({ conservation }: { conservation: Conservation }) {
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

  return (
    <>
      {conservation.iucn_status && (
        <>
          <div className={`conservation-status ${iucnClass(conservation.iucn_status)}`}>
            {conservation.iucn_status}
          </div>
          <br />
        </>
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
    </>
  );
}
