/**
 * Les simulateurs du site (anglais et chinois). Moteur : src/lib/engine/car-cost.ts ; barèmes : params-2026.json ;
 * primes COE et PQP : data.gov.sg (Singapore Open Data Licence v1.0), via src/lib/data.ts.
 * Une spec liste ses champs (visibles d'abord, `adv` repliés) et une fonction `run` qui rend la carte de résultat.
 * Aucune date « du jour » : tout part de la date de lecture des données, identique au build et dans le navigateur.
 */
import type { ToolSpec, V, Opt, ToolOut, Input } from './tool-types';
import { resolve } from './tool-types';
import type { Lang } from './format';
import PARAMS from '../data/params-2026.json';
import {
  upfront, roadTaxAnnual, roadTaxRenewal, roadTaxLateFee, parfRebate, parfRate, coeRebate, renewalCost, grossArf, netArf,
  coeCategory, vesBandFromCo2, motorcycleUpfront, motorcycleRoadTax, carLoan, coeRenewalLateFee, roadTaxSurcharge, P,
  type Fuel, type VesBand, type ParfRegime, type ArfRegime,
} from './engine/car-cost';
import {
  LATEST, PREVIOUS, EXERCISES, exKey, exByKey, exName, catName, catShort, premium, bidRatio, shareAtOrBelow, stats,
  PQP_NEXT, PQP_OFFICIAL, PQP_OFFICIAL_LAST, money, num, pct, signed, monthYear, CATS, type Cat,
} from './data';

export type Args = Record<string, number | string>;
const T = (l: Lang, en: string, zh: string) => (l === 'zh' ? zh : en);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k] ?? '');
/** Valeur par défaut d'un champ : celle de la page (arg) sinon la valeur proposée. */
const d = <X extends number | string>(arg: Args | undefined, k: string, x: X): X => (arg && arg[k] !== undefined ? (typeof x === 'number' ? Number(arg[k]) : String(arg[k])) as X : x);
const LATEST_EX = { year: Number(LATEST.month.slice(0, 4)), month: Number(LATEST.month.slice(5, 7)), round: LATEST.round };
const REG_YEAR = Number(LATEST.month.slice(0, 4));

const fuelOpts = (l: Lang): Opt[] => [
  { value: 'petrol', label: T(l, 'Petrol', '汽油') }, { value: 'hybrid', label: T(l, 'Hybrid', '混合动力') }, { value: 'ev', label: T(l, 'Electric', '纯电') },
];
const fuelChoice = (l: Lang, arg?: Args): Input => ({ kind: 'choice', id: 'fuel', label: T(l, 'Engine', '动力'), def: d(arg, 'fuel', 'petrol'), options: fuelOpts(l) });
const bandOpts = (l: Lang): Opt[] => (['A', 'B', 'C1', 'C2', 'C3'] as VesBand[]).map((b) => ({ value: b, label: `${T(l, 'VES band', '排放等级')} ${b} (${signed(P.ves[2026][b], l)})` }));
const regimeOpts = (l: Lang): Opt[] => [
  { value: 'from2026', label: T(l, 'COE from Feb 2026 (2nd exercise)', '2026年2月第二轮起的拥车证') },
  { value: 'y2023to2026', label: T(l, 'COE Feb 2023 (2nd) to Feb 2026 (1st)', '2023年2月第二轮至2026年2月第一轮') },
  { value: 'pre2023', label: T(l, 'COE before Feb 2023 (2nd exercise)', '2023年2月第二轮之前') },
];
const catOpts = (l: Lang, only: Cat[] = CATS): Opt[] => only.map((c) => ({ value: c, label: catName(c, l) }));
const exOpts = (l: Lang): Opt[] => EXERCISES.slice(-48).reverse().map((e) => ({ value: exKey(e), label: exName(e, l, true) }));
const m = (x: number, l: Lang) => money(x, l);
const PCT = (x: number, l: Lang) => pct(x, l, 0);

