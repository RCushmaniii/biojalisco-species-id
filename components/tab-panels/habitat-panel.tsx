'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Ecology, Geography, GBIFData } from '@/lib/types';

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

export function HabitatPanel({
  ecology,
  geography,
  gbif,
}: {
  ecology: Ecology;
  geography: Geography;
  gbif?: GBIFData | null;
}) {
  const { t } = useLanguage();

  return (
    <>
      {ecology.habitat && (
        <div className="info-row">
          <span className="info-label">{t('Habitat', 'Habitat')}</span>
          <span className="info-value">{ecology.habitat}</span>
        </div>
      )}

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
      )}
    </>
  );
}
