/** « ev road tax singapore » : barème à la puissance, AFC, comparaison avec un moteur thermique. */
import { defineGuide } from '../../lib/page-types';
import { money, num, day, PARAMS_READ } from '../../lib/data';
import { P, roadTaxAnnual } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const en = (x: number, d = 2) => money(x, 'en', d);
const E = P.roadTax.ev, AFC = P.roadTax.evAfcSixMonthly;
const KWS = [50, 90, 110, 150, 200, 300, 400];
const ev = (kw: number) => roadTaxAnnual({ fuel: 'ev', kw });
const rows = KWS.map((kw) => { const r = ev(kw); return [`${kw} kW`, en(r.base), en(r.afc), en(r.total)]; });
const bandRows = (() => { let prev = 0; return E.map(([up, base, rate, from]) => { const lab = up === null ? `Above ${prev} kW` : prev === 0 ? `Up to ${up} kW` : `${prev} to ${up} kW`; const f = rate === 0 ? `${en(base)} × ${P.roadTax.factor}` : `[${en(base)} + ${en(rate)} × (kW − ${from})] × ${P.roadTax.factor}`; prev = up ?? prev; return [lab, f]; }); })();
const petrol = roadTaxAnnual({ fuel: 'petrol', cc: 1598 }).total;
const e110 = ev(110).total, e150 = ev(150).total;

