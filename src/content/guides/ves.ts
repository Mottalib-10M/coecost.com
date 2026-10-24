/** « ves singapore » (+ EEAI fusionné) : bandes, montants 2026 et 2027, plancher, effet sur le PARF. */
import { defineGuide } from '../../lib/page-types';
import { money, signed, day, PARAMS_READ, pct } from '../../lib/data';
import { P, grossArf, netArf, type VesBand } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const en = (x: number) => money(x, 'en');
const B: VesBand[] = ['A', 'B', 'C1', 'C2', 'C3'];
const co2 = (() => { let prev = 0; return P.vesCo2.map(([b, up]) => { const s = up === null ? `above ${prev}` : prev === 0 ? `up to ${up}` : `${prev + 1} to ${up}`; prev = up ?? prev; return [b, s] as [string, string]; }); })();
const rows = B.map((b, i) => [b, `${co2[i][1]} g/km`, signed(P.ves[2026][b], 'en'), signed(P.ves[2027][b], 'en')]);
const omv = 40000, g = grossArf(omv);
const exRows = B.map((b) => [b, en(netArf(g, b, 2026, 'petrol').net), en(netArf(g, b, 2027, 'petrol').net)]);
const ev = netArf(g, 'A', 2026, 'ev'), ev27 = netArf(g, 'A', 2027, 'ev');
const EF = PARAMS.ves.evEmissionFactor;

