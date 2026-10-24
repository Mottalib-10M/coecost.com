/**
 * Moteur de calcul : coût d'une voiture à Singapour (ARF, VES, EEAI, COE, PARF, road tax,
 * renouvellement du COE, coût par an). TypeScript pur, sans dépendance, testé par vitest.
 * Les barèmes viennent de data/tax-params.json (pages LTA OneMotoring relevées le 2026-10-24) ;
 * ils vivent dans src/data/params-2026.json.
 */

export type Tier = [upTo: number | null, rate: number];
export type ArfRegime = 'pre2023' | 'from2023';
export type ParfRegime = 'pre2023' | 'y2023to2026' | 'from2026';
export type Fuel = 'petrol' | 'hybrid' | 'phev' | 'ev';
export type VesBand = 'A' | 'B' | 'C1' | 'C2' | 'C3';

import RAW from '../../data/params-2026.json';

type Band6 = [number | null, number, number, number][];
const R = RAW as unknown as {
  registrationFee: number; exciseDutyRate: number; gstRate: number; usedImportSurcharge: number; minArf: number; evNoMinArfTo: number;
  arf: Record<ArfRegime, Tier[]>;
  parf: Record<ParfRegime, { rates: number[]; cap: number | null }>;
  ves: { [y: string]: Record<VesBand, number> } & { co2Bands: Array<[VesBand, number | null]> };
  eeai: { rate: number; caps: Record<string, number>; ends: string };
  roadTax: { factor: number; ice: Band6; ev: Band6; evAfcSixMonthly: number; ageSurcharge: [number, number][]; lateFees: { rows: Array<[number | null, number, number, number, number]>; maxFine: number } };
  motorcycle: { arf: Tier[]; exciseDutyRate: number; ice: Band6; ev: Band6; evAfcSixMonthly: number; bidDeposit: number };
  coe: { catA: { maxCc: number; maxKw: number; evMaxKw: number }; renewalLateFees: Array<[number | null, number]>; motorcycleRenewalLateFee: number };
  loans: { lowOmv: number; ltvLow: number; ltvHigh: number; maxYears: number };
};
/** Barèmes lus dans src/data/params-2026.json (jamais en dur). */
export const P = {
  registrationFee: R.registrationFee,
  exciseDutyRate: R.exciseDutyRate,
  gstRate: R.gstRate,
  usedImportSurcharge: R.usedImportSurcharge,
  arf: R.arf,
  parf: Object.fromEntries(Object.entries(R.parf).map(([k, v]) => [k, { rates: v.rates, cap: v.cap ?? Infinity }])) as Record<ParfRegime, { rates: number[]; cap: number }>,
  ves: { 2026: R.ves['2026'], 2027: R.ves['2027'] } as Record<number, Record<VesBand, number>>,
  vesCo2: R.ves.co2Bands,
  eeai: { rate: R.eeai.rate, cap: Object.fromEntries(Object.entries(R.eeai.caps).map(([y, c]) => [Number(y), c])) as Record<number, number> },
  minArf: R.minArf,
  evNoMinArfTo: R.evNoMinArfTo,
  roadTax: R.roadTax,
  moto: R.motorcycle,
  catA: R.coe.catA,
  coeLate: R.coe.renewalLateFees,
  coeLateMoto: R.coe.motorcycleRenewalLateFee,
  loans: R.loans,
};

const r2 = (x: number) => Math.round(x * 100) / 100;

/** Exercice COE : année, mois (1-12), n° (1 ou 2). */
export interface Exercise { year: number; month: number; round: 1 | 2 }
const exIndex = (e: Exercise) => e.year * 24 + (e.month - 1) * 2 + (e.round - 1);

/** Régime ARF selon l'exercice du COE (bascule au 2e exercice de février 2023). */
export function arfRegime(coe: Exercise): ArfRegime {
  return exIndex(coe) >= exIndex({ year: 2023, month: 2, round: 2 }) ? 'from2023' : 'pre2023';
}

/** Régime PARF selon l'exercice du COE (bascules : 2e exercice de février 2023 et de février 2026). */
export function parfRegime(coe: Exercise): ParfRegime {
  const i = exIndex(coe);
  if (i >= exIndex({ year: 2026, month: 2, round: 2 })) return 'from2026';
  if (i >= exIndex({ year: 2023, month: 2, round: 2 })) return 'y2023to2026';
  return 'pre2023';
}

/** ARF brut par tranches d'OMV, arrondi au dollar supérieur (comme la liste LTA « Car Cost Update »). */
export function grossArf(omv: number, regime: ArfRegime = 'from2023'): number {
  if (!(omv > 0)) return 0;
  let rest = omv, prev = 0, total = 0;
  for (const [upTo, rate] of P.arf[regime]) {
    const width = upTo === null ? rest : Math.min(rest, upTo - prev);
    total += width * rate;
    rest -= width;
    prev = upTo ?? prev;
    if (rest <= 0) break;
  }
  return Math.ceil(r2(total));
}