/* ---------------------------------------------------------------- 1. coût complet (accueil) */
function cost(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'omv', label: T(l, 'OMV (open market value)', '公开市场价值（OMV）'), def: d(arg, 'omv', 30000), unit: 'S$', max: 500000, help: T(l, 'On the dealer’s price list', '车行价目表上可查') },
      fuelChoice(l, arg),
      { id: 'cc', label: T(l, 'Engine capacity', '引擎排量'), def: d(arg, 'cc', 1496), unit: 'cc', max: 8000 },
      { id: 'kw', label: T(l, 'Maximum power', '最大功率'), def: d(arg, 'kw', 90), unit: 'kW', max: 1500 },
      { kind: 'select', id: 'band', label: T(l, 'VES band', '车辆排放等级'), def: d(arg, 'band', 'B'), options: bandOpts(l) },
      { id: 'years', label: T(l, 'Years you keep the car', '打算用几年'), def: d(arg, 'years', 10), max: 10, decimals: 1 },
      { id: 'coe', label: T(l, 'COE premium (0 = latest result)', '拥车证价格（0 = 最新结果）'), def: d(arg, 'coe', 0), unit: 'S$', max: 400000, adv: true },
      { id: 'price', label: T(l, 'Dealer price, if known', '车行报价（如有）'), def: d(arg, 'price', 0), unit: 'S$', max: 2000000, adv: true, help: T(l, '0 = cost before dealer margin', '0 = 不含车行利润') },
      { id: 'other', label: T(l, 'Insurance, parking, fuel per year', '每年保险、停车与油费'), def: d(arg, 'other', 0), unit: 'S$', max: 100000, adv: true },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel, cc = fuel === 'ev' ? 0 : n(v, 'cc'), kw = n(v, 'kw');
      const cat = coeCategory(fuel, cc, kw);
      const coePrem = n(v, 'coe') || premium(LATEST, cat);
      const u = upfront({ omv: n(v, 'omv'), coePremium: coePrem, band: s(v, 'band') as VesBand, regYear: REG_YEAR, fuel, coe: LATEST_EX });
      const price = Math.max(n(v, 'price'), u.basicWithCoe);
      const years = Math.max(0.5, Math.min(10, n(v, 'years')));
      const parf = parfRebate(u.parfBase, years, 'from2026');
      const coeBack = coeRebate(coePrem, Math.max(0, 120 - years * 12));
      const rt = roadTaxAnnual({ fuel, cc, kw }).total;
      const total = price - parf - coeBack + (rt + n(v, 'other')) * years;
      return {
        label: T(l, `Cost per year over ${num(years, l, 1)} years`, `${num(years, l, 1)}年内每年成本`),
        value: m(total / years, l),
        sub: T(l, `${m(total / years / 12, l)} a month · ${catShort(cat, l)} COE`, `每月 ${m(total / years / 12, l)} · ${catShort(cat, l)}拥车证`),
        rows: [
          [T(l, 'OMV', '公开市场价值'), m(u.omv, l), u.omv],
          [T(l, 'Excise duty and GST', '消费税与商品及服务税'), m(u.dutyGst, l), u.dutyGst],
          [T(l, 'ARF after VES and EEAI', '扣除排放回扣后的附加注册费'), m(u.netArf, l), u.netArf],
          [T(l, `COE, ${exName(LATEST, l, true)}`, `拥车证（${exName(LATEST, l, true)}）`), m(coePrem, l), coePrem],
          [T(l, 'Registration fee', '注册费'), m(u.registrationFee, l)],
          [T(l, 'Price paid', '购车价'), m(price, l)],
          [T(l, 'Back at deregistration (PARF + COE rebate)', '注销时取回（PARF + 拥车证回扣）'), `−${m(parf + coeBack, l)}`],
          [T(l, 'Road tax per year', '每年路税'), m(rt, l)],
          [T(l, 'Depreciation per year', '每年折旧'), m((price - parf - coeBack) / years, l)],
        ],
        note: T(l, `ARF from the 2023 tiers, VES ${REG_YEAR}, PARF for COEs from February 2026. Category ${cat} is set by your engine figures.`, `附加注册费按2023年分级，车辆排放计划按${REG_YEAR}年，PARF 按2026年2月起的拥车证计算。拥车证类别（${cat}类）由引擎数据决定。`),
      };
    },
  };
}

/* ---------------------------------------------------------------- 2. résultats d'un exercice */
function results(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { kind: 'select', id: 'ex', label: T(l, 'Bidding exercise', '竞标轮次'), def: d(arg, 'ex', exKey(LATEST)), options: exOpts(l) },
      { kind: 'select', id: 'cat', label: T(l, 'Category', '类别'), def: d(arg, 'cat', 'A'), options: catOpts(l) },
    ],
    run: (v) => {
      const e = exByKey(s(v, 'ex')) ?? LATEST, i = EXERCISES.indexOf(e), prev = EXERCISES[i - 1];
      const c = s(v, 'cat') as Cat, r = e.cats[c];
      const diff = prev ? r.premium - prev.cats[c].premium : 0;
      return {
        label: T(l, `${catName(c, l)}, ${exName(e, l)}`, `${catName(c, l)}，${exName(e, l)}`),
        value: m(r.premium, l),
        sub: prev ? T(l, `${signed(diff, l)} on the exercise before`, `比上一轮 ${signed(diff, l)}`) : undefined,
        rows: [
          [T(l, 'Quota (COEs available)', '配额'), num(r.quota, l)],
          [T(l, 'Bids received', '收到的投标'), num(r.bids, l)],
          [T(l, 'Successful bids', '成功投标'), num(r.success, l)],
          [T(l, 'Bids per COE', '每张拥车证的投标数'), num(r.bids / r.quota, l, 2)],
        ],
        table: {
          caption: T(l, `All categories, ${exName(e, l)}. Source: LTA via data.gov.sg (Singapore Open Data Licence).`, `${exName(e, l)}各类别结果。来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证）。`),
          headers: [T(l, 'Category', '类别'), T(l, 'Premium', '价格'), T(l, 'Change', '变化'), T(l, 'Quota', '配额'), T(l, 'Bids', '投标')],
          rows: CATS.map((k) => [catName(k, l), m(e.cats[k].premium, l), prev ? signed(e.cats[k].premium - prev.cats[k].premium, l) : '', num(e.cats[k].quota, l), num(e.cats[k].bids, l)]),
          align: ['l', 'r', 'r', 'r', 'r'],
        },
      };
    },
  };
}

