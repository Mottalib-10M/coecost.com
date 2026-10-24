import { route, hasRoute, type Locale } from './routes';
import { GUIDES, guideById } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  en: { home: 'COE price today', method: 'Method', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
  zh: { home: '今日拥车证价格', method: '计算方法', about: '关于本站', widget: '嵌入计算器', contact: '联系', editorial: '编辑方针', privacy: '隐私', terms: '法律声明', cookies: 'Cookie' },
};
export const GROUPS: Array<{ id: Group; label: Record<Locale, string> }> = [
  { id: 'coe', label: { en: 'COE results and bidding', zh: '拥车证结果与竞标' } },
  { id: 'buy', label: { en: 'Buying: ARF, OMV, loan', zh: '买车：附加注册费、OMV、贷款' } },
  { id: 'own', label: { en: 'Owning: road tax, yearly cost', zh: '养车：路税与每年成本' } },
  { id: 'end', label: { en: 'Year 10: renew or scrap', zh: '第十年：续期还是报废' } },
];
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? guideById(id)?.[lang]?.nav ?? guideById(id)?.en.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
export const inGroup = (g: Group, lang: Locale): NavLink[] => GUIDES.filter((p) => p.group === g && hasRoute(p.id, lang)).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: { en: { coe: 'COE', buy: 'Buying', own: 'Owning', end: 'Renew or scrap' }, zh: { coe: '拥车证', buy: '买车', own: '养车', end: '续期或报废' } }[lang][g.id], links: inGroup(g.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.slice(0, 3).map((g) => ({ label: g.label[lang], links: inGroup(g.id, lang).concat(g.id === 'own' ? inGroup('end', lang) : []) })),
  { label: lang === 'zh' ? '本站' : 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', ...(hasRoute('widget', lang) ? ['widget'] : []), 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** Les pages les plus cherchées, à un clic de toute page (RECETTE §18.2). */
export const popularLinks = (lang: Locale): NavLink[] => ['coe-results', 'coe-bidding', 'road-tax-renewal', 'coe-renewal', 'parf-rebate'].filter((id) => hasRoute(id, lang)).map((id) => link(id, lang));