/** EEAI (voiture 100 % électrique) : 45 % de l'ARF, plafonné selon l'année ; 0 à partir de 2027. */
export function eeai(arf: number, regYear: number, fuel: Fuel): number {
  if (fuel !== 'ev') return 0;
  const cap = P.eeai.cap[regYear];
  if (!cap) return 0;
  return Math.min(Math.round(arf * P.eeai.rate), cap);
}

/** ARF net payé après VES (rebate négatif, surcharge positive) et EEAI, avec le plancher applicable. */
/** `parfBase` : ARF servant au PARF, net des rebates mais SANS la surcharge VES (page LTA « Vehicle Emission Schemes » :
 *  « your PARF rebate will be calculated based on the ARF paid which does not include this surcharge »). */
export function netArf(arf: number, band: VesBand, regYear: number, fuel: Fuel): { ves: number; eeai: number; net: number; parfBase: number } {
  const ves = (P.ves[regYear] ?? P.ves[2026])[band];
  const e = eeai(arf, regYear, fuel);
  const floor = fuel === 'ev' && regYear >= 2022 && regYear <= P.evNoMinArfTo ? 0 : P.minArf;
  let net = arf + ves - e;
  if (ves < 0 || e > 0) net = Math.max(net, floor);
  return { ves, eeai: e, net, parfBase: ves > 0 ? net - ves : net };
}

/** Excise (20 % de l'OMV) et GST (9 % sur OMV + excise), inclus dans le prix du concessionnaire. */
export function dutyAndGst(omv: number): number {
  return r2(omv * P.exciseDutyRate + omv * (1 + P.exciseDutyRate) * P.gstRate);
}

export interface UpfrontIn { omv: number; coePremium: number; band: VesBand; regYear: number; fuel: Fuel; coe: Exercise }
export interface UpfrontOut { omv: number; dutyGst: number; grossArf: number; ves: number; eeai: number; netArf: number; parfBase: number; registrationFee: number; coe: number; basicWithoutCoe: number; basicWithCoe: number }

/** Coût de base hors marge du concessionnaire (même composition que la liste LTA). */
export function upfront(i: UpfrontIn): UpfrontOut {
  const g = grossArf(i.omv, arfRegime(i.coe));
  const n = netArf(g, i.band, i.regYear, i.fuel);
  const dg = dutyAndGst(i.omv);
  const without = r2(i.omv + dg + n.net + P.registrationFee);
  return { omv: i.omv, dutyGst: dg, grossArf: g, ves: n.ves, eeai: n.eeai, netArf: n.net, parfBase: n.parfBase, registrationFee: P.registrationFee, coe: i.coePremium, basicWithoutCoe: without, basicWithCoe: r2(without + i.coePremium) };
}

/** Âge en années décimales entre deux dates ISO. */
export function ageYears(regDate: string, at: string): number {
  const a = new Date(regDate + 'T00:00:00Z'), b = new Date(at + 'T00:00:00Z');
  let y = b.getUTCFullYear() - a.getUTCFullYear();
  const anniv = new Date(Date.UTC(a.getUTCFullYear() + y, a.getUTCMonth(), a.getUTCDate()));
  if (anniv > b) y -= 1;
  const last = new Date(Date.UTC(a.getUTCFullYear() + y, a.getUTCMonth(), a.getUTCDate()));
  const next = new Date(Date.UTC(a.getUTCFullYear() + y + 1, a.getUTCMonth(), a.getUTCDate()));
  return y + (b.getTime() - last.getTime()) / (next.getTime() - last.getTime());
}

/** Taux PARF pour un âge à la casse : ≤ 5 ans → rates[0], > 5 et ≤ 6 → rates[1] … > 10 → 0. */
export function parfRate(age: number, regime: ParfRegime): number {
  if (age > 10) return 0;
  const k = age <= 5 ? 0 : Math.ceil(age) - 5;
  return P.parf[regime].rates[k];
}

/** PARF rebate = taux × ARF net payé, plafonné selon le régime. */
export function parfRebate(netArfPaid: number, age: number, regime: ParfRegime): number {
  return Math.min(Math.floor(netArfPaid * parfRate(age, regime)), P.parf[regime].cap);
}

/**
 * Mois de COE non utilisés, à la manière de l'exemple LTA : mois civils pleins à partir du
 * lendemain de la radiation, puis les jours restants comptés sur 30 (au dixième).
 */
