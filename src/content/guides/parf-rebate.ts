/** « parf rebate » : trois barèmes selon l'exercice du COE, éligibilité, usage du rebate. */
import { defineGuide } from '../../lib/page-types';
import { money, day, FETCHED, pct, PARAMS_READ } from '../../lib/data';
import { P, parfRebate, type ParfRegime } from '../../lib/engine/car-cost';
import { CAR_A, CAR_B } from '../_facts';
import PARAMS from '../../data/params-2026.json';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const REG: ParfRegime[] = ['pre2023', 'y2023to2026', 'from2026'];
const ex = { arf: 40000, age: 6.5 };
const at = (rg: ParfRegime, arf = ex.arf, age = ex.age) => parfRebate(arf, age, rg);
const big = CAR_B.u.parfBase;
const ages = (l: 'en' | 'zh') => [0, 1, 2, 3, 4, 5].map((k) => k === 0 ? (l === 'en' ? 'Up to 5 years' : '5年或以下') : (l === 'en' ? `Over ${4 + k} to ${5 + k} years` : `超过${4 + k}年至${5 + k}年`));
const sched = (l: 'en' | 'zh') => ages(l).map((a, k) => [a, ...REG.map((rg) => pct(P.parf[rg].rates[k], l, 0))]);
const R = PARAMS.rebates;
const d5old = at('pre2023', CAR_A.u.netArf, 5) - at('pre2023', CAR_A.u.netArf, 9.5), d5new = at('from2026', CAR_A.u.netArf, 5) - at('from2026', CAR_A.u.netArf, 9.5);

