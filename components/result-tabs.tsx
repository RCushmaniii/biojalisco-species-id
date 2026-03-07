'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ConfidenceGauge } from './confidence-gauge';
import { OverviewPanel } from './tab-panels/overview-panel';
import { TaxonomyPanel } from './tab-panels/taxonomy-panel';
import { EcologyPanel } from './tab-panels/ecology-panel';
import { GeographyPanel } from './tab-panels/geography-panel';
import { ConservationPanel } from './tab-panels/conservation-panel';
import { SimilarPanel } from './tab-panels/similar-panel';
import type { IdentifySuccessResponse } from '@/lib/types';

interface ResultTabsProps {
  data: IdentifySuccessResponse;
}

export function ResultTabs({ data }: ResultTabsProps) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

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
    // Scroll the tab bar into view so the user always sees navigation + content start
    requestAnimationFrame(() => {
      stickyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  const tabs = [
    { key: 'overview', label: t('Overview', 'General') },
    { key: 'taxonomy', label: t('Taxonomy', 'Taxonomia') },
    { key: 'ecology', label: t('Ecology', 'Ecologia') },
    { key: 'geography', label: t('Range', 'Rango') },
    { key: 'conservation', label: t('Conservation', 'Conservacion') },
  ];

  if (data.similar_species && data.similar_species.length > 0) {
    tabs.push({ key: 'similar', label: t('Similar', 'Similares') });
  }

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
        <div className={`tab-panel ${activeTab === 'overview' ? 'active' : ''}`}>
          <OverviewPanel data={data} />
        </div>
        <div className={`tab-panel ${activeTab === 'taxonomy' ? 'active' : ''}`}>
          <TaxonomyPanel taxonomy={data.taxonomy} gbif={data.gbif} />
        </div>
        <div className={`tab-panel ${activeTab === 'ecology' ? 'active' : ''}`}>
          <EcologyPanel ecology={data.ecology} />
        </div>
        <div className={`tab-panel ${activeTab === 'geography' ? 'active' : ''}`}>
          <GeographyPanel geography={data.geography} gbif={data.gbif} />
        </div>
        <div className={`tab-panel ${activeTab === 'conservation' ? 'active' : ''}`}>
          <ConservationPanel conservation={data.conservation} gbif={data.gbif} enciclovida={data.enciclovida} />
        </div>
        {data.similar_species && data.similar_species.length > 0 && (
          <div className={`tab-panel ${activeTab === 'similar' ? 'active' : ''}`}>
            <SimilarPanel species={data.similar_species} />
          </div>
        )}
      </div>
    </div>
  );
}
