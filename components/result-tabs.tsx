'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ConfidenceGauge } from './confidence-gauge';
import { AboutPanel } from './tab-panels/about-panel';
import { HabitatPanel } from './tab-panels/habitat-panel';
import { SimilarPanel } from './tab-panels/similar-panel';
import { TaxonomyPanel } from './tab-panels/taxonomy-panel';
import { ConservationPanel } from './tab-panels/conservation-panel';
import { DataSourcesPanel } from './tab-panels/data-sources-panel';
import type { IdentifySuccessResponse, ImageMetadata, LocationInfo, GpsSource } from '@/lib/types';

type Mode = 'explore' | 'research';

interface ResultTabsProps {
  data: IdentifySuccessResponse & {
    locationInfo?: LocationInfo | null;
    imageMetadata?: ImageMetadata | null;
    gpsSource?: GpsSource;
    elevation?: number | null;
    environmentNotes?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export function ResultTabs({ data }: ResultTabsProps) {
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState<Mode>('explore');
  const [activeTab, setActiveTab] = useState('about');

  const id = data.identification;
  const conf = typeof data.confidence === 'number' ? data.confidence : 75;
  const name = lang === 'es' ? (id.nombre_comun || id.common_name) : id.common_name;

  const tabsRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const checkOverflow = useCallback(() => {
    const el = tabsRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;
    const hasOverflow = el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    wrapper.classList.toggle('has-overflow', hasOverflow);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = tabsRef.current;
    el?.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el?.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    requestAnimationFrame(() => {
      stickyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    // Set default tab for new mode
    setActiveTab(newMode === 'explore' ? 'about' : 'taxonomy');
  }, []);

  const hasSimilar = data.similar_species && data.similar_species.length > 0;

  const exploreTabs = [
    { key: 'about', label: t('About', 'Acerca') },
    { key: 'habitat', label: t('Habitat & Range', 'Habitat y Rango') },
    ...(hasSimilar ? [{ key: 'similar', label: t('Similar', 'Similares') }] : []),
  ];

  const researchTabs = [
    { key: 'taxonomy', label: t('Taxonomy', 'Taxonomia') },
    { key: 'conservation', label: t('Conservation', 'Conservacion') },
    { key: 'sources', label: t('Data Sources', 'Fuentes') },
  ];

  const tabs = mode === 'explore' ? exploreTabs : researchTabs;

  return (
    <div className="result-card visible">
      <div className="result-hero">
        <ConfidenceGauge confidence={conf} />
        <div className="result-id">
          <div className="result-common">{name}</div>
          <div className="result-scientific">{id.scientific_name}</div>
          {id.breed && <div className="result-breed">{id.breed}</div>}
        </div>
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => handleModeChange('explore')}
        >
          {t('Explore', 'Explorar')}
        </button>
        <button
          className={`mode-btn ${mode === 'research' ? 'active' : ''}`}
          onClick={() => handleModeChange('research')}
        >
          {t('Research', 'Investigar')}
        </button>
      </div>

      <div className="tabs-anchor" ref={stickyRef} />
      <div className="tabs-wrapper" ref={wrapperRef}>
        <div className="tabs" ref={tabsRef}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-panels">
        {/* Explore mode panels */}
        <div className={`tab-panel ${activeTab === 'about' ? 'active' : ''}`}>
          <AboutPanel data={data} />
        </div>
        <div className={`tab-panel ${activeTab === 'habitat' ? 'active' : ''}`}>
          <HabitatPanel ecology={data.ecology} geography={data.geography} gbif={data.gbif} />
        </div>
        {hasSimilar && (
          <div className={`tab-panel ${activeTab === 'similar' ? 'active' : ''}`}>
            <SimilarPanel species={data.similar_species} />
          </div>
        )}

        {/* Research mode panels */}
        <div className={`tab-panel ${activeTab === 'taxonomy' ? 'active' : ''}`}>
          <TaxonomyPanel taxonomy={data.taxonomy} gbif={data.gbif} />
        </div>
        <div className={`tab-panel ${activeTab === 'conservation' ? 'active' : ''}`}>
          <ConservationPanel conservation={data.conservation} gbif={data.gbif} enciclovida={data.enciclovida} />
        </div>
        <div className={`tab-panel ${activeTab === 'sources' ? 'active' : ''}`}>
          <DataSourcesPanel
            gbif={data.gbif}
            enciclovida={data.enciclovida}
            imageMetadata={data.imageMetadata}
            locationInfo={data.locationInfo}
            gpsSource={data.gpsSource}
            elevation={data.elevation}
            environmentNotes={data.environmentNotes}
            latitude={data.latitude}
            longitude={data.longitude}
          />
        </div>
      </div>
    </div>
  );
}
