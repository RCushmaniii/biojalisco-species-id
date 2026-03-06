'use client';

import { createContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (en: string, es: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = useCallback(
    (en: string, es: string) => (lang === 'es' ? es : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
