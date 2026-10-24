/** « cost of owning a car in singapore » : dépréciation nette des rebates, road tax, frais courants saisis par l'utilisateur. */
import { defineGuide } from '../../lib/page-types';
import { money, day, FETCHED, exName, LATEST, num } from '../../lib/data';
import { P, parfRebate, coeRebate, roadTaxAnnual } from '../../lib/engine/car-cost';
import { CAR_A, CAR_B } from '../_facts';

const en = (x: number) => money(x, 'en');
const yearsRow = (c: typeof CAR_A | typeof CAR_B, y: number) => {
  const parf = parfRebate(c.u.parfBase, y, 'from2026'), coe = coeRebate(c.coe, Math.max(0, 120 - y * 12));
  const dep = c.u.basicWithCoe - parf - coe;
  return { y, parf, coe, dep, perYear: dep / y + c.rt, perMonth: (dep / y + c.rt) / 12 };
};
const YS = [3, 5, 7, 10];
const rowsA = YS.map((y) => yearsRow(CAR_A, y));
const rowsB = YS.map((y) => yearsRow(CAR_B, y));
const tab = (rs: typeof rowsA) => rs.map((r) => [`${r.y} years`, en(r.parf + r.coe), en(r.dep / r.y), en(r.perYear), en(r.perMonth)]);
const a10 = rowsA[3], a5 = rowsA[1];

