'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Geography } from '@/lib/types';

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

export function GeographyPanel({ geography }: { geography: Geography }) {
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
      </div>
      {geography.native_range && (
        <div className="info-row">
          <span className="info-label">{t('Native range', 'Rango nativo')}</span>
          <span className="info-value">{geography.native_range}</span>
        </div>
      )}
    </>
  );
}
