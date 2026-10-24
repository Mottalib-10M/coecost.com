/**
 * Une page = UN fichier de contenu (CONTRIBUTING-PAGES.md) : `src/content/guides/<id>.ts`, version anglaise (`en`)
 * et, quand la page a une jumelle chinoise, version chinoise (`zh`). Routes, menus, pied de page, sitemap, hreflang,
 * schémas et liens internes lisent ces fichiers et rien d'autre.
 */
import type { Lang } from './format';

export interface FAQ { q: string; a: string }
export interface MiniOpts { /** titre */ t?: string; /** champs montrés */ p?: string[]; /** valeurs par défaut */ d?: Record<string, number | string>; /** texte du lien */ c?: string }

export interface Helpers {
  lang: Lang;
  /** Lien interne par id de page, dans la langue de la page (repli sur l'anglais si la page n'existe pas en chinois). */
  a: (id: string, text: string) => string;
  /** Tableau ; les nombres sont formatés dans la langue, les chaînes insérées en HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Lien vers une source de params-2026.json (clé). */
  src: (key: string, text?: string) => string;
  ext: (url: string, text: string) => string;
  box: (title: string, html: string) => string;
  /** Mini-simulateur bâti sur un simulateur de tool-specs.ts. */
  mini: (kind: string, opts?: MiniOpts) => string;
  /** Montant en dollars de Singapour, nombre, pour cent, écart signé, date. */
  m: (x: number, d?: number) => string; n: (x: number, d?: number) => string; pct: (x: number, d?: number) => string; sg: (x: number) => string; day: (iso: string) => string;
}

export type Group = 'coe' | 'buy' | 'own' | 'end';

export interface LangPage {
  /** Segment d'URL, minuscules et tirets, sans accent. */
  slug: string;
  nav: string; card: string;
  /** en : 50 à 60 caractères ; zh : 24 à 40. Terme clé d'abord, année comprise (RECETTE §11). */
  title: string;
  /** en : 150 à 160 caractères ; zh : 70 à 120. Année comprise. */
  description: string;
  h1: string; intro: string;
  /** UN paragraphe de 120 mots ou plus (zh : 300 caractères ou plus) : la réponse directe, chiffrée (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
}
export interface GuideDef {
  id: string; group: Group; order: number;
  /** Simulateur en tête : une clé de tool-specs.ts. */
  tool: string;
  toolArg?: Record<string, number | string>;
  related: string[];
  /** Clés de params-2026.json > sources. */
  sources: string[];
  en: LangPage;
  /** Version chinoise facultative : la page n'existe alors qu'en anglais (routes partielles). */
  zh?: LangPage;
}
export const defineGuide = (p: GuideDef): GuideDef => p;