export default defineGuide({
  id: 'cost-of-owning', group: 'own', order: 14, tool: 'own', toolArg: { price: CAR_A.u.basicWithCoe, arf: CAR_A.u.parfBase, coe: CAR_A.coe }, related: ['home', 'car-loan', 'road-tax', 'scrap-car'], sources: ['lta-tax', 'lta-rebate', 'lta-roadtax', 'dgs-coe'],
  en: {
    slug: 'cost-of-owning-a-car', nav: 'Cost of owning a car', card: 'Per month and per year, rebates counted',
    title: 'Cost of Owning a Car in Singapore 2026: Per Month and Year',
    description: 'Cost of owning a car in Singapore in 2026: depreciation after the PARF and COE rebates, road tax and your running costs, per month and year, for 3 to 10 years.',
    h1: 'The cost of owning a car, per month',
    intro: `Depreciation net of the rebates you get back, road tax and the running costs you type in. COE at the ${exName(LATEST, 'en')} result, read on ${day(FETCHED, 'en')}.`,
    resume: `The largest cost of owning a car in Singapore is not petrol or parking but depreciation: the price paid minus what comes back when the car is deregistered. For the Category A car with an OMV of ${en(CAR_A.omv)}, bought at ${en(CAR_A.u.basicWithCoe)} before the dealer’s margin, depreciation and road tax come to ${en(a10.perYear)} a year, or ${en(a10.perMonth)} a month, when it is kept ten years and scrapped. Kept five years, it returns ${en(a5.parf + a5.coe)} in PARF and COE rebates, but the cost per year rises to ${en(a5.perYear)}, because the loss is spread over fewer years. Insurance, parking, petrol or charging, ERP, servicing and loan interest come on top. Nobody publishes reliable averages for those, so the calculator asks for your own figures, starting from an example you should replace. Under the PARF rules for COEs from February 2026, keeping a car to ten years has become the cheapest option per year in most cases.`,
    faqs: [
      { q: 'What is the monthly cost of owning a car in Singapore?', a: `For the Category A example, depreciation and road tax alone come to about ${en(a10.perMonth)} a month over ten years. Add your insurance, season parking, petrol, ERP and servicing, which depend on where you live and how much you drive. With a loan, add the interest as well; the car loan calculator gives it.` },
      { q: 'Is it cheaper to keep a car for five years or ten?', a: `Under the newest PARF schedule, ten years is usually cheaper per year: ${en(a10.perYear)} against ${en(a5.perYear)} for the Category A example, before running costs. Older schedules returned a much larger PARF at five years, which made early replacement more attractive. Maintenance costs rising with age can narrow the gap.` },
      { q: 'What does depreciation mean for a Singapore car?', a: 'It is the price paid minus what the car is worth at the end. For a car scrapped at the end of the period, that end value is the PARF rebate plus the COE rebate. For a car sold on the used market it is the sale price, which is usually higher than the rebates but is not published anywhere.' },
    ],
    body: (h) => `
<h2>Category A car, by years kept</h2>
${h.table(['Kept', 'Rebates at the end', 'Depreciation per year', 'With road tax, per year', 'Per month'], tab(rowsA), `OMV ${h.m(CAR_A.omv)}, ${num(CAR_A.cc, 'en')} cc, VES band B, price ${h.m(CAR_A.u.basicWithCoe)} with the latest Category A premium, PARF schedule for COEs from February 2026. Running costs not included.`, ['l', 'r', 'r', 'r', 'r'])}
<h2>Larger car, by years kept</h2>
${h.table(['Kept', 'Rebates at the end', 'Depreciation per year', 'With road tax, per year', 'Per month'], tab(rowsB), `OMV ${h.m(CAR_B.omv)}, ${num(CAR_B.cc, 'en')} cc, VES band C1, price ${h.m(CAR_B.u.basicWithCoe)} with the latest Category B premium. Running costs not included.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The rebates column is what LTA pays back on deregistration: the PARF rebate on the ARF, and the COE rebate for the unused months of the certificate. Both fall with every year the car is kept, the COE rebate to zero at ten years. The depreciation column is the price minus those rebates, divided by the years.</p>
<h2>The COE costs the same per year, the ARF does not</h2>
<p>Split the depreciation into its parts and a pattern appears. The COE comes back in proportion to the months left, so a certificate scrapped early or late always costs one tenth of its premium per year of use: ${h.m(CAR_A.coe / 10)} a year at the latest Category A result, whether the car is kept three years or ten. The ARF behaves differently. The PARF rebate falls by steps with age and stops at ten years, so the ARF costs more per year when the car is kept a short time and less when it is kept long. That is why the cost per year falls as the holding period grows in the tables above, and why the drop is steeper for the larger car, whose ARF is a bigger part of the price.</p>
<h2>Three ways to end the ten years</h2>
<p>A car can be scrapped, exported, or sold on the used market, where its value is mostly the remaining COE and PARF plus a premium for its condition. The tables above assume scrapping, the only case in which the end value is known in advance. Selling usually brings more, which lowers the real depreciation; renewing the COE swaps the PARF for another five or ten years of use, which the ${h.a('coe-renewal', 'COE renewal page')} prices. Whichever you choose, the rebate figures here are the floor under the car’s value.</p>
${h.mini('loan', { t: 'Add the cost of the loan', p: ['loan', 'rate'], d: { price: CAR_A.u.basicWithCoe, omv: CAR_A.omv, loan: Math.round(CAR_A.u.basicWithCoe * P.loans.ltvHigh) } })}
<h2>Running costs you add yourself</h2>
<p>The calculator above has a single line for insurance, parking, fuel and ERP, filled with an example. Replace it with your figures: your insurance quote, the season parking rate of your estate or office, your monthly petrol or charging bill and your ERP charges. These vary too much from one driver to another for an average to be useful, and the site does not invent one. Servicing and tyres rise with age; for a car kept ten years, budget for them in the later years, when the warranty has usually run out.</p>
<p>Road tax is the one running cost set by rule. For the ${num(CAR_A.cc, 'en')} cc car it is ${h.m(CAR_A.rt, 2)} a year, for the ${num(CAR_B.cc, 'en')} cc car ${h.m(CAR_B.rt, 2)}, and for an electric car of ${P.catA.evMaxKw} kW ${h.m(roadTaxAnnual({ fuel: 'ev', kw: P.catA.evMaxKw }).total, 2)} including the flat component. The ${h.a('road-tax', 'road tax calculator')} covers every engine size.</p>
<h2>Where the price comes from</h2>
<p>The price in the tables is the cost before the dealer’s margin: OMV, duty and GST, ARF adjusted by the VES, registration fee and COE. Type the price you were actually quoted in the calculator to see what the dealer’s margin does to your cost per year. The ${h.a('home', 'full cost calculator')} builds the price from the OMV, and the ${h.a('scrap-car', 'scrapping guide')} explains how the rebates are paid.</p>`,
  },
});
