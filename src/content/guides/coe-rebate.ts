/** « coe rebate » : formule au prorata, mois inutilisés, cas de la catégorie E, export, validité. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, premium, money, num, day, PARAMS_READ } from '../../lib/data';
import { coeRebate, unusedCoeMonths } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const R = PARAMS.rebates, X = R.ltaExample;
const en = (x: number) => money(x, 'en');
const xm = unusedCoeMonths(X.dereg, X.expiry), xr = coeRebate(X.paid, xm);
const A = premium(LATEST, 'A');
const LEFT = [96, 72, 60, 48, 36, 24, 12];
const rows = LEFT.map((m) => [`${m} months (${num(m / 12, 'en', 0)} years)`, en(coeRebate(A, m)), en(Math.min(coeRebate(A, m), Math.floor(A * R.exportCapWithin2Years)))]);
const eA = premium(LATEST, 'E');

export default defineGuide({
  id: 'coe-rebate', group: 'end', order: 21, tool: 'coeRebate', toolArg: { paid: A }, related: ['parf-rebate', 'scrap-car', 'coe-renewal', 'coe-results'], sources: ['lta-rebate', 'lta-dereg'],
  en: {
    slug: 'coe-rebate', nav: 'COE rebate', card: 'What the unused months of a COE return',
    title: 'COE Rebate Calculator 2026: Unused Months and Export Cap',
    description: 'COE rebate in 2026: the prorated formula on the premium paid, how LTA counts unused months and days, Category E and renewed COEs, export cap, 12 month limit.',
    h1: 'COE rebate: the value of the unused months',
    intro: `When a car is deregistered before its COE expires, LTA refunds the unused part of the certificate. Rules read on ${day(PARAMS_READ, 'en')}.`,
    resume: `The COE rebate is the premium you paid for a ten year certificate, multiplied by the unused months and divided by 120. A COE bought at the latest Category A premium of ${en(A)} and given up with five years left returns ${en(coeRebate(A, 60))}; with two years left, ${en(coeRebate(A, 24))}. LTA counts the unused period in whole calendar months from the day after deregistration, then adds the remaining days as thirtieths of a month. In LTA’s own worked example, a certificate bought for ${en(X.paid)} and given up with ${num(xm, 'en', 1)} months left returns ${en(xr)}. For a renewed COE the base is the PQP paid; for a car registered on a Category E COE, it is the lower of the Category E premium and that of the car’s own category in the same exercise. A car exported within two years of registration gets at most ${Math.round(R.exportCapWithin2Years * 100)} percent of the premium. Rebates must be used within ${R.validMonths} months.`,
    faqs: [
      { q: 'How is the COE rebate calculated?', a: 'Premium paid times unused months divided by 120. The unused months are counted from the day after deregistration to the expiry date: first in whole calendar months, then the leftover days at thirty days to a month, rounded to one decimal. The result is rounded down to the dollar. The calculator applies the same rule to the months you enter.' },
      { q: 'Is the COE rebate based on the current COE price?', a: 'No. It is based on what you paid for your own certificate, not on today’s premium. A car bought when premiums were low returns a small rebate even if premiums have since doubled. That gap is why used cars bought in a cheap COE period hold their value well when prices rise.' },
      { q: 'What COE rebate does a car on a Category E COE get?', a: `The lower of two amounts: the Category E premium actually paid, or the premium of the car’s own category in the same exercise. In the latest exercise, Category E closed at ${en(eA)} and Category A at ${en(A)}, so a Category A car registered on an E certificate from it would be refunded on ${en(Math.min(eA, A))}.` },
    ],
    body: (h) => `
<h2>Rebate by months left, at the latest Category A premium</h2>
${h.table(['Months left', 'COE rebate', 'If exported within 2 years'], rows, `Premium paid: ${h.m(A)}. The export cap applies only to cars deregistered for export within two years of registration. Source: LTA PARF and COE rebates.`, ['l', 'r', 'r'])}
<p>The rebate falls in a straight line: every month of use costs one hundred and twentieth of the premium. With the latest Category A premium, that is ${h.m(A / 120)} a month or ${h.m(A / 10)} a year. Unlike the PARF rebate, there are no steps: a few weeks more or less change the rebate by a few hundred dollars, not by thousands, so there is no single best date to deregister.</p>
<h2>How the months are counted</h2>
<p>LTA starts counting the day after deregistration. It first counts whole calendar months up to the expiry date, then turns the days that remain into a fraction of a month, thirty days making a month. In LTA’s example, a car deregistered on ${h.day(X.dereg)} with a COE expiring on ${h.day(X.expiry)} has ${num(Math.floor(xm), 'en')} whole months and a few days left, ${num(xm, 'en', 1)} months in all, and its ${h.m(X.paid)} certificate returns ${h.m(xr)}. The engine behind this site reproduces that example to the dollar in its tests.</p>
${h.mini('parf', { t: 'Add the PARF rebate', p: ['arf', 'age'] })}
<h2>Special cases</h2>
<p>For a COE that was renewed, the base is the PQP paid at renewal rather than the original premium. For a car registered with an open Category E certificate, the base is the lower of the Category E premium and the premium of the car’s own category in the same exercise, so using an expensive E certificate does not raise the rebate. A car deregistered for export within two years of its registration has its rebate capped at ${h.pct(R.exportCapWithin2Years)} of the premium. Off peak cars have their rebate computed on the premium net of their upfront off peak rebate. Motorcycles get a COE rebate on the same formula, which is the only refund they receive since they have no PARF.</p>
<h2>The rebate as a floor under the car’s value</h2>
<p>A used car is rarely worth less than what LTA would pay to take it off the road. Dealers call the sum of the PARF and COE rebates the paper value, and it is the starting point of most trade in offers for older cars. Because the COE rebate shrinks every month, the paper value of a car falls steadily until the COE expires, faster for a car registered when premiums were high. Checking both rebates before you negotiate tells you the lowest price that makes sense: below it, deregistering the car yourself returns more. The calculator at the top gives the COE part; the mini calculator above adds the PARF.</p>
<h2>Getting the money</h2>
<p>The COE rebate is granted once the car has been properly disposed of, scrapped at an LTA appointed yard, placed in an export processing zone or exported, and once dues to LTA and any loan are cleared. It is valid for ${R.validMonths} months from deregistration. You can encash it online, use it to offset the COE premium or PQP of another vehicle you own, or transfer it, for a fee of ${h.m(R.transferFee)}. If you use part of it, divide it first, for ${h.m(R.divideFee, 2)}, because an unused balance left in an offset is lost. The ${h.a('scrap-car', 'scrapping guide')} lists the steps, and the ${h.a('parf-rebate', 'PARF rebate page')} covers the other refund paid at the same time.</p>`,
  },
});
