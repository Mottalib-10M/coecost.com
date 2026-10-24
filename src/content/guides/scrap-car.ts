/** « scrap car singapore » / « deregister car » : rebates, étapes, délais et sanctions. */
import { defineGuide } from '../../lib/page-types';
import { money, num, day, PARAMS_READ } from '../../lib/data';
import { parfRebate, coeRebate } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const D = PARAMS.dereg, R = PARAMS.rebates;
const en = (x: number) => money(x, 'en');
const ex = { arf: 35000, age: 8, paid: 60000, left: 24 };
const p = parfRebate(ex.arf, ex.age, 'pre2023'), c = coeRebate(ex.paid, ex.left);
const p1 = parfRebate(ex.arf, ex.age + 1, 'pre2023'), c1 = coeRebate(ex.paid, ex.left - 12);

export default defineGuide({
  id: 'scrap-car', group: 'end', order: 23, tool: 'scrap', related: ['parf-rebate', 'coe-rebate', 'coe-renewal', 'cost-of-owning'], sources: ['lta-dereg', 'lta-rebate'],
  en: {
    slug: 'scrap-car', nav: 'Scrap or deregister a car', card: 'What LTA pays back and the steps',
    title: 'Scrap Car Singapore 2026: Rebates, Steps and Deadlines',
    description: 'Scrapping or deregistering a car in Singapore in 2026: the PARF and COE rebates you get back, three ways to dispose of it, the one month deadline, the fines.',
    h1: 'Scrapping or deregistering a car',
    intro: `What LTA pays back when a car comes off the road, how to deregister it, and the deadlines that follow. Rules read on LTA’s pages on ${day(PARAMS_READ, 'en')}.`,
    resume: `Deregistering a car ends its registration in Singapore; it must then be scrapped at an LTA appointed scrapyard, stored in an export processing zone pending export, or exported. In return LTA pays two rebates: the PARF rebate, a share of the ARF paid that falls with age and stops at ten years, and the COE rebate for the unused months of the certificate. An eight year old car with ${en(ex.arf)} of ARF, a COE from before February 2023 bought for ${en(ex.paid)} and two years left on it returns ${en(p + c)}: ${en(p)} of PARF and ${en(c)} of COE rebate. A year later the same car would return ${en(p1 + c1)}. Proof of disposal must reach LTA within ${num(D.proofMonths, 'en')} month of deregistration, the car loan must be cleared, and the rebates must be used within ${R.validMonths} months. Keeping or driving a deregistered car is an offence with heavy fines.`,
    faqs: [
      { q: 'How do I deregister my car in Singapore?', a: 'For a car that qualifies for PARF, drive or tow it to an LTA appointed scrapyard or export processing zone, then deregister it there online with Singpass 2FA. For a car without PARF, deregister online first and authorise someone to bring it to the yard within eight calendar days. Scrapyards work by appointment only, so book first.' },
      { q: 'What happens if I do not submit proof of disposal?', a: `Proof that the car was scrapped, exported or stored in an export processing zone is due within ${num(D.proofMonths, 'en')} month of deregistration. Missing it is an offence: the owner can be prosecuted, with a fine of up to ${en(D.noProofFine)} or ${D.noProofJailMonths} months in jail, and more for repeat offenders. The rebates are not paid until the proof is in.` },
      { q: 'Can I keep my car plate number when I scrap the car?', a: `Yes, if you apply to retain it before or at deregistration, at the scrapyard, the export processing zone or LTA’s service centre. You have up to ${num(D.keepPlateMonths, 'en')} month after deregistration to complete the retention. The retained number can then be put on another vehicle registered in your name.` },
    ],
    body: (h) => `
<h2>Scrap now or in a year</h2>
<p>The calculator at the top shows what LTA pays if you deregister today and what the same car would return a year later. The difference is the cost of keeping the car one more year, before running costs. In the example above, waiting a year costs ${h.m(p + c - p1 - c1)} in rebates: ${h.m(c - c1)} of COE rebate, which shrinks every month, and ${h.m(p - p1)} of PARF, which drops by a step on each anniversary. For a car on the newest PARF schedule the PARF steps are small, and the COE rebate does most of the work.</p>
<h2>Three ways to dispose of the car</h2>
<p>Scrapping at an LTA appointed scrapyard is the usual route for an old car. Storing the car in an LTA appointed export processing zone, for up to ${D.epzMonths} months, lets it wait for a buyer abroad; when it leaves, the export documents must reach LTA within ${D.epzExportDocsDays} days, or when the ${D.epzMonths} months are up. Exporting directly requires customs and shipping documents, or proof of registration in the new country. Many owners hand the whole process to a motor dealer; LTA suggests using a CaseTrust accredited dealer.</p>
${h.mini('coeRebate', { t: 'COE rebate on your months left', p: ['paid', 'months'] })}
<h2>Before you go</h2>
<p>The car must not be under financing: clear the loan first, because the rebates cannot be used while it is outstanding. Any road tax arrears or amounts owed to LTA are collected during the deregistration, and if the road tax has lapsed you pay arrears and late fees. Engine and chassis numbers must match LTA’s records. If you want to keep the registration number, apply before or at deregistration.</p>
<h2>After deregistration</h2>
<p>LTA notifies the last registered owner of the rebates granted and any arrears. Unused road tax is refunded automatically. The rebates are then valid for ${R.validMonths} months: you can encash them online, use them against the taxes and COE of your next car or the PQP of another car you own, or transfer them, as the ${h.a('parf-rebate', 'PARF rebate page')} explains. A deregistered car has no road tax and no insurance and may not be driven; moving it means towing or transporting it. Keeping or using one can lead to a fine of up to ${h.m(D.keepFine)} or ${D.keepJailYears} years in jail.</p>
<h2>Special cases</h2>
<p>Different steps apply when the car was stolen or lost through criminal breach of trust, when its owner has died or is an undischarged bankrupt, and for vehicles of diplomats; LTA’s deregistration page covers each. Motorcycles, goods vehicles and other vehicles without PARF follow the same disposal rules but receive only the COE rebate. A car that has been laid up at any point in its life has no PARF rebate either, even if it is under ten years old, so check its history before counting on one.</p>
<h2>Scrap, sell or renew</h2>
<p>Scrapping returns the rebates and nothing more. Selling to a dealer or a private buyer usually brings at least the rebates plus something for the car’s condition, and the buyer takes over the deregistration later. Renewing the COE keeps the car, gives up the PARF and costs the PQP; the ${h.a('coe-renewal', 'COE renewal page')} compares that option, and the ${h.a('coe-rebate', 'COE rebate page')} details how the unused months are counted.</p>`,
  },
});
