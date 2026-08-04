/**
 * i18n for OpenCode Go HUD
 */

import type { Language } from '../types.js';
import type { Translations } from './en.js';
import { en } from './en.js';
import { zh } from './zh.js';

const translations: Record<Language, Translations> = {
  en,
  zh,
};

export function t(lang: Language): Translations {
  return translations[lang] ?? translations.en;
}

export { en, zh };
export type { Translations };
