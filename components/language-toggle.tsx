'use client';

import { useLanguage } from '@/hooks/use-language';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-toggle">
      <button
        className={`lang-btn ${lang === 'es' ? 'active' : ''}`}
        onClick={() => setLang('es')}
      >
        ES
      </button>
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
