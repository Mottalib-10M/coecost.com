/** « car loan calculator singapore » : plafonds MAS, apport, taux plat contre taux effectif. */
import { defineGuide } from '../../lib/page-types';
import { money, pct, num, day, PARAMS_READ } from '../../lib/data';
import { P, carLoan } from '../../lib/engine/car-cost';
import { CAR_A, CAR_B } from '../_facts';

const en = (x: number, d = 0) => money(x, 'en', d);
const L = P.loans;
/** Taux d'exemple = valeur par défaut du simulateur (tool-specs.ts, loan.rate), signalé comme exemple. */
const exRate = 0.03;
const a = carLoan({ price: CAR_A.u.basicWithCoe, omv: CAR_A.omv, loan: CAR_A.u.basicWithCoe, years: L.maxYears, flatRate: exRate });
const b = carLoan({ price: CAR_B.u.basicWithCoe, omv: CAR_B.omv, loan: CAR_B.u.basicWithCoe, years: L.maxYears, flatRate: exRate });
const low = carLoan({ price: 150000, omv: L.lowOmv, loan: 150000, years: L.maxYears, flatRate: exRate });
const terms = [3, 5, 7].map((y) => { const r = carLoan({ price: CAR_A.u.basicWithCoe, omv: CAR_A.omv, loan: a.maxLoan, years: y, flatRate: exRate }); return [`${y} years`, en(r.monthly), en(r.interest), pct(r.effectiveRate, 'en', 2)]; });

