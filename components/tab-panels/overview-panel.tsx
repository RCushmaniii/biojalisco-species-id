'use client';

import { useLanguage } from '@/hooks/use-language';
import type { IdentifySuccessResponse } from '@/lib/types';

export function OverviewPanel({ data }: { data: IdentifySuccessResponse }) {
  const { lang, t } = useLanguage();
  const desc = lang === 'es' ? (data.descripcion || data.description) : data.description;
  const ev = data.enciclovida;

  return (
    <>
      {ev && ev.distributionTypes.length > 0 && (
        <div className="ev-badges">
          {ev.distributionTypes.map((type) => (
            <span
              key={type}
              className={`ev-badge ${type.toLowerCase().includes('endém') ? 'ev-endemic' : type.toLowerCase().includes('nativa') ? 'ev-native' : type.toLowerCase().includes('exót') || type.toLowerCase().includes('invasor') ? 'ev-exotic' : ''}`}
            >
              {type}
            </span>
          ))}
          <span className="ev-badge ev-source">CONABIO</span>
        </div>
      )}

      <div className="desc-block">{desc}</div>

      {ev?.wikipediaSummary && lang === 'es' && (
        <div className="desc-block ev-wiki">
          <span className="ev-wiki-label">Wikipedia</span>
          {ev.wikipediaSummary}
        </div>
      )}

      {data.fun_fact && (
        <div className="fun-fact">
          <strong>{t('Fun fact: ', 'Dato curioso: ')}</strong>
          {data.fun_fact}
        </div>
      )}

      {ev?.nom059Status && (
        <div className="nom059-badge">
          <strong>NOM-059-SEMARNAT</strong>
          <span>{ev.nom059Status}</span>
        </div>
      )}

      {ev?.enciclovidaUrl && (
        <div className="ev-link-row">
          <a href={ev.enciclovidaUrl} target="_blank" rel="noopener noreferrer" className="gbif-link">
            {t('View on EncicloVida (CONABIO)', 'Ver en EncicloVida (CONABIO)')}
          </a>
        </div>
      )}
    </>
  );
}
