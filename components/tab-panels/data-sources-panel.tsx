'use client';

import { useLanguage } from '@/hooks/use-language';
import type { GBIFData, EncicloVidaData, ImageMetadata, LocationInfo } from '@/lib/types';

export function DataSourcesPanel({
  gbif,
  enciclovida,
  imageMetadata,
  locationInfo,
  latitude,
  longitude,
}: {
  gbif?: GBIFData | null;
  enciclovida?: EncicloVidaData | null;
  imageMetadata?: ImageMetadata | null;
  locationInfo?: LocationInfo | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const { t } = useLanguage();

  const hasImageData = imageMetadata?.dateTaken || imageMetadata?.cameraMake || imageMetadata?.cameraModel;
  const hasLocation = locationInfo || (latitude != null && longitude != null);

  return (
    <>
      {(hasImageData || hasLocation) && (
        <div className="data-source-section">
          <h4 className="data-source-heading">{t('Image & Location', 'Imagen y Ubicacion')}</h4>
          <div className="data-source-grid">
            {imageMetadata?.dateTaken && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Date Taken', 'Fecha de Captura')}</span>
                <span className="data-source-value">
                  {new Date(imageMetadata.dateTaken).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {imageMetadata?.cameraMake && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Camera', 'Camara')}</span>
                <span className="data-source-value">
                  {[imageMetadata.cameraMake, imageMetadata.cameraModel].filter(Boolean).join(' ')}
                </span>
              </div>
            )}
            {locationInfo && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Location', 'Ubicacion')}</span>
                <span className="data-source-value">{locationInfo.displayName}</span>
              </div>
            )}
            {latitude != null && longitude != null && (
              <div className="data-source-item">
                <span className="data-source-label">GPS</span>
                <span className="data-source-value">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {gbif && (
        <div className="data-source-section">
          <h4 className="data-source-heading">
            GBIF
            {gbif.matchConfidence > 0 && (
              <span className="data-source-confidence">
                {t('Match', 'Coincidencia')}: {gbif.matchConfidence}%
              </span>
            )}
          </h4>
          <div className="data-source-grid">
            {gbif.iucnStatus && (
              <div className="data-source-item">
                <span className="data-source-label">{t('IUCN Status', 'Estado UICN')}</span>
                <span className="data-source-value">{gbif.iucnStatus}</span>
              </div>
            )}
            {gbif.vernacularNames.en && (
              <div className="data-source-item">
                <span className="data-source-label">{t('English Name', 'Nombre Ingles')}</span>
                <span className="data-source-value">{gbif.vernacularNames.en}</span>
              </div>
            )}
            {gbif.vernacularNames.es && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Spanish Name', 'Nombre Espanol')}</span>
                <span className="data-source-value">{gbif.vernacularNames.es}</span>
              </div>
            )}
            {gbif.establishmentMeans && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Establishment', 'Establecimiento')}</span>
                <span className="data-source-value">{gbif.establishmentMeans}</span>
              </div>
            )}
          </div>
          {gbif.gbifUrl && (
            <a href={gbif.gbifUrl} target="_blank" rel="noopener noreferrer" className="gbif-link data-source-link">
              {t('View on GBIF', 'Ver en GBIF')}
            </a>
          )}
        </div>
      )}

      {enciclovida && (
        <div className="data-source-section">
          <h4 className="data-source-heading">EncicloVida (CONABIO)</h4>
          <div className="data-source-grid">
            {enciclovida.commonNameEs && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Common Name', 'Nombre Comun')}</span>
                <span className="data-source-value">{enciclovida.commonNameEs}</span>
              </div>
            )}
            {enciclovida.distributionTypes.length > 0 && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Distribution', 'Distribucion')}</span>
                <span className="data-source-value">{enciclovida.distributionTypes.join(', ')}</span>
              </div>
            )}
            {enciclovida.nom059Status && (
              <div className="data-source-item">
                <span className="data-source-label">NOM-059</span>
                <span className="data-source-value">{enciclovida.nom059Status}</span>
              </div>
            )}
            {enciclovida.allCommonNames.length > 1 && (
              <div className="data-source-item full-width">
                <span className="data-source-label">{t('All Names', 'Todos los Nombres')}</span>
                <span className="data-source-value">{enciclovida.allCommonNames.join(', ')}</span>
              </div>
            )}
            {enciclovida.geodataSources.length > 0 && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Geodata', 'Geodatos')}</span>
                <span className="data-source-value">{enciclovida.geodataSources.join(', ')}</span>
              </div>
            )}
          </div>
          {enciclovida.enciclovidaUrl && (
            <a href={enciclovida.enciclovidaUrl} target="_blank" rel="noopener noreferrer" className="gbif-link data-source-link">
              {t('View on EncicloVida', 'Ver en EncicloVida')}
            </a>
          )}
        </div>
      )}

      {!gbif && !enciclovida && !hasImageData && !hasLocation && (
        <div className="data-source-empty">
          {t(
            'No external data sources were available for this identification. The result is based on AI analysis only.',
            'No se encontraron fuentes de datos externas para esta identificacion. El resultado se basa solo en analisis de IA.'
          )}
        </div>
      )}
    </>
  );
}