export default defineGuide({
  id: 'car-loan', group: 'buy', order: 10, tool: 'loan', toolArg: { price: CAR_A.u.basicWithCoe, omv: CAR_A.omv, loan: a.maxLoan }, related: ['omv', 'home', 'cost-of-owning', 'scrap-car'], sources: ['mas-loans', 'lta-tax'],
  en: {
    slug: 'car-loan-calculator', nav: 'Car loan calculator', card: 'MAS limits, down payment and real rate',
    title: 'Car Loan Calculator Singapore 2026: MAS Limits and Real Rate',
    description: `Car loan in Singapore for 2026: the MAS cap of ${pct(L.ltvLow, 'en', 0)} or ${pct(L.ltvHigh, 'en', 0)} of the price by OMV, the ${L.maxYears} year limit, the down payment, monthly instalment and the real rate.`,
    h1: 'Car loans: how much you can borrow',
    intro: `The Monetary Authority of Singapore limits car loans by the OMV of the car. Rules read on ${day(PARAMS_READ, 'en')}; type the rate a bank or dealer quoted you.`,
    resume: `A car loan in Singapore is capped by the Monetary Authority of Singapore. If the car’s OMV is ${en(L.lowOmv)} or less, you may borrow up to ${pct(L.ltvLow, 'en', 0)} of the purchase price; above that OMV, up to ${pct(L.ltvHigh, 'en', 0)}. The tenure cannot exceed ${L.maxYears} years. The purchase price includes the taxes and the COE, so on the Category A car at ${en(CAR_A.u.basicWithCoe)}, whose OMV is above the line, the largest loan is ${en(a.maxLoan)} and the cash down payment at least ${en(a.downPayment)}. Banks and dealers quote flat rates, which charge interest on the full amount for the whole tenure: at an example flat rate of ${pct(exRate, 'en', 2)} over ${L.maxYears} years, that loan costs ${en(a.monthly)} a month and ${en(a.interest)} of interest, an effective yearly rate of ${pct(a.effectiveRate, 'en', 2)}. The calculator does the conversion for the rate you were quoted. The limits do not apply to motorcycles or commercial vehicles.`,
    faqs: [
      { q: 'Does the car loan limit include the COE?', a: `Yes. MAS applies the ${pct(L.ltvLow, 'en', 0)} or ${pct(L.ltvHigh, 'en', 0)} limit to the purchase price of the car, which includes the COE, the ARF and the other taxes. A dealer package that bundles insurance or accessories into the price does not raise the limit beyond the share of what the car costs.` },
      { q: 'Why is the effective rate almost twice the flat rate?', a: 'A flat rate charges interest on the original loan for every year of the tenure, even though you repay part of it each month. On average you owe about half the original amount, so the real cost per dollar actually borrowed is close to double. The effective rate is the figure to compare with other loans.' },
      { q: 'Can I pay off a car loan early?', a: 'Usually yes, but most car loans charge an early settlement fee and work out the interest rebate with a formula that favours the lender. Ask for the settlement terms before signing. A loan must be fully repaid before the PARF and COE rebates of a deregistered car can be used or encashed.' },
    ],
    body: (h) => `
<h2>The two limits</h2>
<p>Since ${h.day(L.since)}, MAS rules cap the loan to value of a car loan by the OMV of the car: up to ${h.pct(L.ltvLow)} of the purchase price when the OMV is ${h.m(L.lowOmv)} or less, up to ${h.pct(L.ltvHigh)} when it is higher. The maximum tenure is ${L.maxYears} years for both. The rules cover loans for private cars, whether the lender is a bank or a finance company; motorcycles and commercial vehicles are outside them.</p>
<p>The line at ${h.m(L.lowOmv)} of OMV creates a step. A car with an OMV just at the line and a price of ${h.m(150000)} can borrow ${h.m(low.maxLoan)}; a car with a slightly higher OMV and the same price can borrow only ${h.m(150000 * L.ltvHigh)}. The difference, ${h.m(low.maxLoan - 150000 * L.ltvHigh)}, has to be found in cash, so it pays to check on which side of the line a model sits before choosing between two versions.</p>
<h2>Down payment on the two example cars</h2>
<p>The Category A car used on this site, at ${h.m(CAR_A.u.basicWithCoe)} before the dealer’s margin, has an OMV of ${h.m(CAR_A.omv)}, above the line. Its largest loan is ${h.m(a.maxLoan)} and its down payment at least ${h.m(a.downPayment)}. The larger car at ${h.m(CAR_B.u.basicWithCoe)} needs at least ${h.m(b.downPayment)} in cash. A real quote adds the dealer’s margin, which raises both the price and the loan limit by the same share.</p>
${h.mini('cost', { t: 'The cost per year of the car you are financing', p: ['omv', 'years'] })}
<h2>Tenure and interest</h2>
${h.table(['Tenure', 'Monthly', 'Total interest', 'Effective rate'], terms, `Loan of ${h.m(a.maxLoan)} at an example flat rate of ${h.pct(exRate, 2)}. Type the rate you were quoted in the calculator.`, ['l', 'r', 'r', 'r'])}
<p>A longer tenure lowers the monthly instalment but adds interest. It also leaves the loan outstanding for most of the period during which the car loses the bulk of its value. For a car kept ${L.maxYears} years and then sold, the loan ends just as the car changes hands; for one scrapped earlier, the remaining balance has to be repaid before any rebate can be collected.</p>
<h2>What the loan adds to the cost per year</h2>
<p>Interest is a cost of owning the car like road tax or insurance. On the Category A example, ${h.m(a.interest)} of interest spread over the ten years of the COE adds ${h.m(a.interest / 10)} a year to a cost of about ${h.m(CAR_A.perYear10)} a year in depreciation and road tax, roughly ${h.pct(a.interest / 10 / CAR_A.perYear10)} more. Paying a larger share in cash cuts that figure, but the cash then earns nothing elsewhere; the comparison only makes sense against what that money would earn, which the effective rate lets you judge.</p>
<h2>Reading a loan quote</h2>
<p>Ask for three figures: the flat rate, the tenure and the total amount payable. With those, the calculator above gives the effective yearly rate, the only one that can be compared with a personal loan, a mortgage or a deposit. Check whether the quote includes fees for processing or early settlement, and whether the dealer’s “low rate” offer comes with a higher car price. The rate shown in the calculator by default is only an example; no bank or dealer publishes a rate that this site could quote as current.</p>
<p>Most of the price being taxes and the COE, the loan finances things that partly come back at the end through the PARF and COE rebates. The ${h.a('cost-of-owning', 'cost of owning page')} shows what the car really costs per year once those rebates are counted, and the ${h.a('omv', 'OMV page')} what the price is made of.</p>`,
  },
});