/* ---------------------------------------------------------------- 3. prix de réserve */
function bid(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { kind: 'select', id: 'cat', label: T(l, 'Category', '类别'), def: d(arg, 'cat', 'A'), options: catOpts(l) },
      { id: 'reserve', label: T(l, 'Your reserve price', '您的保留价'), def: d(arg, 'reserve', 125000), unit: 'S$', max: 400000 },
      { kind: 'choice', id: 'n', label: T(l, 'Look back over', '回看'), def: d(arg, 'n', '24'), options: [{ value: '12', label: T(l, '6 months', '6个月') }, { value: '24', label: T(l, '1 year', '1年') }, { value: '48', label: T(l, '2 years', '2年') }] },
    ],
    run: (v) => {
      const c = s(v, 'cat') as Cat, price = n(v, 'reserve'), k = Number(s(v, 'n')) || 24;
      const h = shareAtOrBelow(c, price, k), st = stats(c, k), last = premium(LATEST, c);
      const deposit = c === 'D' ? P.moto.bidDeposit : PARAMS.coe.bidDeposit;
      return {
        label: T(l, `Exercises your price would have cleared, ${catShort(c, l)}`, `您的价格可中标的轮次（${catShort(c, l)}）`),
        value: `${h.hits} / ${h.n}`,
        sub: T(l, `Latest premium ${m(last, l)}: your price is ${price >= last ? 'above' : 'below'} it by ${m(Math.abs(price - last), l)}`, `最新价格 ${m(last, l)}，您的价格${price >= last ? '高出' : '低了'} ${m(Math.abs(price - last), l)}`),
        rows: [
          [T(l, `Lowest premium, last ${k} exercises`, `最近${k}轮最低价`), m(st.min, l)],
          [T(l, 'Median', '中位数'), m(st.median, l)],
          [T(l, 'Highest', '最高价'), m(st.max, l)],
          [T(l, 'Bid deposit taken by the bank', '银行扣取的投标押金'), m(deposit, l)],
          [T(l, 'Bids per COE, latest exercise', '最新一轮每张拥车证投标数'), num(bidRatio(LATEST, c), l, 2)],
        ],
        note: T(l, 'Past results only: no one can tell the next premium. Everyone who succeeds pays the same premium, not their reserve price.', '仅为过往结果，无人能预知下一轮价格。所有中标者支付同一价格，而非各自的保留价。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 4. catégorie A ou B */
function category(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      fuelChoice(l, arg),
      { id: 'cc', label: T(l, 'Engine capacity', '引擎排量'), def: d(arg, 'cc', 1598), unit: 'cc', max: 8000 },
      { id: 'kw', label: T(l, 'Maximum power', '最大功率'), def: d(arg, 'kw', 96), unit: 'kW', max: 1500 },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel, cc = n(v, 'cc'), kw = n(v, 'kw');
      const c = coeCategory(fuel, fuel === 'ev' ? 0 : cc, kw), o = c === 'A' ? 'B' : 'A';
      const why = fuel === 'ev'
        ? T(l, `Electric: ${num(kw, l)} kW ${kw <= P.catA.evMaxKw ? '≤' : '>'} ${P.catA.evMaxKw} kW`, `纯电：${num(kw, l)} kW ${kw <= P.catA.evMaxKw ? '≤' : '>'} ${P.catA.evMaxKw} kW`)
        : T(l, `${num(cc, l)} cc ${cc <= P.catA.maxCc ? '≤' : '>'} ${num(P.catA.maxCc, l)} cc and ${num(kw, l)} kW ${kw <= P.catA.maxKw ? '≤' : '>'} ${P.catA.maxKw} kW`, `${num(cc, l)} cc ${cc <= P.catA.maxCc ? '≤' : '>'} ${num(P.catA.maxCc, l)} cc，${num(kw, l)} kW ${kw <= P.catA.maxKw ? '≤' : '>'} ${P.catA.maxKw} kW`);
      return {
        label: T(l, 'COE category for this car', '这辆车的拥车证类别'),
        value: catShort(c, l),
        sub: why,
        rows: [
          [T(l, `${catShort(c, l)} premium, ${exName(LATEST, l, true)}`, `${catShort(c, l)}价格，${exName(LATEST, l, true)}`), m(premium(LATEST, c), l)],
          [T(l, `${catShort(o, l)} premium, same exercise`, `${catShort(o, l)}同轮价格`), m(premium(LATEST, o), l)],
          [T(l, 'Cat E (open), same exercise', 'E类（开放类）同轮价格'), m(premium(LATEST, 'E'), l)],
          [T(l, `PQP to renew, ${monthYear(PQP_NEXT.appliesTo, l)}`, `${monthYear(PQP_NEXT.appliesTo, l)}续期 PQP`), m(PQP_NEXT[c], l)],
        ],
        note: T(l, 'Rule for COEs obtained from the 1st exercise of May 2022. A Cat E COE can register a car of either category.', '适用于2022年5月第一轮起取得的拥车证。E类拥车证可注册任一类别的汽车。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 5. moto */
function moto(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'omv', label: T(l, 'Motorcycle OMV', '摩托车公开市场价值'), def: d(arg, 'omv', 8000), unit: 'S$', max: 200000 },
      { id: 'cc', label: T(l, 'Engine capacity', '引擎排量'), def: d(arg, 'cc', 400), unit: 'cc', max: 3000 },
      { kind: 'choice', id: 'fuel', label: T(l, 'Engine', '动力'), def: d(arg, 'fuel', 'petrol'), options: [{ value: 'petrol', label: T(l, 'Petrol', '汽油') }, { value: 'ev', label: T(l, 'Electric', '纯电') }] },
      { id: 'kw', label: T(l, 'Motor power (electric)', '电机功率（纯电）'), def: d(arg, 'kw', 20), unit: 'kW', max: 500, adv: true },
      { id: 'coe', label: T(l, 'Cat D premium (0 = latest)', 'D类价格（0 = 最新）'), def: d(arg, 'coe', 0), unit: 'S$', max: 50000, adv: true },
    ],
    run: (v) => {
      const coe = n(v, 'coe') || premium(LATEST, 'D'), u = motorcycleUpfront(n(v, 'omv'), coe);
      const rt = motorcycleRoadTax(s(v, 'fuel') as Fuel, n(v, 'cc'), n(v, 'kw'));
      return {
        label: T(l, 'Motorcycle on the road, before dealer margin', '摩托车上路成本（不含车行利润）'),
        value: m(u.total, l),
        sub: T(l, `Road tax ${m(rt.total, l)} a year`, `每年路税 ${m(rt.total, l)}`),
        rows: [
          [T(l, 'OMV', '公开市场价值'), m(n(v, 'omv'), l)],
          [T(l, 'Excise duty (12%) and GST', '消费税（12%）与商品及服务税'), m(u.duty + u.gst, l)],
          [T(l, 'ARF (15 / 50 / 100% tiers)', '附加注册费（15/50/100%分级）'), m(u.arf, l)],
          [T(l, 'Registration fee', '注册费'), m(u.registrationFee, l)],
          [T(l, `Cat D COE, ${exName(LATEST, l, true)}`, `D类拥车证，${exName(LATEST, l, true)}`), m(coe, l)],
        ],
        note: T(l, 'Motorcycles get no PARF rebate. MAS loan limits do not apply to motorcycles.', '摩托车没有 PARF 回扣，金管局的汽车贷款上限不适用于摩托车。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 6. renouvellement */
function renew(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { kind: 'select', id: 'cat', label: T(l, 'Category of the car', '车辆类别'), def: d(arg, 'cat', 'A'), options: catOpts(l, ['A', 'B', 'C', 'D']) },
      { kind: 'choice', id: 'years', label: T(l, 'Renew for', '续期'), def: d(arg, 'years', '10'), options: [{ value: '5', label: T(l, '5 years', '5年') }, { value: '10', label: T(l, '10 years', '10年') }] },
      { id: 'arf', label: T(l, 'ARF paid (after rebates)', '已付附加注册费（扣除回扣后）'), def: d(arg, 'arf', 30000), unit: 'S$', max: 1000000, help: T(l, 'Gives the PARF you give up', '用来计算放弃的 PARF') },
      { kind: 'select', id: 'regime', label: T(l, 'When the COE was obtained', '拥车证取得时间'), def: d(arg, 'regime', 'pre2023'), options: regimeOpts(l), adv: true },
      { id: 'cc', label: T(l, 'Engine capacity (late fee)', '引擎排量（逾期费）'), def: d(arg, 'cc', 1598), unit: 'cc', max: 8000, adv: true },
    ],
    run: (v) => {
      const c = s(v, 'cat') as 'A' | 'B' | 'C' | 'D', y = Number(s(v, 'years')) as 5 | 10;
      const pqp = PQP_NEXT[c], pay = renewalCost(pqp, y);
      const parfLost = c === 'C' || c === 'D' ? 0 : parfRebate(n(v, 'arf'), 10, s(v, 'regime') as ParfRegime);
      const eff = pay + parfLost;
      return {
        label: T(l, `Renewing for ${y} years, ${monthYear(PQP_NEXT.appliesTo, l)}`, `${monthYear(PQP_NEXT.appliesTo, l)}续期${y}年`),
        value: m(pay, l),
        sub: T(l, `${m(eff / y, l)} a year once the PARF you give up is counted`, `计入放弃的 PARF 后，每年 ${m(eff / y, l)}`),
        rows: [
          [T(l, `PQP ${catShort(c, l)}, ${monthYear(PQP_NEXT.appliesTo, l)}`, `${catShort(c, l)} PQP，${monthYear(PQP_NEXT.appliesTo, l)}`), m(pqp, l)],
          [T(l, `PQP ${catShort(c, l)}, ${monthYear(PQP_OFFICIAL_LAST, l)} (published)`, `${catShort(c, l)} PQP，${monthYear(PQP_OFFICIAL_LAST, l)}（已公布）`), m(PQP_OFFICIAL[c], l)],
          [T(l, 'PARF given up by keeping the car past 10 years', '车龄超过10年而放弃的 PARF'), m(parfLost, l)],
          [T(l, 'Real cost of renewing', '续期的实际成本'), m(eff, l)],
          [T(l, 'Late fee if renewed within a month after expiry', '到期后一个月内续期的逾期费'), m(coeRenewalLateFee(n(v, 'cc'), c === 'D'), l)],
        ],
        note: T(l, `The ${monthYear(PQP_NEXT.appliesTo, l)} PQP is our calculation with LTA’s rule (average of the premiums of ${PQP_NEXT.basedOn.map((x) => monthYear(x, l)).join(', ')}). A 5-year renewal of a Cat A, B or D vehicle is allowed once only.`, `${monthYear(PQP_NEXT.appliesTo, l)}的 PQP 由本站按陆路交通管理局规则计算（${PQP_NEXT.basedOn.map((x) => monthYear(x, l)).join('、')}的价格平均）。A、B、D类车辆只能续期5年一次。`),
      };
    },
  };
}

/* ---------------------------------------------------------------- 7. PQP */
function pqp(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [{ kind: 'select', id: 'cat', label: T(l, 'Category', '类别'), def: d(arg, 'cat', 'A'), options: catOpts(l, ['A', 'B', 'C', 'D']) }],
    run: (v) => {
      const c = s(v, 'cat') as 'A' | 'B' | 'C' | 'D';
      return {
        label: T(l, `PQP ${catShort(c, l)} for renewals in ${monthYear(PQP_NEXT.appliesTo, l)}`, `${monthYear(PQP_NEXT.appliesTo, l)}续期的${catShort(c, l)} PQP`),
        value: m(PQP_NEXT[c], l),
        sub: T(l, `${signed(PQP_NEXT[c] - PQP_OFFICIAL[c], l)} on ${monthYear(PQP_OFFICIAL_LAST, l)}`, `比${monthYear(PQP_OFFICIAL_LAST, l)} ${signed(PQP_NEXT[c] - PQP_OFFICIAL[c], l)}`),
        rows: [
          [T(l, `PQP ${monthYear(PQP_OFFICIAL_LAST, l)} (published)`, `${monthYear(PQP_OFFICIAL_LAST, l)} PQP（已公布）`), m(PQP_OFFICIAL[c], l)],
          [T(l, '5-year renewal (50%, rounded up)', '续期5年（50%，向上取整）'), m(renewalCost(PQP_NEXT[c], 5), l)],
          [T(l, `Latest ${catShort(c, l)} premium`, `最新${catShort(c, l)}价格`), m(premium(LATEST, c), l)],
          [T(l, 'Premiums averaged', '计入平均的月份'), PQP_NEXT.basedOn.map((x) => monthYear(x, l)).join(T(l, ', ', '、'))],
        ],
      };
    },
  };
}

/* ---------------------------------------------------------------- 8. COE rebate */
function coeRebateTool(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'paid', label: T(l, 'COE premium paid (10 years)', '所付拥车证价格（10年）'), def: d(arg, 'paid', 90000), unit: 'S$', max: 400000 },
      { id: 'months', label: T(l, 'Months left on the COE', '拥车证剩余月数'), def: d(arg, 'months', 36), max: 120, decimals: 1 },
      { kind: 'choice', id: 'export', label: T(l, 'Exported within 2 years of registration', '注册后两年内出口'), def: d(arg, 'export', 'no'), options: [{ value: 'no', label: T(l, 'No', '否') }, { value: 'yes', label: T(l, 'Yes', '是') }] },
    ],
    run: (v) => {
      const paid = n(v, 'paid'), mo = Math.min(120, n(v, 'months'));
      let r = coeRebate(paid, mo);
      const cap = Math.floor(paid * PARAMS.rebates.exportCapWithin2Years);
      if (s(v, 'export') === 'yes') r = Math.min(r, cap);
      return {
        label: T(l, 'COE rebate at deregistration', '注销时的拥车证回扣'),
        value: m(r, l),
        sub: T(l, `${num(mo, l, 1)} of 120 months unused`, `120个月中尚有 ${num(mo, l, 1)} 个月未用`),
        rows: [
          [T(l, 'Value of one month of COE', '每月拥车证价值'), m(paid / 120, l, 2)],
          [T(l, 'Share of the COE left', '剩余比例'), PCT(mo / 120, l)],
          [T(l, 'Cap if exported within 2 years (80%)', '两年内出口的上限（80%）'), m(cap, l)],
        ],
        note: T(l, 'Unused period: whole calendar months from the day after deregistration, then the days left counted as 30ths of a month.', '未用期限：从注销次日起按整月计算，余下天数按每月30天折算。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 9. PARF */
function parf(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'arf', label: T(l, 'ARF paid (after rebates, without VES surcharge)', '已付附加注册费（扣除回扣，不含排放附加费）'), def: d(arg, 'arf', 40000), unit: 'S$', max: 1000000 },
      { id: 'age', label: T(l, 'Age of the car at deregistration', '注销时车龄'), def: d(arg, 'age', 9.5), unit: T(l, 'years', '年'), max: 20, decimals: 1 },
      { kind: 'select', id: 'regime', label: T(l, 'When the COE was obtained', '拥车证取得时间'), def: d(arg, 'regime', 'from2026'), options: regimeOpts(l), wide: true },
    ],
    run: (v) => {
      const arf = n(v, 'arf'), age = n(v, 'age'), rg = s(v, 'regime') as ParfRegime;
      const rate = parfRate(age, rg), r = parfRebate(arf, age, rg), cap = P.parf[rg].cap;
      return {
        label: T(l, 'PARF rebate', 'PARF 回扣'),
        value: m(r, l),
        sub: T(l, `${PCT(rate, l)} of the ARF paid${Number.isFinite(cap) ? `, cap ${m(cap, l)}` : ', no cap'}`, `已付附加注册费的 ${PCT(rate, l)}${Number.isFinite(cap) ? `，上限 ${m(cap, l)}` : '，无上限'}`),
        rows: [0, 1, 2, 3, 4, 5].map((k) => [
          k === 0 ? T(l, 'Up to 5 years', '5年以内') : T(l, `Over ${4 + k} to ${5 + k} years`, `${4 + k}至${5 + k}年`),
          m(Math.min(Math.floor(arf * P.parf[rg].rates[k]), cap), l),
        ] as [string, string]),
        note: T(l, 'Nothing after 10 years, nor for a car laid up before or a used import registered at more than 3 years old.', '超过10年、曾停用（lay-up）或进口时车龄超过3年的二手车均无 PARF。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 10. ARF */
function arf(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'omv', label: T(l, 'OMV', '公开市场价值'), def: d(arg, 'omv', 45000), unit: 'S$', max: 1000000 },
      { kind: 'choice', id: 'rg', label: T(l, 'ARF tiers', '附加注册费分级'), def: d(arg, 'rg', 'from2023'), options: [{ value: 'from2023', label: T(l, 'Since Feb 2023', '2023年2月起') }, { value: 'pre2023', label: T(l, 'Before', '之前') }] },
    ],
    run: (v) => {
      const omv = n(v, 'omv'), rg = s(v, 'rg') as ArfRegime, tiers = P.arf[rg];
      let prev = 0; const rows: Array<[string, string, number?]> = [];
      for (const [upTo, rate] of tiers) {
        const w = Math.max(0, Math.min(omv, upTo ?? Infinity) - prev);
        rows.push([upTo === null ? T(l, `Above ${m(prev, l)} at ${PCT(rate, l)}`, `${m(prev, l)}以上部分 × ${PCT(rate, l)}`) : T(l, `${m(prev, l)} to ${m(upTo, l)} at ${PCT(rate, l)}`, `${m(prev, l)}至${m(upTo, l)} × ${PCT(rate, l)}`), m(w * rate, l), w * rate]);
        if (upTo === null) break; prev = upTo;
      }
      const g = grossArf(omv, rg);
      return { label: T(l, 'ARF before VES and EEAI', '附加注册费（未计排放回扣）'), value: m(g, l), sub: T(l, `${PCT(g / Math.max(1, omv), l)} of the OMV`, `相当于 OMV 的 ${PCT(g / Math.max(1, omv), l)}`), rows };
    },
  };
}

/* ---------------------------------------------------------------- 11. de l'OMV au prix */
function omv(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'omv', label: T(l, 'OMV', '公开市场价值'), def: d(arg, 'omv', 25000), unit: 'S$', max: 1000000 },
      fuelChoice(l, arg),
      { kind: 'select', id: 'band', label: T(l, 'VES band', '车辆排放等级'), def: d(arg, 'band', 'B'), options: bandOpts(l) },
      { kind: 'choice', id: 'used', label: T(l, 'Imported used car', '进口二手车'), def: d(arg, 'used', 'no'), options: [{ value: 'no', label: T(l, 'No', '否') }, { value: 'yes', label: T(l, 'Yes', '是') }] },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel;
      const u = upfront({ omv: n(v, 'omv'), coePremium: 0, band: s(v, 'band') as VesBand, regYear: REG_YEAR, fuel, coe: LATEST_EX });
      const sur = s(v, 'used') === 'yes' ? P.usedImportSurcharge : 0;
      const before = u.basicWithoutCoe + sur;
      return {
        label: T(l, 'Taxes and fees on top of the OMV, before COE', 'OMV 之上的税费（不含拥车证）'),
        value: m(before - u.omv, l),
        sub: T(l, `Car before COE ${m(before, l)}, or ${num(before / Math.max(1, u.omv), l, 2)} × the OMV`, `不含拥车证车价 ${m(before, l)}，约为 OMV 的 ${num(before / Math.max(1, u.omv), l, 2)} 倍`),
        rows: [
          [T(l, `Excise duty (${PCT(P.exciseDutyRate, l)} of OMV)`, `消费税（OMV 的${PCT(P.exciseDutyRate, l)}）`), m(u.omv * P.exciseDutyRate, l)],
          [T(l, `GST (${PCT(P.gstRate, l)} of OMV + excise)`, `商品及服务税（OMV 加消费税的${PCT(P.gstRate, l)}）`), m(u.dutyGst - u.omv * P.exciseDutyRate, l)],
          [T(l, 'ARF (tiers)', '附加注册费（分级）'), m(u.grossArf, l)],
          [T(l, 'VES rebate or surcharge', '排放回扣或附加费'), signed(u.ves, l)],
          [T(l, 'EEAI (electric, 2026)', '电动车早期采用奖励（2026年）'), u.eeai ? `−${m(u.eeai, l)}` : m(0, l)],
          [T(l, 'Registration fee', '注册费'), m(u.registrationFee, l)],
          ...(sur ? [[T(l, 'Used import surcharge', '进口二手车附加费'), m(sur, l)] as [string, string]] : []),
        ],
      };
    },
  };
}

/* ---------------------------------------------------------------- 12. road tax */
function roadTax(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      fuelChoice(l, arg),
      { id: 'cc', label: T(l, 'Engine capacity', '引擎排量'), def: d(arg, 'cc', 1598), unit: 'cc', max: 8000 },
      { id: 'kw', label: T(l, 'Maximum power (electric motor)', '电机最大功率'), def: d(arg, 'kw', 100), unit: 'kW', max: 1500 },
      { id: 'age', label: T(l, 'Age of the car', '车龄'), def: d(arg, 'age', 3), unit: T(l, 'years', '年'), max: 40, decimals: 1 },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel, r = roadTaxAnnual({ fuel, cc: n(v, 'cc'), kw: n(v, 'kw'), age: n(v, 'age') });
      return {
        label: T(l, 'Road tax for 12 months', '12个月路税'), value: m(r.total, l, 2),
        sub: T(l, `${m(r.total / 2, l, 2)} for 6 months`, `6个月 ${m(r.total / 2, l, 2)}`),
        rows: [
          [T(l, 'Road tax', '路税'), m(r.base, l, 2), r.base],
          [T(l, `Age surcharge (${PCT(roadTaxSurcharge(n(v, 'age')), l)})`, `车龄附加费（${PCT(roadTaxSurcharge(n(v, 'age')), l)}）`), m(r.surcharge, l, 2), r.surcharge],
          [T(l, 'Additional flat component (electric)', '附加固定费用（纯电）'), m(r.afc, l, 2), r.afc],
        ],
        note: fuel === 'hybrid' ? T(l, 'Hybrid: the higher of the engine-based and the power-based amounts.', '混合动力：按排量和按功率两种算法取较高者。') : undefined,
      };
    },
  };
}

/* ---------------------------------------------------------------- 13. renouvellement de road tax */
function roadTaxRenew(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      fuelChoice(l, arg),
      { id: 'cc', label: T(l, 'Engine capacity', '引擎排量'), def: d(arg, 'cc', 1496), unit: 'cc', max: 8000 },
      { kind: 'choice', id: 'months', label: T(l, 'Renew for', '续缴'), def: d(arg, 'months', '12'), options: [{ value: '6', label: T(l, '6 months', '6个月') }, { value: '12', label: T(l, '12 months', '12个月') }] },
      { id: 'age', label: T(l, 'Age of the car', '车龄'), def: d(arg, 'age', 4), unit: T(l, 'years', '年'), max: 40, decimals: 1 },
      { id: 'kw', label: T(l, 'Maximum power (electric motor)', '电机最大功率'), def: d(arg, 'kw', 100), unit: 'kW', max: 1500, adv: true },
      { id: 'late', label: T(l, 'Months since road tax expired', '路税过期月数'), def: d(arg, 'late', 0), max: 24, decimals: 1, adv: true },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel, mo = Number(s(v, 'months')) as 6 | 12;
      const r = roadTaxRenewal({ fuel, cc: n(v, 'cc'), kw: n(v, 'kw'), age: n(v, 'age'), months: mo });
      const late = fuel === 'ev' ? 0 : roadTaxLateFee(n(v, 'cc'), n(v, 'late'));
      return {
        label: T(l, `To pay for ${mo} months of road tax`, `续缴${mo}个月路税应付`), value: m(r.total + late, l, 2),
        sub: late ? T(l, `includes a late renewal fee of ${m(late, l)}`, `含逾期费 ${m(late, l)}`) : fuel === 'ev' && n(v, 'late') > 0 ? T(l, 'LTA lists late fees by engine capacity: check the fee for an electric car on OneMotoring', '陆路交通管理局按引擎排量列出逾期费：电动车的逾期费请在 OneMotoring 查询') : T(l, 'renewed before expiry: no late fee', '到期前续缴：无逾期费'),
        rows: [
          [T(l, 'Road tax', '路税'), m(r.base, l, 2)],
          [T(l, 'Age surcharge', '车龄附加费'), m(r.surcharge, l, 2)],
          [T(l, 'Additional flat component (electric)', '附加固定费用（纯电）'), m(r.afc, l, 2)],
          [T(l, 'Late renewal fee', '逾期费'), m(late, l)],
        ],
        note: T(l, 'Before paying: valid insurance for the whole period, inspection passed if due, fines cleared.', '续缴前须有覆盖整个期间的保险、如需验车须已通过、罚款已缴清。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 14. VES et EEAI */
function ves(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'omv', label: T(l, 'OMV', '公开市场价值'), def: d(arg, 'omv', 40000), unit: 'S$', max: 1000000 },
      fuelChoice(l, arg),
      { id: 'co2', label: T(l, 'CO2 emissions', '二氧化碳排放'), def: d(arg, 'co2', 0), unit: 'g/km', max: 500, help: T(l, '0 = choose the band below', '0 = 使用下方等级') },
      { kind: 'select', id: 'band', label: T(l, 'VES band', '车辆排放等级'), def: d(arg, 'band', 'A'), options: bandOpts(l) },
    ],
    run: (v) => {
      const fuel = s(v, 'fuel') as Fuel, co2 = n(v, 'co2');
      const band = co2 > 0 ? vesBandFromCo2(co2) : (s(v, 'band') as VesBand);
      const g = grossArf(n(v, 'omv'));
      const a = netArf(g, band, 2026, fuel), b = netArf(g, band, 2027, fuel);
      return {
        label: T(l, `ARF to pay, band ${band}, registered in 2026`, `2026年注册，${band}级应付附加注册费`), value: m(a.net, l),
        sub: T(l, `${m(b.net, l)} if registered in 2027 (${signed(b.net - a.net, l)})`, `2027年注册则为 ${m(b.net, l)}（${signed(b.net - a.net, l)}）`),
        rows: [
          [T(l, 'ARF before rebates', '回扣前附加注册费'), m(g, l)],
          [T(l, 'VES 2026', '2026年排放计划'), signed(a.ves, l)],
          [T(l, 'EEAI 2026 (electric)', '2026年电动车奖励'), a.eeai ? `−${m(a.eeai, l)}` : m(0, l)],
          [T(l, 'VES 2027', '2027年排放计划'), signed(b.ves, l)],
          [T(l, 'EEAI 2027', '2027年电动车奖励'), m(0, l)],
        ],
        note: co2 > 0 ? T(l, 'Band from CO2 alone: the worst of five pollutants sets the real band, so it can only be the same or worse.', '仅按二氧化碳估算：实际等级由五种污染物中最差者决定，只会相同或更差。') : undefined,
      };
    },
  };
}

/* ---------------------------------------------------------------- 15. prêt */
function loan(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'price', label: T(l, 'Car price (taxes and COE included)', '车价（含税与拥车证）'), def: d(arg, 'price', 180000), unit: 'S$', max: 3000000 },
      { id: 'omv', label: T(l, 'OMV', '公开市场价值'), def: d(arg, 'omv', 25000), unit: 'S$', max: 1000000 },
      { id: 'loan', label: T(l, 'Loan you want', '想贷款的金额'), def: d(arg, 'loan', 108000), unit: 'S$', max: 3000000 },
      { id: 'years', label: T(l, 'Tenure', '贷款期限'), def: d(arg, 'years', 7), unit: T(l, 'years', '年'), max: 7 },
      { id: 'rate', label: T(l, 'Flat interest rate quoted', '报价的平息利率'), def: d(arg, 'rate', 3), unit: '%', max: 20, decimals: 2, help: T(l, 'Example: type the rate you were quoted', '示例：请输入您获得的报价') },
    ],
    run: (v) => {
      const r = carLoan({ price: n(v, 'price'), omv: n(v, 'omv'), loan: n(v, 'loan'), years: n(v, 'years'), flatRate: n(v, 'rate') / 100 });
      return {
        label: T(l, `Monthly instalment over ${num(r.years, l)} years`, `${num(r.years, l)}年期每月还款`), value: m(r.monthly, l),
        sub: r.capped ? T(l, `Loan cut to the ${PCT(r.ltv, l)} limit: ${m(r.maxLoan, l)}`, `贷款额已降至 ${PCT(r.ltv, l)} 上限：${m(r.maxLoan, l)}`) : T(l, `Within the ${PCT(r.ltv, l)} limit`, `在 ${PCT(r.ltv, l)} 上限之内`),
        rows: [
          [T(l, 'Largest loan allowed', '最高可贷'), m(r.maxLoan, l)],
          [T(l, 'Down payment', '首付'), m(r.downPayment, l)],
          [T(l, 'Total interest', '利息总额'), m(r.interest, l)],
          [T(l, 'Effective yearly rate', '实际年利率'), pct(r.effectiveRate, l, 2)],
        ],
        note: T(l, 'Flat rate: interest on the full loan for the whole tenure, so the effective rate is close to twice as high.', '平息利率按全额贷款计息整个期限，实际利率接近其两倍。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 16. casse / radiation */
function scrap(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'arf', label: T(l, 'ARF paid (after rebates)', '已付附加注册费（扣除回扣后）'), def: d(arg, 'arf', 35000), unit: 'S$', max: 1000000 },
      { id: 'age', label: T(l, 'Age of the car today', '目前车龄'), def: d(arg, 'age', 8), unit: T(l, 'years', '年'), max: 20, decimals: 1 },
      { id: 'paid', label: T(l, 'COE premium paid', '所付拥车证价格'), def: d(arg, 'paid', 60000), unit: 'S$', max: 400000 },
      { id: 'left', label: T(l, 'Months left on the COE', '拥车证剩余月数'), def: d(arg, 'left', 24), max: 120, decimals: 1 },
      { kind: 'select', id: 'regime', label: T(l, 'When the COE was obtained', '拥车证取得时间'), def: d(arg, 'regime', 'pre2023'), options: regimeOpts(l), adv: true, wide: true },
    ],
    run: (v) => {
      const p = parfRebate(n(v, 'arf'), n(v, 'age'), s(v, 'regime') as ParfRegime), c = coeRebate(n(v, 'paid'), Math.min(120, n(v, 'left')));
      const p1 = parfRebate(n(v, 'arf'), n(v, 'age') + 1, s(v, 'regime') as ParfRegime), c1 = coeRebate(n(v, 'paid'), Math.max(0, n(v, 'left') - 12));
      return {
        label: T(l, 'Paid back by LTA if you deregister now', '现在注销可从陆路交通管理局取回'), value: m(p + c, l),
        sub: T(l, `${m(p1 + c1, l)} one year later`, `一年后为 ${m(p1 + c1, l)}`),
        rows: [[T(l, 'PARF rebate', 'PARF 回扣'), m(p, l), p], [T(l, 'COE rebate', '拥车证回扣'), m(c, l), c], [T(l, 'Lost by waiting a year', '多等一年损失'), m(p + c - p1 - c1, l)]],
        note: T(l, 'Paid only once the car is scrapped or exported and loans and dues are cleared; to be claimed within 12 months.', '车辆须已报废或出口，并结清贷款与欠款；须在12个月内领取。'),
      };
    },
  };
}

