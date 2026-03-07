'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Geography, GBIFData } from '@/lib/types';

function GeoBadge({ label, value }: { label: string; value: boolean | undefined }) {
  const { lang } = useLanguage();
  const cls = value === true ? 'yes' : value === false ? 'no' : 'unknown';
  const txt =
    value === true
      ? lang === 'es'
        ? 'Si'
        : 'Yes'
      : value === false
        ? 'No'
        : '?';

  return (
    <div className={`geo-badge ${cls}`}>
      <span className="dot" />
      {label}: {txt}
    </div>
  );
}

export function GeographyPanel({
  geography,
  gbif,
}: {
  geography: Geography;
  gbif?: GBIFData | null;
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="geo-badges">
        <GeoBadge label="Jalisco" value={geography.found_in_jalisco} />
        <GeoBadge label={t('Mexico', 'Mexico')} value={geography.found_in_mexico} />
        {geography.invasive === true && (
          <div className="geo-badge no">
            <span className="dot" />
            {t('Invasive', 'Invasora')}
          </div>
        )}
        {gbif?.establishmentMeans && (
          <div className="geo-badge yes">
            <span className="dot" />
            {gbif.establishmentMeans === 'native'
              ? t('Native', 'Nativa')
              : gbif.establishmentMeans}
          </div>
        )}
      </div>
      {geography.native_range && (
        <div className="info-row">
          <span className="info-label">{t('Native range', 'Rango nativo')}</span>
          <span className="info-value">{geography.native_range}</span>
        </div>
      )}
      {gbif && gbif.distributions.length > 0 && (
        <>
          <div className="info-row" style={{ flexDirection: 'column', gap: '0.4rem' }}>
            <span className="info-label">
              {t('Verified Distribution', 'Distribucion Verificada')}
              <span className="verified-badge" style={{ marginLeft: '0.5rem' }}>GBIF</span>
            </span>
            <span className="info-value" style={{ textAlign: 'left' }}>
              {gbif.distributions.map((d, i) => (
                <div key={i} style={{ marginBottom: '0.3rem', lineHeight: 1.5 }}>{d}</div>
              ))}
            </span>
          </div>
        </>
      )}
      {gbif?.gbifUrl && (
        <div className="info-row">
          <span className="info-label">{t('Source', 'Fuente')}</span>
          <span className="info-value">
            <a href={gbif.gbifUrl} target="_blank" rel="noopener noreferrer" className="gbif-link">
              GBIF
            </a>
          </span>
        </div>
      )}
    </>
  );
}