export function unusedCoeMonths(deregDate: string, expiryDate: string): number {
  const d = new Date(deregDate + 'T00:00:00Z'), exp = new Date(expiryDate + 'T00:00:00Z');
  if (exp <= d) return 0;
  const start = new Date(d.getTime() + 86400000);
  let months = 0;
  for (;;) {
    const endOfNext = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months + 1, start.getUTCDate()) - 86400000);
    if (endOfNext > exp) break;
    months++;
  }
  const from = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, start.getUTCDate()));
  const days = Math.round((exp.getTime() - from.getTime()) / 86400000) + 1;
  return months + Math.round((days / 30) * 10) / 10;
}

/** COE rebate = prime payée (10 ans) × mois non utilisés / 120, arrondi au dollar inférieur. */
export function coeRebate(paid10y: number, unusedMonths: number, totalMonths = 120): number {
  return Math.floor((paid10y * unusedMonths) / totalMonths);
}

function sixMonthly(x: number, table: Band6): number {
  for (const [upTo, base, rate, from] of table) if (upTo === null || x <= upTo) return (base + rate * (x - from)) * P.roadTax.factor;
  return 0;
}

/** Majoration de road tax selon l'âge (plus de 10 ans : +10 % … plus de 14 ans : +50 %). */
export function roadTaxSurcharge(age: number): number {
  for (const [over, s] of P.roadTax.ageSurcharge) if (age > over) return s;
  return 0;
}

export interface RoadTaxIn { fuel: Fuel; cc?: number; kw?: number; age?: number }
/** Road tax annuelle (deux semestres) : cylindrée, puissance électrique (+ AFC), hybride = le plus élevé. */
export function roadTaxAnnual(i: RoadTaxIn): { base: number; afc: number; surcharge: number; total: number } {
  let six = 0, afc = 0;
  if (i.fuel === 'ev') { six = sixMonthly(i.kw ?? 0, P.roadTax.ev); afc = P.roadTax.evAfcSixMonthly; }
  else if (i.fuel === 'petrol') six = sixMonthly(i.cc ?? 0, P.roadTax.ice);
  else six = Math.max(sixMonthly(i.cc ?? 0, P.roadTax.ice), sixMonthly(i.kw ?? 0, P.roadTax.ev));
  const base = r2(six * 2);
  const surcharge = r2(base * roadTaxSurcharge(i.age ?? 0));
  return { base, afc: afc * 2, surcharge, total: r2(base + surcharge + afc * 2) };
}

/** Renouvellement du COE : 10 ans = PQP ; 5 ans = 50 % du PQP arrondi au dollar supérieur. */
export function renewalCost(pqp: number, years: 5 | 10): number {
  return years === 10 ? pqp : Math.ceil(pqp / 2);
}

export interface OwnershipIn { price: number; coePaid: number; netArfPaid: number; parf: ParfRegime; yearsKept: number; roadTaxPerYear: number; otherPerYear?: number }
/**
 * Coût de possession si l'on garde la voiture `yearsKept` ans puis qu'on la radie :
 * prix − PARF − COE rebate = dépréciation ; + road tax et autres frais saisis.
 */
export function ownership(i: OwnershipIn) {
  const age = i.yearsKept;
  const parf = parfRebate(i.netArfPaid, age, i.parf);
  const coe = coeRebate(i.coePaid, Math.max(0, 120 - age * 12));
  const depreciation = i.price - parf - coe;
  const running = (i.roadTaxPerYear + (i.otherPerYear ?? 0)) * age;
  const total = depreciation + running;
  return { parf, coeRebate: coe, depreciation, depreciationPerYear: r2(depreciation / age), running, total, perYear: r2(total / age), perMonth: r2(total / age / 12) };
}

/**
 * À 10 ans : renouveler (5 ou 10 ans) ou radier ? À 10 ans pile, la voiture touche encore son
 * PARF (≤ 10 ans) ; renouveler y renonce. Coût réel du renouvellement = PQP (ou 50 %) + PARF perdu.
 */
export function renewOrScrap(i: { pqp: number; netArfPaid: number; parf: ParfRegime; years: 5 | 10 }) {
  const parfLost = parfRebate(i.netArfPaid, 10, i.parf);
  const pay = renewalCost(i.pqp, i.years);
  const effective = pay + parfLost;
  return { pay, parfLost, effective, perYear: r2(effective / i.years) };
}

/* ---------------------------------------------------------------- ajouts phase 2 */

/** Catégorie COE d'une voiture (COE obtenus depuis mai 2022) : A si thermique ≤ 1 600 cc et ≤ 97 kW, électrique ≤ 110 kW. */
export function coeCategory(fuel: Fuel, cc: number, kw: number): 'A' | 'B' {
  if (fuel === 'ev') return kw <= P.catA.evMaxKw ? 'A' : 'B';
  return cc <= P.catA.maxCc && kw <= P.catA.maxKw ? 'A' : 'B';
}

