import { makeRouter, type RouteDef } from './routes-core';
import { GUIDES } from '../lib/pages';
/** Anglais d'abord (langue de travail de Singapour), chinois simplifié sur les pages qui pèsent le plus :
 *  routes partielles, hreflang limité aux paires réelles. */
export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
const R = (id: string, en: string, zh: string | null, noindex = false): RouteDef<Locale> => ({ id, paths: { en: `/en/${en}/`, ...(zh ? { zh: `/zh/${zh}/` } : {}) }, ...(noindex ? { noindex } : {}) });
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { en: '/en/', zh: '/zh/' } },
  R('method', 'method', 'method'),
  R('about', 'about', 'about'),
  R('widget', 'widget', null, true),
  R('contact', 'contact', 'contact', true),
  R('editorial', 'editorial-policy', 'editorial-policy', true),
  R('privacy', 'privacy', 'privacy', true),
  R('terms', 'legal-notice', 'legal-notice', true),
  R('cookies', 'cookies', 'cookies', true),
];
const G = (g: (typeof GUIDES)[number]): RouteDef<Locale> => ({ id: g.id, paths: { en: `/en/${g.en.slug}/`, ...(g.zh ? { zh: `/zh/${g.zh.slug}/` } : {}) } });
export const ROUTES: RouteDef<Locale>[] = [CORE[0], ...GUIDES.map(G), ...CORE.slice(1)];
export const { NOINDEX_PATHS, route, hasRoute, altPaths } = makeRouter(LOCALES, ROUTES);
