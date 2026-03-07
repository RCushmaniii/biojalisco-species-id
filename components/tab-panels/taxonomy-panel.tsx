import { useLanguage } from '@/hooks/use-language';
import type { Taxonomy, GBIFData } from '@/lib/types';

const RANKS: { key: keyof Taxonomy; label: string }[] = [
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'phylum', label: 'Phylum' },
  { key: 'class', label: 'Class' },
  { key: 'order', label: 'Order' },
  { key: 'family', label: 'Family' },
  { key: 'genus', label: 'Genus' },
  { key: 'species', label: 'Species' },
];

export function TaxonomyPanel({
  taxonomy,
  gbif,
}: {
  taxonomy: Taxonomy;
  gbif?: GBIFData | null;
}) {
  const { t } = useLanguage();

  return (
    <>
      {gbif?.taxonomy && (
        <div className="verified-banner">
          {t('Taxonomy verified by GBIF', 'Taxonomia verificada por GBIF')}
        </div>
      )}
      <ul className="taxonomy-tree">
        {RANKS.map(
          ({ key, label }) =>
            taxonomy[key] && (
              <li key={key}>
                <span className="tax-rank">{label}</span>
                <span
                  className={`tax-name ${
                    key === 'species' || key === 'genus' ? 'species-name' : ''
                  }`}
                >
                  {taxonomy[key]}
                </span>
              </li>
            )
        )}
      </ul>
    </>
  );
}
