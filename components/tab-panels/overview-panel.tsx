'use client';

import { useLanguage } from '@/hooks/use-language';
import type { IdentifySuccessResponse } from '@/lib/types';

export function OverviewPanel({ data }: { data: IdentifySuccessResponse }) {
  const { lang, t } = useLanguage();
  const desc = lang === 'es' ? (data.descripcion || data.description) : data.description;

  return (
    <>
      <div className="desc-block">{desc}</div>
      {data.fun_fact && (
        <div className="fun-fact">
          <strong>{t('Fun fact: ', 'Dato curioso: ')}</strong>
          {data.fun_fact}
        </div>
      )}
    </>
  );
}