/** Bande VES selon le seul CO2 (g/km). La bande réelle est celle du polluant le plus mauvais : c'est un minimum. */
export function vesBandFromCo2(co2: number): VesBand {
  for (const [band, upTo] of P.vesCo2) if (upTo === null || co2 <= upTo) return band;
  return 'C3';
}

/** Road tax de 6 mois sans majoration ni AFC (exposée pour les tableaux). */
export function roadTaxSixMonthly(fuel: Fuel, cc: number, kw: number): number {
  if (fuel === 'ev') return r2(sixMonthly(kw, P.roadTax.ev));
  if (fuel === 'petrol') return r2(sixMonthly(cc, P.roadTax.ice));
  return r2(Math.max(sixMonthly(cc, P.roadTax.ice), sixMonthly(kw, P.roadTax.ev)));
}

/** Somme à payer pour une période de road tax (6 ou 12 mois), majoration d'âge et AFC compris. */
export function roadTaxRenewal(i: RoadTaxIn & { months: 6 | 12 }) {
  const y = roadTaxAnnual(i);
  const f = i.months / 12;
  return { base: r2(y.base * f), surcharge: r2(y.surcharge * f), afc: r2(y.afc * f), total: r2(y.total * f) };
}

/** Frais de retard de road tax (voiture thermique, selon la cylindrée et le retard en mois). */
export function roadTaxLateFee(cc: number, monthsLate: number): number {
  if (!(monthsLate > 0)) return 0;
  const row = P.roadTax.lateFees.rows.find(([upTo]) => upTo === null || cc <= upTo)!;
  const col = monthsLate <= 1 ? 1 : monthsLate <= 2.5 ? 2 : monthsLate <= 3 ? 3 : 4;
  return row[col];
}

/** Frais de retard du renouvellement de COE (dans le mois qui suit l'expiration). */
export function coeRenewalLateFee(cc: number, motorcycle = false): number {
  if (motorcycle) return P.coeLateMoto;
  return P.coeLate.find(([upTo]) => upTo === null || cc <= upTo)![1];
}

/** Moto : ARF par tranches (15 / 50 / 100 %), excise 12 %, GST, frais d'immatriculation. */
export function motorcycleUpfront(omv: number, coePremium: number) {
  let rest = omv, prev = 0, arf = 0;
  for (const [upTo, rate] of P.moto.arf) {
    const w = upTo === null ? rest : Math.min(rest, upTo - prev);
    arf += w * rate; rest -= w; prev = upTo ?? prev;
    if (rest <= 0) break;
  }
  arf = Math.ceil(r2(Math.max(0, arf)));
  const duty = r2(omv * P.moto.exciseDutyRate), gst = r2((omv + duty) * P.gstRate);
  const withoutCoe = r2(omv + duty + gst + arf + P.registrationFee);
  return { arf, duty, gst, registrationFee: P.registrationFee, withoutCoe, total: r2(withoutCoe + coePremium) };
}

/** Road tax annuelle d'une moto (cylindrée, ou puissance + AFC pour une électrique). */
export function motorcycleRoadTax(fuel: Fuel, cc: number, kw: number) {
  const ice = sixMonthly(cc, P.moto.ice), ev = sixMonthly(kw, P.moto.ev);
  const six = fuel === 'ev' ? ev : fuel === 'petrol' ? ice : Math.max(ice, ev);
  const afc = fuel === 'ev' ? P.moto.evAfcSixMonthly * 2 : 0;
  return { base: r2(six * 2), afc, total: r2(six * 2 + afc) };
}

/** Prêt auto (règles MAS) : quotité maximale selon l'OMV, durée ≤ 7 ans, mensualité à taux plat annoncé. */
export function carLoan(i: { price: number; omv: number; loan: number; years: number; flatRate: number }) {
  const ltv = i.omv <= P.loans.lowOmv ? P.loans.ltvLow : P.loans.ltvHigh;
  const maxLoan = Math.floor(i.price * ltv);
  const loan = Math.min(i.loan, maxLoan);
  const years = Math.min(i.years, P.loans.maxYears);
  const interest = r2(loan * i.flatRate * years);
  const monthly = years > 0 ? r2((loan + interest) / (years * 12)) : 0;
  // Taux effectif (annuités constantes équivalentes), par recherche dichotomique.
  let lo = 0, hi = 1;
  const n = years * 12;
  if (loan > 0 && n > 0 && interest > 0) {
    for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; const pay = (loan * m) / (1 - Math.pow(1 + m, -n)); if (pay > monthly) hi = m; else lo = m; }
  }
  return { ltv, maxLoan, loan, capped: i.loan > maxLoan, years, downPayment: r2(i.price - loan), interest, monthly, effectiveRate: r2(lo * 12 * 10000) / 10000 };
}
