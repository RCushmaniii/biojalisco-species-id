'use client';

import { useLanguage } from '@/hooks/use-language';
import type { GBIFData, EncicloVidaData, ImageMetadata, LocationInfo, GpsSource } from '@/lib/types';

function GpsProvenanceBadge({ source }: { source: GpsSource }) {
  const { t } = useLanguage();

  if (!source) return null;

  const labels: Record<string, { en: string; es: string; className: string }> = {
    exif: { en: 'From photo metadata', es: 'De metadatos de foto', className: 'gps-badge-exif' },
    browser: { en: 'From browser location', es: 'De ubicacion del navegador', className: 'gps-badge-browser' },
    user: { en: 'User-provided location', es: 'Ubicacion proporcionada', className: 'gps-badge-user' },
  };

  const info = labels[source];
  if (!info) return null;

  return (
    <span className={`gps-provenance-badge ${info.className}`}>
      {t(info.en, info.es)}
    </span>
  );
}

export function DataSourcesPanel({
  gbif,
  enciclovida,
  imageMetadata,
  locationInfo,
  gpsSource,
  latitude,
  longitude,
}: {
  gbif?: GBIFData | null;
  enciclovida?: EncicloVidaData | null;
  imageMetadata?: ImageMetadata | null;
  locationInfo?: LocationInfo | null;
  gpsSource?: GpsSource;
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
            {locationInfo?.country && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Country', 'Pais')}</span>
                <span className="data-source-value">{locationInfo.country}</span>
              </div>
            )}
            {locationInfo?.state && (
              <div className="data-source-item">
                <span className="data-source-label">{t('State', 'Estado')}</span>
                <span className="data-source-value">{locationInfo.state}</span>
              </div>
            )}
            {locationInfo?.region && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Region', 'Region')}</span>
                <span className="data-source-value">{locationInfo.region}</span>
              </div>
            )}
            {locationInfo?.municipality && (
              <div className="data-source-item">
                <span className="data-source-label">{t('Municipality', 'Municipio')}</span>
                <span className="data-source-value">{locationInfo.municipality}</span>
              </div>
            )}
            {locationInfo?.city && (
              <div className="data-source-item">
                <span className="data-source-label">{t('City / Town', 'Ciudad / Pueblo')}</span>
                <span className="data-source-value">{locationInfo.city}</span>
              </div>
            )}
            {latitude != null && longitude != null && (
              <div className="data-source-item">
                <span className="data-source-label">
                  GPS
                  {gpsSource && <GpsProvenanceBadge source={gpsSource} />}
                </span>
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
