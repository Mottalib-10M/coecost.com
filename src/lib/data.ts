/**
 * Données officielles du site, lues dans src/data/sg/*.json (écrits par `npm run update-data`, Singapore Open Data
 * Licence v1.0) et src/data/params-2026.json (barèmes LTA). Tout chiffre affiché passe par ce module :
 * aucune page ne tape un montant à la main.
 */
import COE_RAW from '../data/sg/coe-results.json';
import PQP_RAW from '../data/sg/pqp.json';
import PARAMS from '../data/params-2026.json';
import { formatMoney, formatNumber, formatPercent, displayDate, type Lang } from './format';

export type Cat = 'A' | 'B' | 'C' | 'D' | 'E';
export const CATS: Cat[] = ['A', 'B', 'C', 'D', 'E'];
export interface CatResult { quota: number; success: number; bids: number; premium: number }
export interface Ex { month: string; round: 1 | 2; cats: Record<Cat, CatResult> }

const C = COE_RAW as unknown as { fetched: string; attribution: string; exercises: Ex[] };
const Q = PQP_RAW as unknown as {
  fetched: string; attribution: string;
  official: Record<string, Partial<Record<Cat, number>>>;
  computed: Record<string, { basedOn: string[] } & Record<'A' | 'B' | 'C' | 'D', number>>;
};

export const EXERCISES: Ex[] = C.exercises;
export const FETCHED = C.fetched;
export const LATEST = EXERCISES[EXERCISES.length - 1];
export const PREVIOUS = EXERCISES[EXERCISES.length - 2];
export const ATTRIBUTION = C.attribution;
export const PARAMS_READ = PARAMS.retrieved_at;

/** Exercice par clé « 2026-10-2 ». */
export const exKey = (e: Pick<Ex, 'month' | 'round'>) => `${e.month}-${e.round}`;
export const exByKey = (k: string) => EXERCISES.find((e) => exKey(e) === k);
/** Les n derniers exercices, du plus récent au plus ancien. */
export const lastN = (n: number) => EXERCISES.slice(-n).reverse();
export const premium = (e: Ex, c: Cat) => e.cats[c].premium;
/** Valeurs manifestement erronées dans le jeu data.gov.sg, écartées des moyennes et records (laissées dans le fichier brut) :
 *  2010-01, 2e exercice, cat. D = 20 090 $, recopie de la cat. C (889 $ et 852 $ autour). */
export const ANOMALIES = new Set(['2010-01-2-D']);
const ok = (e: Ex, c: Cat) => !ANOMALIES.has(`${exKey(e)}-${c}`);
export const change = (c: Cat, a: Ex = LATEST, b: Ex = PREVIOUS) => premium(a, c) - premium(b, c);
/** Offres reçues par COE disponible (taux de souscription). */
export const bidRatio = (e: Ex, c: Cat) => e.cats[c].bids / e.cats[c].quota;

/** Statistiques sur les n derniers exercices d'une catégorie. */
export function stats(c: Cat, n: number) {
  const xs = EXERCISES.slice(-n).map((e) => premium(e, c));
  const sorted = [...xs].sort((a, b) => a - b);
  return { n: xs.length, min: sorted[0], max: sorted[sorted.length - 1], mean: Math.round(xs.reduce((s, x) => s + x, 0) / xs.length), median: sorted[Math.floor(sorted.length / 2)] };
}
/** Part des n derniers exercices où la prime de la catégorie est restée ≤ prix (un prix de réserve aurait passé). */
export function shareAtOrBelow(c: Cat, price: number, n: number) {
  const xs = EXERCISES.slice(-n).map((e) => premium(e, c));
  return { hits: xs.filter((x) => x <= price).length, n: xs.length };
}
/** Moyenne annuelle d'une catégorie (années complètes et année en cours). */
export function yearly(c: Cat) {
  const by = new Map<string, number[]>();
  for (const e of EXERCISES) { if (!ok(e, c)) continue; const y = e.month.slice(0, 4); by.set(y, [...(by.get(y) ?? []), premium(e, c)]); }
  return [...by.entries()].map(([y, xs]) => ({ year: Number(y), n: xs.length, mean: Math.round(xs.reduce((s, x) => s + x, 0) / xs.length), min: Math.min(...xs), max: Math.max(...xs) }));
}
/** Record de la catégorie sur toute la série publiée. */
export function record(c: Cat) {
  let best = EXERCISES[0];
  for (const e of EXERCISES) if (ok(e, c) && premium(e, c) > premium(best, c)) best = e;
  return { ex: best, value: premium(best, c) };
}
export const FIRST = EXERCISES[0];

