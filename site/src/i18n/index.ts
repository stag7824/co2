// JSON-driven i18n. Add a new language by:
//   1. Dropping a new file at src/i18n/locales/<code>.json (mirror the de/en shape)
//   2. Adding the code to `locales` below
//   3. Optionally to astro.config.mjs i18n.locales (if you want a /<code>/ route)
//
// `t(lang, "a.b.c")` resolves nested keys; falls back to the default locale.

import de from './locales/de.json';
import en from './locales/en.json';

export const defaultLang = 'de' as const;

// All known languages (UI-only — Astro routing locales are configured separately).
export const locales = { de, en } as const;

export type Lang = keyof typeof locales;

export const languageNames: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
};

type Dict = typeof de;

function resolve(obj: unknown, key: string): unknown {
  // Walk dot-segmented path; at every level also accept the *remaining* path
  // as a literal flat key (so `"scenario.bau"` works inside the `charts` object).
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key];
  }
  const parts = key.split('.');
  let cur: unknown = obj;
  for (let i = 0; i < parts.length; i++) {
    if (!cur || typeof cur !== 'object') return undefined;
    const o = cur as Record<string, unknown>;
    const remaining = parts.slice(i).join('.');
    if (remaining in o) return o[remaining];
    if (parts[i] in o) {
      cur = o[parts[i]];
      continue;
    }
    return undefined;
  }
  return cur;
}

export function t(lang: Lang, key: string): string {
  const primary = resolve(locales[lang], key);
  if (typeof primary === 'string') return primary;
  const fallback = resolve(locales[defaultLang], key);
  if (typeof fallback === 'string') return fallback;
  // Surface missing keys loudly during dev so they get caught.
  return `‹missing:${key}›`;
}

/** Returns nested value (string, array, object) — for non-string keys like ringLabels. */
export function tRaw<T = unknown>(lang: Lang, key: string): T | undefined {
  const v = resolve(locales[lang], key);
  if (v !== undefined) return v as T;
  return resolve(locales[defaultLang], key) as T | undefined;
}

/** Path prefix — '' for default locale, '/<code>' otherwise. */
export function localePrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

/** Get the full dictionary — use sparingly (e.g. when passing to React islands). */
export function dict(lang: Lang): Dict {
  return locales[lang] as unknown as Dict;
}