export default defineGuide({
  id: 'ev-road-tax', group: 'own', order: 13, tool: 'roadTax', toolArg: { fuel: 'ev', kw: 110 }, related: ['road-tax', 'ves', 'coe-cat-a', 'road-tax-renewal'], sources: ['lta-roadtax', 'lta-tax'],
  en: {
    slug: 'ev-road-tax', nav: 'EV road tax', card: 'Road tax on motor power plus the flat component',
    title: 'EV Road Tax Singapore 2026: Power Bands and Flat Component',
    description: `EV road tax in Singapore for 2026: the formula on motor power in kW, the ${en(AFC, 0)} additional flat component every six months, a table from 50 to 400 kW, hybrids.`,
    h1: 'Road tax on electric cars',
    intro: `An electric car pays road tax on the power of its motor, plus a flat component that stands in for petrol duty. Rules read on ${day(PARAMS_READ, 'en')}.`,
    resume: `An electric car pays road tax on its maximum motor power rather than on engine capacity, using power bands multiplied by ${P.roadTax.factor}, plus an additional flat component of ${en(AFC, 0)} every six months, ${en(AFC * 2, 0)} a year. A ${KWS[2]} kW car, the most powerful electric car still in COE Category A, pays ${en(e110)} a year in total; a ${KWS[3]} kW car pays ${en(e150)}, and a ${KWS[5]} kW car ${en(ev(KWS[5]).total)}. For comparison, a 1,598 cc petrol car pays ${en(petrol)}. The flat component exists because electric cars pay no duty on petrol at the pump, and it accounts for most of the road tax of a small electric car. Hybrids are taxed on whichever is higher, engine or motor, and electric cars over ten years old pay the same age surcharge as other cars. Type the motor power from the specification sheet into the calculator to get the six monthly and yearly amounts.`,
    faqs: [
      { q: 'Why do electric cars pay an additional flat component?', a: 'Road tax and petrol duty together pay for the use of the roads. An electric car pays no petrol duty, so LTA adds a fixed sum to its road tax every six months as a usage charge. It is the same for every electric car, whatever its power, and it is part of the amount you pay at each renewal.' },
      { q: 'Which power figure is used for EV road tax?', a: 'The maximum power output of the motor, in kW, as stated in the vehicle’s type approval. For a car with more than one motor, the combined power rating of all the motors is used. Brochure figures sometimes quote peak or boost power; the registered figure on OneMotoring is the one that counts.' },
      { q: 'Is EV road tax higher than for a petrol car?', a: `For small and mid sized cars it is usually similar or a little higher once the flat component is included: ${en(e110)} a year at ${KWS[2]} kW against ${en(petrol)} for a 1,598 cc petrol car. Powerful electric cars pay much more, because the rate per kW climbs steeply in the upper bands.` },
    ],
    body: (h) => `
<h2>Yearly road tax by motor power</h2>
${h.table(['Motor power', 'Road tax', 'Flat component', 'Total per year'], rows, 'Fully electric cars under 10 years old. Source: LTA vehicle tax structure.', ['l', 'r', 'r', 'r'])}
<p>The two figures add up at every renewal: renew for six months and you pay half of each. Beyond ten years the age surcharge applies to the road tax part, as for petrol cars, up to ${h.pct(P.roadTax.ageSurcharge[0][1])} after fourteen years.</p>
<h2>The power bands</h2>
${h.table(['Maximum power', 'Six monthly road tax'], bandRows, `Plus ${h.m(AFC)} of additional flat component every six months.`, ['l', 'l'])}
<p>The bands are steep at the top. Each kW between ${E[1][0]} and ${E[2][0]} kW adds ${h.m(E[2][2] * P.roadTax.factor, 2)} every six months; above ${E[2][0]} kW each kW adds ${h.m(E[3][2] * P.roadTax.factor, 2)}. That is why a high performance electric car can pay several thousand dollars of road tax a year, while a compact one pays about the same as a petrol car of similar size.</p>
${h.mini('ves', { t: 'ARF of an electric car in 2026 and 2027', p: ['omv'], d: { fuel: 'ev', band: 'A' } })}
<h2>Why the flat component exists</h2>
<p>Every vehicle pays for road use. Petrol cars do it through fuel excise duty each time they fill up; LTA puts the bill for a typical petrol car at about ${h.m(PARAMS.roadTax.typicalPetrolDutyPerYear)} a year on 92 or 95 octane. Electric cars buy no petrol, so the additional flat component of ${h.m(AFC * 2)} a year collects a comparable usage tax through road tax instead. Comparing an electric and a petrol car on road tax alone therefore flatters the petrol car: add its fuel duty, which is built into the pump price, and the two end up close.</p>
<h2>Hybrids and plug in hybrids</h2>
<p>A petrol electric hybrid is taxed twice on paper: once on its engine capacity and once on its motor power, and it pays the higher of the two. In practice most hybrids are taxed on their engine, because their motors are small. A plug in hybrid with a powerful motor can end up taxed on power. Hybrids do not pay the additional flat component, which applies to fully electric cars only.</p>
<h2>Ten years of road tax</h2>
<p>Over the ten years of a COE, a ${KWS[2]} kW electric car pays ${h.m(e110 * 10, 0)} of road tax including the flat component, and a ${KWS[3]} kW car ${h.m(e150 * 10, 0)}. A 1,598 cc petrol car pays ${h.m(petrol * 10, 0)} in road tax over the same period, before the fuel duty included in what it spends on petrol. For buyers choosing between the two, the difference in ARF, through the VES rebate and the EEAI, usually weighs more than the difference in road tax.</p>
<h2>Electric motorcycles</h2>
<p>Electric motorcycles and scooters follow the same logic with their own scale: road tax on the power rating of the motor, in lighter bands, plus an additional flat component of ${h.m(P.moto.evAfcSixMonthly)} every six months. The ${h.a('motorcycle-coe', 'motorcycle page')} has the details and a calculator.</p>
<h2>Power, category and price</h2>
<p>Motor power drives three things for an electric car: its COE category (Category A up to ${P.catA.evMaxKw} kW, Category B above), its road tax, and indirectly its OMV. Several models are sold in Singapore in a version limited to ${P.catA.evMaxKw} kW to stay in Category A. The ${h.a('coe-cat-a', 'Category A checker')} applies the limit, and the ${h.a('ves', 'VES page')} covers the rebate and the EEAI that lower the ARF of electric cars registered in 2026.</p>
<p>Charging costs replace petrol and are not part of road tax. Add them, with insurance and parking, to the running costs in the ${h.a('cost-of-owning', 'cost of owning calculator')} to compare an electric car with a petrol one over the years you plan to keep it. The ${h.a('road-tax-renewal', 'road tax renewal page')} explains how and when to pay.</p>`,
  },
});