export default defineGuide({
  id: 'ves', group: 'buy', order: 9, tool: 'ves', related: ['arf', 'ev-road-tax', 'parf-rebate', 'omv'], sources: ['lta-ves', 'lta-tax'],
  en: {
    slug: 'ves', nav: 'VES and EEAI', card: 'Emission rebates and surcharges, 2026 and 2027',
    title: 'VES Singapore 2026: Bands, Rebates, Surcharges and EEAI',
    description: 'Vehicular Emissions Scheme in 2026: the five bands, rebates and surcharges for 2026 and 2027, the EEAI for EVs ending this year, the ARF floor and PARF effect.',
    h1: 'VES: emission rebates and surcharges',
    intro: `The Vehicular Emissions Scheme adjusts the ARF of every new car according to its emissions. Amounts read on LTA’s pages on ${day(PARAMS_READ, 'en')}.`,
    resume: `Under the Vehicular Emissions Scheme a new car falls into one of five bands, set by the worst of five measurements: carbon dioxide, hydrocarbons, carbon monoxide, nitrogen oxides and particulate matter. For cars registered in 2026, band A earns a rebate of ${en(-P.ves[2026].A)} off the ARF, band B pays nothing extra, and bands C1, C2 and C3 pay surcharges of ${en(P.ves[2026].C1)}, ${en(P.ves[2026].C2)} and ${en(P.ves[2026].C3)}. In 2027 the band A rebate falls to ${en(-P.ves[2027].A)} and the surcharges rise to ${en(P.ves[2027].C1)}, ${en(P.ves[2027].C2)} and ${en(P.ves[2027].C3)}. A fully electric car registered in 2026 also gets the EEAI, ${pct(P.eeai.rate, 'en', 0)} of its ARF up to ${en(P.eeai.cap[2026])}, until the scheme ends on ${day(PARAMS.eeai.ends, 'en')}. On an OMV of ${en(omv)}, that makes the ARF ${en(ev.net)} for an electric car registered in 2026 against ${en(ev27.net)} in 2027.`,
    faqs: [
      { q: 'How do I know the VES band of a car?', a: 'The band is assessed for each model and variant from its test results and is shown by the dealer and in LTA’s records. It is set by the worst of five pollutants, not by CO2 alone. The calculator can suggest a band from CO2, but only as a floor: the real band can be the same or worse, never better.' },
      { q: 'Does the VES apply to electric cars?', a: `Yes. An electric or plug in hybrid car is rated on CO2 by applying an emission factor of ${EF.gPerWh} g of CO2 per Wh to its electricity consumption, for cars registered from ${day(EF.from, 'en')} to ${day(EF.to, 'en')}. Most fully electric cars land in band A and receive the rebate, plus the EEAI in 2026.` },
      { q: 'What is the minimum ARF after a VES rebate?', a: `${en(P.minArf)} for most cars: a rebate cannot take the ARF below that floor. Fully electric cars registered up to ${P.evNoMinArfTo} have no floor, so the VES rebate and the EEAI together can bring their ARF down to zero on a low OMV. A surcharge is never limited by the floor.` },
      { q: 'Does a VES surcharge increase the PARF rebate?', a: 'No. LTA computes the PARF rebate on the ARF paid without the surcharge, so a surcharge is a cost that never comes back. A rebate, on the other hand, lowers the ARF on which PARF is computed. In both cases the cleaner car keeps the better deal over its life.' },
    ],
    body: (h) => `
<h2>The five bands</h2>
${h.table(['Band', 'CO2 limit (one of five tests)', 'Registered in 2026', 'Registered in 2027'], rows, 'Negative = rebate off the ARF, positive = surcharge. The worst of CO2, HC, CO, NOx and PM sets the band. Source: LTA vehicle emission schemes.', ['l', 'l', 'r', 'r'])}
<p>The CO2 column shows only one of the five tests. A car can meet the CO2 limit of band B and still be placed in C1 because of its nitrogen oxides or particulate matter. That is the most common surprise for buyers who compare cars by fuel economy alone, and it is why the dealer’s stated band is the figure to use.</p>
<h2>What it does to the ARF</h2>
${h.table(['Band', 'ARF, registered in 2026', 'ARF, registered in 2027'], exRows, `Petrol car with an OMV of ${h.m(omv)}, gross ARF ${h.m(g)}. Calculated with the amounts above.`, ['l', 'r', 'r'])}
<p>Between the cleanest and the most polluting band, the ARF on the same OMV differs by ${h.m(P.ves[2026].C3 - P.ves[2026].A)} in 2026 and ${h.m(P.ves[2027].C3 - P.ves[2027].A)} in 2027. The scheme is revised every few years: the 2027 amounts are already published, with a smaller rebate and larger surcharges, so a car in band C registered in January 2027 will cost more than the same car registered in December 2026.</p>
${h.mini('cost', { t: 'Cost per year with your band', p: ['omv', 'band'] })}
<h2>Registering in December or in January</h2>
<p>Because the amounts depend on the year of registration, not on the date of purchase, the turn of the year matters for anyone whose car is delivered around it. On the ${h.m(omv)} example, a band C1 car costs ${h.m(netArf(g, 'C1', 2027, 'petrol').net - netArf(g, 'C1', 2026, 'petrol').net)} more in ARF if it is registered in January 2027 rather than December 2026. For an electric car in band A the gap is larger, ${h.m(ev27.net - ev.net)}, because the EEAI disappears at the same moment as the band A rebate shrinks. A temporary COE gives a few months to register; when the delivery date is close to the year end, ask the dealer which year the registration will fall in and whether the quote assumes it.</p>
<h2>Comparing two versions of a model</h2>
<p>Versions of the same car often sit in different bands: a mild hybrid in band A, the petrol version in B, the sport version in C1. The band difference comes straight off or on top of the ARF, and it adds to the difference in OMV. Run both versions through the calculator above with their own OMV and band before comparing prices.</p>
<h2>The EEAI for electric cars</h2>
<p>The EV early adoption incentive cuts the ARF of a fully electric car by ${h.pct(P.eeai.rate)}, with a cap that has fallen year after year: ${h.m(P.eeai.cap[2024])} for cars registered in 2024 and 2025, and ${h.m(P.eeai.cap[2026])} in 2026. It ends on ${h.day(PARAMS.eeai.ends)}. Together with the band A rebate and the absence of an ARF floor, it makes the ARF of a modest electric car small or nil. From 2027 only the VES rebate will remain, at its lower 2027 level.</p>
<p>Electric cars have other rules of their own: Category A only up to ${P.catA.evMaxKw} kW, road tax on motor power with an additional flat component, and a CO2 rating from electricity use. The ${h.a('ev-road-tax', 'EV road tax page')} covers the yearly side.</p>
<h2>VES and the rebate at the end</h2>
<p>The VES works once, at registration. When the car is deregistered before ten years, the PARF rebate is a share of the ARF actually paid after any VES rebate or EEAI, and without any surcharge. A band A car therefore gets back a little less PARF than a band B car, having paid less ARF to begin with, while a band C car never sees its surcharge again. The ${h.a('parf-rebate', 'PARF rebate calculator')} applies that rule, and the ${h.a('arf', 'ARF page')} shows the gross ARF before any of this.</p>`,
  },
});
