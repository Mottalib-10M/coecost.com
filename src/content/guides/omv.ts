/** « omv singapore » : ce qu'est l'OMV, et tout ce qui s'y ajoute avant et avec le COE. */
import { defineGuide } from '../../lib/page-types';
import { money, pct, num, day, PARAMS_READ, LATEST, premium } from '../../lib/data';
import { P, upfront } from '../../lib/engine/car-cost';
import { LATEST_EX, REG_YEAR } from '../_facts';
import PARAMS from '../../data/params-2026.json';

const en = (x: number) => money(x, 'en');
const OMVS = [18000, 25000, 35000, 50000, 80000];
const row = (o: number) => {
  const cat = o <= 35000 ? 'A' : 'B';
  const u = upfront({ omv: o, coePremium: premium(LATEST, cat), band: 'B', regYear: REG_YEAR, fuel: 'petrol', coe: LATEST_EX });
  return { o, u, cat, mult: u.basicWithoutCoe / o, multCoe: u.basicWithCoe / o };
};
const R = OMVS.map(row);
const rows = R.map((r) => [en(r.o), en(r.u.dutyGst), en(r.u.netArf), en(r.u.basicWithoutCoe), `${num(r.mult, 'en', 2)} ×`, en(r.u.basicWithCoe)]);
const r25 = R[1];

export default defineGuide({
  id: 'omv', group: 'buy', order: 8, tool: 'omv', related: ['arf', 'ves', 'home', 'car-loan'], sources: ['lta-omv', 'lta-tax', 'iras-gst'],
  en: {
    slug: 'omv', nav: 'OMV and car taxes', card: 'From open market value to the price before COE',
    title: 'OMV Singapore 2026: Open Market Value to Price Before COE',
    description: 'OMV in Singapore for 2026: what the open market value includes, the duty, GST, ARF and fees added on top, and how many times its OMV a car costs before COE.',
    h1: 'OMV: what it is and what it adds up to',
    intro: `The open market value is the import price of a car, assessed by Singapore Customs. Every tax on a new car is calculated from it. Rules read on ${day(PARAMS_READ, 'en')}.`,
    resume: `The open market value (OMV) is what a car costs when it lands in Singapore: purchase price, freight, insurance and the other charges of delivering it, as assessed by Singapore Customs. On top of it come excise duty of ${pct(P.exciseDutyRate, 'en', 0)} of the OMV, GST of ${pct(P.gstRate, 'en', 0)} on the OMV plus duty, the ${en(P.registrationFee)} registration fee and the ARF in tiers, adjusted by the VES. A car with an OMV of ${en(r25.o)} in VES band B therefore costs ${en(r25.u.basicWithoutCoe)} before its COE, ${num(r25.mult, 'en', 2)} times its OMV, and ${en(r25.u.basicWithCoe)} with the latest Category ${r25.cat} premium. The multiple rises with the OMV because the ARF does: at ${en(R[4].o)} of OMV the car costs ${num(R[4].mult, 'en', 2)} times its OMV before the COE. The OMV is not published model by model, but it appears on a dealer’s price list and on the registration documents.`,
    faqs: [
      { q: 'Where do I find the OMV of a car?', a: 'The dealer’s price list and quotation normally show it, and the registration documents and OneMotoring record it once the car is registered. LTA also publishes average OMVs of commonly registered models by year, as a reference only. For a used car, the OMV recorded at its first registration is the one that set its ARF and its PARF.' },
      { q: 'Is the OMV the same as the dealer’s cost?', a: 'No. The OMV is the price assessed for import, including freight and insurance. The dealer also pays for marketing, its showroom, warranty and financing, and adds a margin. Those costs are not part of the OMV and do not attract ARF, but they are in the price you pay.' },
      { q: 'Does GST apply to the ARF and the COE?', a: `GST at ${pct(P.gstRate, 'en', 0)} is charged on the OMV plus the excise duty at import. The ARF, the registration fee and the COE premium are not part of that base. The dealer’s own services and margin are a separate matter between you and the dealer.` },
    ],
    body: (h) => `
<h2>From OMV to price, five examples</h2>
${h.table(['OMV', 'Duty and GST', 'ARF (band B)', 'Before COE', 'Multiple of OMV', 'With latest COE'], rows, `Registration in ${REG_YEAR}, petrol car, VES band B, ARF tiers since February 2023. COE: Category A up to ${h.m(35000)} of OMV here, Category B above, latest premium.`, ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>The category column is a simplification for the table: in reality the COE category is set by engine capacity and power, not by OMV. A powerful car can have a modest OMV and still need a Category B certificate, which the ${h.a('coe-cat-a', 'category checker')} sorts out.</p>
<h2>What the OMV includes</h2>
<p>Singapore Customs assesses the OMV from the purchase price of the car, the freight and insurance to bring it here and all other charges incidental to its sale and delivery. It is the import value, not the retail price. Two identical cars brought in by different importers can have different OMVs, and the same model’s OMV moves with exchange rates and with the importer’s purchase terms. That is why LTA’s list of average OMVs per model is offered only as a reference.</p>
<h2>What comes on top</h2>
<p>Excise duty of ${h.pct(P.exciseDutyRate)} is charged on the OMV. GST of ${h.pct(P.gstRate)}, the rate in force since ${h.day(PARAMS.gstFrom)}, is charged on the OMV plus the duty. The registration fee is ${h.m(P.registrationFee)}. The ARF is charged in slices on the OMV, as the ${h.a('arf', 'ARF page')} shows, and the VES then adds a surcharge or deducts a rebate according to emissions. An imported used car pays a surcharge of ${h.m(P.usedImportSurcharge)} on top. Only then comes the COE.</p>
${h.mini('arf', { t: 'ARF on this OMV', p: ['omv'], d: { omv: r25.o } })}
<h2>Why the multiple grows</h2>
<p>Duty and GST are proportional to the OMV, and the registration fee is fixed. The ARF is progressive: each slice of OMV pays a higher rate than the one below. So a car with a low OMV costs roughly ${num(R[0].mult, 'en', 1)} times its OMV before COE, and one with a high OMV more than ${num(Math.floor(R[4].mult * 10) / 10, 'en', 1)} times. The COE then adds the same amount to every car of a category, which weighs much more on a cheap car than on an expensive one.</p>
<p>A practical consequence: a few thousand dollars of difference in OMV between two versions of a model becomes a much larger difference in the price, once the ARF tiers are applied. Compare the versions with the calculator above rather than with the brochure price abroad.</p>
<h2>The OMV follows the car for ten years</h2>
<p>The OMV matters long after the purchase. It sets the ARF, and the ARF sets the PARF rebate the car will return if it is scrapped before ten years. It also sets how much you may borrow: the Monetary Authority of Singapore allows a loan of up to ${h.pct(P.loans.ltvLow)} of the purchase price for a car whose OMV is no more than ${h.m(P.loans.lowOmv)}, and ${h.pct(P.loans.ltvHigh)} above that line. A car just above ${h.m(P.loans.lowOmv)} of OMV therefore needs a noticeably larger down payment than one just below it. When you buy a used car, ask for the OMV on its registration record: it tells you the ARF paid and therefore the rebate still due.</p>
<h2>What the OMV does not tell you</h2>
<p>The figures above stop before the dealer’s margin, delivery, insurance and accessories, which nobody publishes and which vary from one dealer to another. Type a quoted price into the advanced field of the ${h.a('home', 'full cost calculator')} to compare it with the government charges, and see the ${h.a('car-loan', 'car loan page')} for how much of that price can be borrowed.</p>`,
  },
});