/* ---------------------------------------------------------------- 17. possession */
function own(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'price', label: T(l, 'Price paid for the car', '购车价'), def: d(arg, 'price', 190000), unit: 'S$', max: 3000000 },
      { id: 'arf', label: T(l, 'ARF paid (after rebates)', '已付附加注册费'), def: d(arg, 'arf', 30000), unit: 'S$', max: 1000000 },
      { id: 'coe', label: T(l, 'COE premium paid', '所付拥车证价格'), def: d(arg, 'coe', premium(LATEST, 'A')), unit: 'S$', max: 400000 },
      { id: 'years', label: T(l, 'Years kept', '使用年数'), def: d(arg, 'years', 10), max: 10, decimals: 1 },
      { id: 'run', label: T(l, 'Insurance, parking, fuel, ERP per year', '每年保险、停车、油费、电子道路收费'), def: d(arg, 'run', 6000), unit: 'S$', max: 100000, help: T(l, 'Example: type your own figures', '示例：请输入您自己的数字') },
      { id: 'cc', label: T(l, 'Engine capacity (road tax)', '引擎排量（路税）'), def: d(arg, 'cc', 1496), unit: 'cc', max: 8000, adv: true },
      { kind: 'select', id: 'regime', label: T(l, 'When the COE was obtained', '拥车证取得时间'), def: d(arg, 'regime', 'from2026'), options: regimeOpts(l), adv: true, wide: true },
    ],
    run: (v) => {
      const y = Math.max(0.5, Math.min(10, n(v, 'years')));
      const p = parfRebate(n(v, 'arf'), y, s(v, 'regime') as ParfRegime), c = coeRebate(n(v, 'coe'), Math.max(0, 120 - y * 12));
      const rt = roadTaxAnnual({ fuel: 'petrol', cc: n(v, 'cc') }).total;
      const dep = n(v, 'price') - p - c, total = dep + (rt + n(v, 'run')) * y;
      return {
        label: T(l, 'Cost of owning, per month', '每月拥车成本'), value: m(total / y / 12, l),
        sub: T(l, `${m(total / y, l)} a year, ${m(total, l)} over ${num(y, l, 1)} years`, `每年 ${m(total / y, l)}，${num(y, l, 1)}年共 ${m(total, l)}`),
        rows: [
          [T(l, 'Depreciation per year', '每年折旧'), m(dep / y, l), dep / y],
          [T(l, 'Road tax per year', '每年路税'), m(rt, l), rt],
          [T(l, 'Running costs per year', '每年使用成本'), m(n(v, 'run'), l), n(v, 'run')],
          [T(l, 'PARF + COE rebate at the end', '期满时 PARF 与拥车证回扣'), m(p + c, l)],
        ],
      };
    },
  };
}

export const SPECS: Record<string, (l: Lang, arg?: Args) => ToolSpec> = {
  cost, results, bid, category, moto, renew, pqp, coeRebate: coeRebateTool, parf, arf, omv, roadTax, roadTaxRenew, ves, loan, scrap, own,
};
export const TOOL_KINDS = Object.keys(SPECS);
export function getTool(kind: string, l: Lang, arg?: Args): ToolSpec {
  const f = SPECS[kind]; if (!f) throw new Error(`simulateur inconnu : ${kind}`);
  return f(l, arg);
}
/** Lance un simulateur avec ses valeurs par défaut (ou celles données) : sert aux pages et aux tests. */
export function runTool(kind: string, l: Lang, arg?: Args, values?: V): ToolOut {
  const spec = getTool(kind, l, arg);
  const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])) as V;
  return spec.run(resolve(spec.inputs, { ...v, ...(values ?? {}) }));
}
export { PREVIOUS };
