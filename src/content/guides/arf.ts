/** « arf singapore » / « arf calculator » : paliers, taux effectif selon l'OMV, plancher, lien avec PARF. */
import { defineGuide } from '../../lib/page-types';
import { money, pct, day, PARAMS_READ } from '../../lib/data';
import { P, grossArf, parfRebate } from '../../lib/engine/car-cost';
import { CAR_A, CAR_B } from '../_facts';

const en = (x: number) => money(x, 'en');
const T = P.arf.from2023, O = P.arf.pre2023;
const OMVS = [15000, 25000, 35000, 50000, 70000, 100000, 150000];
const effRows = OMVS.map((o) => [en(o), en(grossArf(o, 'from2023')), pct(grossArf(o, 'from2023') / o, 'en', 0), en(grossArf(o, 'pre2023'))]);
const tierRows = (t: typeof T) => { let prev = 0; return t.map(([up, r]) => { const row = [up === null ? `Above ${en(prev)}` : `${en(prev)} to ${en(up)}`, pct(r, 'en', 0)]; prev = up ?? prev; return row; }); };
const gap100 = grossArf(100000, 'from2023') - grossArf(100000, 'pre2023');

export default defineGuide({
  id: 'arf', group: 'buy', order: 7, tool: 'arf', related: ['omv', 'ves', 'parf-rebate', 'coe-cat-b'], sources: ['lta-arf', 'lta-tax', 'lta-ves'],
  en: {
    slug: 'arf', nav: 'ARF calculator', card: 'Additional registration fee by OMV slice',
    title: 'ARF Singapore 2026: Additional Registration Fee Calculator',
    description: 'ARF in Singapore for 2026: the five tiers on the OMV since February 2023, the older four tiers, the effective rate from $15,000 to $150,000 and the ARF floor.',
    h1: 'ARF: the additional registration fee',
    intro: `The ARF is a tax charged in slices on the open market value when a car is registered. Tiers read on LTA’s pages on ${day(PARAMS_READ, 'en')}.`,
    resume: `The additional registration fee is charged on the open market value in slices, each with its own rate. For cars registered with a COE from the second exercise of February 2023, the first ${en(T[0][0]!)} of OMV pays ${pct(T[0][1], 'en', 0)}, the next ${en(T[1][0]! - T[0][0]!)} pays ${pct(T[1][1], 'en', 0)}, then ${pct(T[2][1], 'en', 0)} up to ${en(T[2][0]!)}, ${pct(T[3][1], 'en', 0)} up to ${en(T[3][0]!)} and ${pct(T[4][1], 'en', 0)} above. A car with an OMV of ${en(CAR_A.omv)} pays ${en(grossArf(CAR_A.omv))}, ${pct(grossArf(CAR_A.omv) / CAR_A.omv, 'en', 0)} of its OMV; at ${en(100000)} of OMV the ARF is ${en(grossArf(100000))}, ${pct(grossArf(100000) / 100000, 'en', 0)}. The VES then adds a surcharge or deducts a rebate, an electric car registered in 2026 gets the EEAI, and after a rebate the ARF cannot fall below ${en(P.minArf)}, except for electric cars. Part of the ARF comes back as the PARF rebate if the car is scrapped before ten years.`,
    faqs: [
      { q: 'How is ARF calculated in Singapore?', a: `The OMV is cut into slices and each slice is multiplied by its rate: ${pct(T[0][1], 'en', 0)} on the first ${en(T[0][0]!)}, rising to ${pct(T[4][1], 'en', 0)} on everything above ${en(T[3][0]!)} for COEs from February 2023. The results are added and rounded up to the dollar. The VES rebate or surcharge and the EEAI are then applied to that figure.` },
      { q: 'Which ARF tiers apply to my car?', a: 'The tiers depend on the exercise in which the COE used to register the car was obtained. A COE from the second exercise of February 2023 onwards uses the five tier schedule; an earlier one uses the four tier schedule, which is lighter on expensive cars. Taxis and COE exempt vehicles follow the registration date instead.' },
      { q: 'Is the ARF refunded when I scrap my car?', a: `Partly, through the PARF rebate, if the car is deregistered before it is ten years old and was never laid up. For COEs from February 2026 the refund starts at ${pct(P.parf.from2026.rates[0], 'en', 0)} of the ARF paid and is capped at ${en(P.parf.from2026.cap)}. Any VES surcharge paid is left out of the PARF calculation.` },
    ],
    body: (h) => `
<h2>The tiers</h2>
${h.table(['OMV slice', 'Rate'], tierRows(T), 'ARF for cars registered with COEs obtained from the 2nd exercise of February 2023. Source: LTA vehicle tax structure.', ['l', 'r'])}
${h.table(['OMV slice', 'Rate'], tierRows(O), 'ARF for cars registered with COEs obtained before that exercise.', ['l', 'r'])}
<p>The five tier schedule applies to COEs from the second exercise of February 2023. Up to ${h.m(T[1][0]!)} of OMV the two schedules charge exactly the same, so cars with modest OMVs saw no change; above that the new slices are taxed harder and the difference grows with the OMV. At ${h.m(100000)} of OMV the new tiers charge ${h.m(gap100)} more than the old ones.</p>
<h2>Effective rate by OMV</h2>
${h.table(['OMV', 'ARF since Feb 2023', 'As % of OMV', 'ARF before'], effRows, 'Before VES and EEAI. Calculated with the tiers above.', ['r', 'r', 'r', 'r'])}
<p>The effective rate rises steadily with the OMV: a car with ${h.m(OMVS[0])} of OMV pays an ARF equal to its OMV, one with ${h.m(OMVS[OMVS.length - 1])} pays well over twice its OMV. Because the rate climbs on each extra dollar, two cars that differ by ${h.m(10000)} of OMV can differ by ${h.m(grossArf(70000) - grossArf(60000))} of ARF when both sit above ${h.m(T[2][0]!)}.</p>
${h.mini('ves', { t: 'ARF after the emission rebate or surcharge', p: ['omv', 'band'] })}
<h2>From gross ARF to the ARF you pay</h2>
<p>Two adjustments come after the tiers. The Vehicular Emissions Scheme puts every car in one of five bands according to the worst of five pollutants and adds a surcharge of up to ${h.m(P.ves[2026].C3)} or deducts a rebate of up to ${h.m(-P.ves[2026].A)} in 2026; the ${h.a('ves', 'VES page')} has the bands. An electric car registered in 2026 also gets the EV early adoption incentive, ${h.pct(P.eeai.rate)} of the ARF up to ${h.m(P.eeai.cap[2026])}. After a rebate the ARF cannot drop below ${h.m(P.minArf)}, except for fully electric cars registered up to ${P.evNoMinArfTo}, which have no floor.</p>
<p>For the two examples used across this site: the Category A car with an OMV of ${h.m(CAR_A.omv)} pays ${h.m(CAR_A.u.grossArf)} of ARF in band B, with no adjustment; the larger car with an OMV of ${h.m(CAR_B.omv)} pays ${h.m(CAR_B.u.grossArf)} of tiered ARF and ${h.m(CAR_B.u.netArf)} once the band C1 surcharge is added.</p>
<h2>Imported used cars</h2>
<p>A used car imported into Singapore pays the same tiers on its own OMV, assessed by Singapore Customs when it arrives, plus a used import surcharge of ${h.m(P.usedImportSurcharge)}. Its PARF prospects are narrower: only a used import no more than three years old when registered here can earn a PARF rebate, and only if it is deregistered before ten years. The ${h.a('omv', 'OMV calculator')} has a switch for the surcharge.</p>
<h2>Checking a dealer’s figure</h2>
<p>A price list gives the OMV, sometimes the ARF, and the price with or without COE. Typing the OMV into the calculator above shows whether the ARF line matches the tiers, and which schedule was used. If the dealer’s ARF is higher, ask about the VES band: a surcharge is often the reason. If it is lower, a VES rebate or the EEAI has probably been deducted already.</p>
<h2>ARF and the price of the car</h2>
<p>The ARF is usually the second largest item after the COE for a small car and can become the largest for an expensive one. It is included in the dealer’s price but not in the OMV, which is why the price list shows both. The ${h.a('omv', 'OMV page')} adds every tax and fee on top of the OMV, and the ${h.a('home', 'full cost calculator')} adds the COE and the rebates to give a cost per year.</p>
<p>The ARF is also the base of the PARF rebate. A car on the newest schedule scrapped at five years returns ${h.pct(P.parf.from2026.rates[0])} of it: ${h.m(parfRebate(CAR_A.u.parfBase, 5, 'from2026'))} for the Category A example. The ${h.a('parf-rebate', 'PARF rebate page')} shows the shares by age and the caps.</p>`,
  },
});