export default defineGuide({
  id: 'parf-rebate', group: 'end', order: 22, tool: 'parf', related: ['coe-rebate', 'scrap-car', 'coe-renewal', 'arf'], sources: ['lta-rebate', 'lta-parf-2026', 'lta-dereg'],
  en: {
    slug: 'parf-rebate', nav: 'PARF rebate', card: 'What you get back on the ARF, by age',
    title: 'PARF Rebate 2026: New Schedule, Cap and Calculator by Age',
    description: 'PARF rebate in 2026 under the three schedules (COE before Feb 2023, to Feb 2026, from Feb 2026), the caps, who qualifies, how to encash, offset or transfer it.',
    h1: 'PARF rebate: what you get back on the ARF',
    intro: `The share of the ARF a car returns when it is deregistered before ten years. Rules read on LTA’s pages on ${day(PARAMS_READ, 'en')}.`,
    resume: `The PARF rebate is a share of the ARF you actually paid, after any VES rebate or EEAI, returned when a car is deregistered before it turns ten. Three schedules exist, set by the exercise in which the COE was obtained. Before the second exercise of February 2023: ${pct(P.parf.pre2023.rates[0], 'en', 0)} up to five years, falling five points a year to ${pct(P.parf.pre2023.rates[5], 'en', 0)} in the tenth year, no cap. From then to the first exercise of February 2026: the same shares with a cap of ${en(P.parf.y2023to2026.cap)}. From the second exercise of February 2026: ${pct(P.parf.from2026.rates[0], 'en', 0)} down to ${pct(P.parf.from2026.rates[5], 'en', 0)}, capped at ${en(P.parf.from2026.cap)}. A car with ${en(ex.arf)} of ARF scrapped at ${ex.age} years returns ${en(at('pre2023'))}, ${en(at('y2023to2026'))} or ${en(at('from2026'))} under the three schedules. Nothing is paid after ten years, or for a car that has been laid up.`,
    faqs: [
      { q: 'Why was the PARF rebate cut in February 2026?', a: 'Budget 2026 lowered the schedule and the cap. LTA explained that PARF exists to encourage owners to replace cars early, so that the fleet becomes safer and less polluting, and that electric cars, now more common, reduce the need for that incentive. The new schedule applies only to cars whose COE was obtained from the second exercise of February 2026.' },
      { q: 'Does an imported used car get a PARF rebate?', a: 'Only if it was no more than three years old when it was registered in Singapore, and registered on or after 1 September 2007. It must also be deregistered before it is ten years old, counted from its original registration date, and must never have been laid up. Otherwise the rebate is nil.' },
      { q: 'Is the PARF rebate based on the ARF before or after VES?', a: `After any rebate, but without any surcharge. For a car that received a VES rebate, an EEAI or another incentive, the PARF rebate is computed on the net ARF actually paid. For a car that paid a VES surcharge, LTA leaves the surcharge out: the PARF is computed on the ARF before it. Type the figure on that basis in the calculator.` },
      { q: 'How long do I have to use the PARF rebate?', a: `${R.validMonths} months from the deregistration date. Within that time you can encash it, use it to offset the registration fee, ARF, COE premium and surcharges of a new car, or transfer it to another person; transfer costs ${en(R.transferFee)} and dividing a rebate before splitting it costs ${en(R.divideFee)}. An unused rebate expires.` },
    ],
    body: (h) => `
<h2>The three schedules side by side</h2>
${h.table(['Age at deregistration', 'COE before Feb 2023', `Feb 2023 to Feb 2026 (cap ${h.m(P.parf.y2023to2026.cap)})`, `From Feb 2026 (cap ${h.m(P.parf.from2026.cap)})`], sched('en'), 'Share of the ARF paid that is returned. More than 10 years: nil. Taxis and COE exempt cars follow the dates of registration instead. Source: LTA, PARF and COE rebates.', ['l', 'r', 'r', 'r'])}
<p>The schedule is fixed for the life of the car. It depends on the exercise in which the COE used to register the car was won, not on the date you scrap it. A car registered in 2025 keeps the old shares with the ${h.m(P.parf.y2023to2026.cap)} cap even if it is scrapped in 2030; a car whose COE came from the second exercise of February 2026 or later is on the new schedule from day one.</p>
<h2>How age is counted</h2>
<p>Age runs from the original registration date. A car deregistered on the day it turns five is still “not more than five years” old and gets the top share; one day later it drops to the next band. That makes the timing of a sale or scrapping worth checking against the anniversary of registration, especially under the older schedules, where a band is worth five percent of the ARF. The calculator takes age in years with one decimal; for a date close to an anniversary, check the exact registration date on OneMotoring.</p>
${h.mini('coeRebate', { t: 'And the COE rebate on top', p: ['paid', 'months'] })}
<h2>What the 2026 schedule changes</h2>
<p>Under the older schedules, scrapping early paid well. For a car with ${h.m(CAR_A.u.netArf)} of ARF, deregistering at five years instead of in the tenth year was worth ${h.m(d5old)} more in PARF. Under the schedule for COEs from February 2026 the same choice is worth only ${h.m(d5new)}. Early scrapping becomes much less attractive, the floor under used car prices drops, and the decision at ten years leans towards renewing, since little PARF is left to give up. Buyers comparing a new car with one registered before the change should count the larger PARF the older car still carries.</p>
<h2>Who gets a PARF rebate</h2>
<p>Private cars, off peak cars, company cars and private hire cars qualify if they were new when registered in Singapore, or imported used cars no more than three years old registered on or after 1 September 2007. The car must be deregistered before it is ten years old and must never have been laid up. Taxis qualify within their statutory lifespan. Goods cum passenger vehicles, classic and vintage cars and laid up vehicles do not.</p>
<p>The rebate is computed on the net ARF actually paid, leaving out any VES surcharge. For the Category A car on the ${h.a('home', 'home page')}, with ${h.m(CAR_A.u.netArf)} of ARF, the new schedule returns ${h.m(parfRebate(CAR_A.u.netArf, 5, 'from2026'))} at five years. For the larger car on the ${h.a('coe-cat-b', 'Category B page')}, whose ARF before its band C1 surcharge is ${h.m(big)}, the share at five years would be ${h.m(Math.floor(big * P.parf.from2026.rates[0]))}, so the ${h.m(P.parf.from2026.cap)} cap ${big * P.parf.from2026.rates[0] > P.parf.from2026.cap ? 'applies' : 'does not bite'}.</p>
<h2>Using the rebate</h2>
<p>PARF and COE rebates are granted once the deregistered car has been properly disposed of: scrapped at an LTA appointed scrapyard, stored in an export processing zone pending export, or exported with approved documents. Outstanding payments to LTA and any car loan must be cleared first. You then have ${R.validMonths} months to encash the rebate online with Singpass, to offset the taxes and COE of a new car, or to transfer it to someone else. Encashed rebates go to your GIRO refund account or by PayNow. The ${h.a('scrap-car', 'scrapping guide')} walks through the steps, and LTA’s ${h.src('lta-rebate', 'rebate page')} has the forms.</p>`,
  },
  zh: {
    slug: 'parf-rebate', nav: 'PARF 回扣', card: '按车龄取回附加注册费',
    title: 'PARF 回扣 2026：新比例、上限与按车龄计算',
    description: '2026年 PARF 回扣：三种比例（2023年2月前、2023年2月至2026年2月、2026年2月起取得的拥车证）、上限、谁有资格，以及如何兑现、抵付或转让回扣。',
    h1: 'PARF 回扣：取回部分附加注册费',
    intro: `车辆在十年内注销时可取回的附加注册费比例。规则于${day(PARAMS_READ, 'zh')}读取自陆路交通管理局网页。`,
    resume: `PARF 回扣是您实际所付附加注册费（扣除车辆排放计划回扣或电动车早期采用奖励后）的一部分，在车辆满十年之前注销时退还。目前有三种比例，由取得拥车证的轮次决定。2023年2月第二轮之前：五年内 ${pct(P.parf.pre2023.rates[0], 'zh', 0)}，之后每年减五个百分点，第十年为 ${pct(P.parf.pre2023.rates[5], 'zh', 0)}，没有上限。之后至2026年2月第一轮：比例相同，上限 ${zh(P.parf.y2023to2026.cap)}。2026年2月第二轮起：从 ${pct(P.parf.from2026.rates[0], 'zh', 0)} 降到 ${pct(P.parf.from2026.rates[5], 'zh', 0)}，上限 ${zh(P.parf.from2026.cap)}。一辆附加注册费为 ${zh(ex.arf)} 的车，在车龄 ${ex.age} 年时报废，按三种比例分别可取回 ${zh(at('pre2023'))}、${zh(at('y2023to2026'))} 或 ${zh(at('from2026'))}。车龄超过十年，或曾经封存的车辆，没有 PARF 回扣。在计算器中输入已付附加注册费和注销时的车龄，即可得到您的回扣金额。`,
    faqs: [
      { q: '为什么2026年2月下调 PARF 回扣？', a: '2026年财政预算案下调了比例和上限。陆路交通管理局解释，PARF 的作用是鼓励车主提早换车，让车辆更安全、污染更少；而电动车越来越普遍，减少了这种鼓励的必要。新比例只适用于2026年2月第二轮起取得拥车证的汽车，之前的车辆维持原来的比例。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
      { q: '进口二手车有 PARF 回扣吗？', a: '只有在新加坡注册时车龄不超过三年、并且在2007年9月1日或之后注册的进口二手车才有。车辆还必须在车龄满十年前注销（车龄从原始注册日期起算），而且从未封存过。不符合这些条件，回扣为零，只剩下拥车证回扣。购买前可在 OneMotoring 查询。' },
      { q: 'PARF 回扣按排放计划之前还是之后的附加注册费计算？', a: '扣除回扣之后，但不含附加费。获得车辆排放计划回扣、电动车早期采用奖励或其他优惠的车，PARF 回扣以实际所付的附加注册费净额计算。缴付了排放附加费的车，陆路交通管理局不计入这笔附加费，PARF 按附加费之前的附加注册费计算。请按这个基础在计算器中输入金额。' },
      { q: 'PARF 回扣要在多久内使用？', a: `从注销日起 ${R.validMonths} 个月内。在此期间可以兑现、用来抵付新车的注册费、附加注册费、拥车证和附加费，或转让给他人；转让费为 ${zh(R.transferFee)}，把回扣拆分再转让的拆分费为 ${zh(R.divideFee)}。过期未用的回扣会作废，不能申请延期，所以注销后最好尽早处理。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
    ],
    body: (h) => `
<h2>三种比例对照</h2>
${h.table(['注销时车龄', '2023年2月前的拥车证', `2023年2月至2026年2月（上限 ${h.m(P.parf.y2023to2026.cap)}）`, `2026年2月起（上限 ${h.m(P.parf.from2026.cap)}）`], sched('zh'), '退还的已付附加注册费比例。超过10年：无。德士和免拥车证车辆按注册日期区分。来源：陆路交通管理局，PARF 与拥车证回扣。', ['l', 'r', 'r', 'r'])}
<p>比例在车辆整个使用期内固定不变。它取决于注册时所用拥车证是在哪一轮取得的，而不是您报废的日期。一辆2025年注册的车，即使在2030年报废，仍按旧比例和 ${h.m(P.parf.y2023to2026.cap)} 的上限计算；拥车证取自2026年2月第二轮或之后的车，从第一天起就适用新比例。</p>
<h2>车龄怎样计算</h2>
<p>车龄从原始注册日期起算。车辆在满五年当天注销，仍算“不超过五年”，可得最高比例；晚一天就降到下一级。所以出售或报废的时间，值得对照注册周年日来安排，尤其是旧比例下，每一级相差附加注册费的百分之五。计算器以一位小数的年数表示车龄；如果日期接近周年日，请在 OneMotoring 上核对确切的注册日期。车行收购旧车时提出的价格，通常也以 PARF 和拥车证回扣为底价，知道这两个数字，谈价时心中更有数。</p>
${h.mini('coeRebate', { t: '再加上拥车证回扣', p: ['paid', 'months'] })}
<h2>2026年新比例带来的改变</h2>
<p>在旧比例下，提早报废很划算。一辆附加注册费为 ${h.m(CAR_A.u.netArf)} 的车，在五年时注销而不是在第十年注销，PARF 可以多拿 ${h.m(d5old)}。按2026年2月起取得的拥车证所适用的比例，同样的选择只多 ${h.m(d5new)}。提早报废的吸引力大减，二手车价格的底线随之下降，车龄十年时的决定也更倾向于续期，因为可以放弃的 PARF 所剩无几。比较新车与新规则之前注册的车时，买家应把旧车仍然带着的较高 PARF 算进去。</p>
<h2>谁可以领取 PARF 回扣</h2>
<p>私家车、非高峰时段用车、公司用车和私召车，只要在新加坡注册时是新车，或是在2007年9月1日或之后注册、车龄不超过三年的进口二手车，就符合资格。车辆必须在满十年前注销，而且从未封存过。德士在法定使用年限内注销也符合资格。客货两用车、经典车和古董车，以及曾经封存的车辆则不符合。</p>
<p>回扣以实际所付附加注册费净额计算，但不计入排放附加费。${h.a('home', '首页')}上那辆A类车，附加注册费为 ${h.m(CAR_A.u.netArf)}，按新比例在五年时可取回 ${h.m(parfRebate(CAR_A.u.netArf, 5, 'from2026'))}。${h.a('coe-cat-b', 'B类页面')}上那辆较大的车，未计 C1 级附加费的附加注册费为 ${h.m(big)}，五年时的比例金额为 ${h.m(Math.floor(big * P.parf.from2026.rates[0]))}，所以 ${h.m(P.parf.from2026.cap)} 的上限${big * P.parf.from2026.rates[0] > P.parf.from2026.cap ? '会起作用' : '不会起作用'}。</p>
<h2>怎样使用回扣</h2>
<p>注销的车辆妥善处理后，才会发放 PARF 和拥车证回扣：在陆路交通管理局指定的报废场报废、存放在出口加工区等待出口，或凭核准文件出口。必须先还清欠陆路交通管理局的款项和汽车贷款。之后您有 ${R.validMonths} 个月时间，可以用 Singpass 在网上兑现、用来抵付新车的税费和拥车证，或转让给他人。兑现的回扣会存入您的 GIRO 退款账户或通过 PayNow 支付。${h.a('scrap-car', '报废指南')}列出办理步骤，陆路交通管理局的${h.src('lta-rebate', '回扣页面')}提供相关表格。</p>`,
  },
});
