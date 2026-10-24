/** Outils d'écriture (`Helpers`) passés au corps de chaque page, dans sa langue. */
import { route, ROUTES, hasRoute } from '../i18n/routes';
import type { Helpers, MiniOpts } from './page-types';
import { formatNumber, type Lang } from './format';
import P from '../data/params-2026.json';
import { PLANNED_IDS } from './planned';
import { money, num, pct, signed, day } from './data';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
type Src = { url: string; label: { en: string; zh: string } };
const RAW = (P as unknown as { sources: Record<string, Src> }).sources;
/**
 * Domaines dont les pages ne se lient pas sans autorisation écrite (LTA, OneMotoring, MAS, IRAS :
 * conditions d'utilisation, décision du 2026-10-24, comme ssbtbill.com). On cite l'organisme, le
 * titre, l'adresse en texte non cliquable et la date de lecture. scripts/check-liens-interdits.mjs
 * fait échouer le build si un lien vers ces domaines réapparaît dans dist/.
 */
export const RESTRICTED = /(^|\.)(lta|mas|iras)\.gov\.sg$/i;
export const isRestricted = (url: string) => { try { return RESTRICTED.test(new URL(url).hostname); } catch { return false; } };
/** Adresse affichée en texte : sans le schéma, pour qu'aucun lecteur ni navigateur ne la rende cliquable. */
export const addressText = (url: string) => decodeURI(url).replace(/^https?:\/\//, '');
const READ_ON: Record<Lang, (d: string) => string> = { en: (d) => `read on ${d}`, zh: (d) => `${d}读取` };
const ADDRESS: Record<Lang, string> = { en: 'address, not linked:', zh: '网址（不设链接）：' };
const READ_AT = (P as unknown as { retrieved_at: string }).retrieved_at;
export const SOURCES = (lang: Lang): Record<string, { url: string; label: string; linked: boolean }> =>
  Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, { url: v.url, label: v.label[lang], linked: !isRestricted(v.url) }]));
/** Une source de liste : lien si permis, sinon citation complète en texte. */
export type SourceItem = { name: string; url?: string; address?: string; addressLabel?: string; readOn?: string };
export const sourceList = (keys: string[], lang: Lang): SourceItem[] => {
  const S = SOURCES(lang);
  return keys.map((k) => (S[k].linked ? { name: S[k].label, url: S[k].url } : { name: S[k].label, address: addressText(S[k].url), addressLabel: ADDRESS[lang], readOn: READ_ON[lang](day(READ_AT, lang)) }));
};
/** Citation en texte (HTML) d'une source non liable. */
export const citeHtml = (it: SourceItem) => `${it.name}, ${it.addressLabel} <span class="cite-address" style="overflow-wrap:anywhere">${it.address}</span>, ${it.readOn}`;
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = [], lang: Lang = 'en') {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-700">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 font-semibold text-navy-900 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const ext = (url: string, text: string) => `<a href="${url}" target="_blank" rel="nofollow noopener noreferrer">${text}</a>`;
export function link(id: string, text: string, lang: Lang) {
  if (!ROUTES.some((r) => r.id === id)) { if (process.env.VITEST && !PLANNED_IDS.has(id)) throw new Error(`Unknown page id in link: ${id}`); return text; }
  return hasRoute(id, lang) ? `<a href="${route(id, lang)}">${text}</a>` : `<a href="${route(id, 'en')}" hreflang="en">${text}</a>`;
}
export const box = (title: string, html: string) => `<aside class="boxnote not-prose"><p class="boxnote-title">${title}</p><div class="text-navy-800">${html}</div></aside>`;
export const mini = (kind: string, arg?: MiniOpts) => `<!--mini:${kind}${arg === undefined ? '' : `|${Buffer.from(JSON.stringify(arg)).toString('base64')}`}-->`;
/** Dans le texte : lien si permis ; sinon le nom seul, la citation complète figurant dans la liste des sources de la page. */
export const srcLink = (key: string, lang: Lang, text?: string) => { const s = SOURCES(lang)[key]; if (!s) throw new Error(`Unknown source ${key}`); return s.linked ? ext(s.url, text ?? s.label) : `<span class="cite-nolink">${text ?? s.label}</span>`; };
export function helpers(lang: Lang): Helpers {
  return {
    lang, a: (id, text) => link(id, text, lang),
    table: (hd, rows, cap, al) => table(hd, rows, cap, al, lang),
    src: (key, text) => srcLink(key, lang, text), ext, box, mini,
    m: (x, d = 0) => money(x, lang, d), n: (x, d = 0) => num(x, lang, d), pct: (x, d = 0) => pct(x, lang, d), sg: (x) => signed(x, lang), day: (iso) => day(iso, lang),
  };
}