/* ---------------------------------------------------------------- PQP */
const nextMonth = (m: string) => { const [y, mo] = m.split('-').map(Number); return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`; };
/** PQP officiel publié pour les renouvellements du mois M (série SingStat datée M−1). */
export function pqpOfficialFor(renewalMonth: string): Partial<Record<Cat, number>> | null {
  const prev = Object.keys(Q.official).find((k) => nextMonth(k) === renewalMonth);
  return prev ? Q.official[prev] : null;
}
const officialMonths = Object.keys(Q.official).sort();
/** Dernier mois de renouvellement couvert par la série officielle, et le mois suivant calculé par nous. */
export const PQP_OFFICIAL_LAST = nextMonth(officialMonths[officialMonths.length - 1]);
export const PQP_OFFICIAL = Q.official[officialMonths[officialMonths.length - 1]] as Record<'A' | 'B' | 'C' | 'D', number>;
const computedKeys = Object.keys(Q.computed).sort();
const lastComputed = computedKeys[computedKeys.length - 1];
/** PQP du mois de renouvellement suivant, recalculé selon la règle LTA (moyenne des primes des 3 derniers mois). */
export const PQP_NEXT = { appliesTo: nextMonth(lastComputed), basedOn: Q.computed[lastComputed].basedOn, A: Q.computed[lastComputed].A, B: Q.computed[lastComputed].B, C: Q.computed[lastComputed].C, D: Q.computed[lastComputed].D };
/** Le PQP « suivant » est-il encore un calcul (pas encore dans la série officielle) ? */
export const PQP_NEXT_IS_COMPUTED = PQP_NEXT.appliesTo > PQP_OFFICIAL_LAST;
/** Série PQP mensuelle (mois de renouvellement), du plus récent au plus ancien. */
export function pqpSeries(n: number) {
  return officialMonths.slice(-n).reverse().map((m) => ({ month: nextMonth(m), ...(Q.official[m] as Record<'A' | 'B' | 'C' | 'D', number>) }));
}
export const PQP_ATTRIBUTION = Q.attribution;

/* ---------------------------------------------------------------- calendrier */
export interface NextEx { month: string; round: number; start: string; end: string }
export const SCHEDULE: NextEx[] = (PARAMS.coe.schedule2026 as Array<[string, number, string, string]>).map(([month, round, start, end]) => ({ month, round, start, end }));
/** Prochain exercice après la date de lecture des données. */
export const NEXT_EX: NextEx | undefined = SCHEDULE.find((s) => s.end > FETCHED);

/* ---------------------------------------------------------------- formats */
export const money = (x: number, l: Lang, d = 0) => formatMoney(x, d, l);
export const num = (x: number, l: Lang, d = 0) => formatNumber(x, d, l);
export const pct = (x: number, l: Lang, d = 1) => formatPercent(x, d, l);
export const signed = (x: number, l: Lang) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${formatMoney(Math.abs(x), 0, l)}`;
export const day = (iso: string, l: Lang) => displayDate(iso, l === 'zh' ? 'zh-SG' : 'en-SG');
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** « October 2026 » / « 2026年10月 ». */
export const monthYear = (m: string, l: Lang) => { const [y, mo] = m.split('-').map(Number); return l === 'zh' ? `${y}年${mo}月` : `${MONTHS_EN[mo - 1]} ${y}`; };
/** « 2nd exercise of October 2026 » / « 2026年10月第二轮 ». */
export const exName = (e: Pick<Ex, 'month' | 'round'>, l: Lang, short = false) => {
  if (l === 'zh') return `${monthYear(e.month, l)}第${e.round === 1 ? '一' : '二'}轮`;
  return short ? `${monthYear(e.month, l)} (${e.round})` : `${e.round === 1 ? '1st' : '2nd'} exercise of ${monthYear(e.month, l)}`;
};
export const catName = (c: Cat, l: Lang) => (l === 'zh'
  ? { A: 'A类（小型车）', B: 'B类（大型车）', C: 'C类（货车与巴士）', D: 'D类（摩托车）', E: 'E类（开放类）' }[c]
  : { A: 'Cat A (smaller cars)', B: 'Cat B (larger cars)', C: 'Cat C (goods vehicles and buses)', D: 'Cat D (motorcycles)', E: 'Cat E (open)' }[c]);
export const catShort = (c: Cat, l: Lang) => (l === 'zh' ? `${c}类` : `Cat ${c}`);
