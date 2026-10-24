/** « coe renewal » : coût du renouvellement 5/10 ans, PARF perdu, pénalités de retard, comparaison avec une voiture neuve. */
import { defineGuide } from '../../lib/page-types';
import { PQP_NEXT, monthYear, money, day, FETCHED, num } from '../../lib/data';
import { P, renewalCost, renewOrScrap, parfRebate, coeRenewalLateFee } from '../../lib/engine/car-cost';
import { CAR_A } from '../_facts';
import PARAMS from '../../data/params-2026.json';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const mo = (l: 'en' | 'zh') => monthYear(PQP_NEXT.appliesTo, l);
const arf = 30000;
const r10 = renewOrScrap({ pqp: PQP_NEXT.A, netArfPaid: arf, parf: 'pre2023', years: 10 });
const r5 = renewOrScrap({ pqp: PQP_NEXT.A, netArfPaid: arf, parf: 'pre2023', years: 5 });
const parfLost = parfRebate(arf, 10, 'pre2023');
const lateRows = (l: 'en' | 'zh') => {
  let prev = 0;
  return (PARAMS.coe.renewalLateFees as Array<[number | null, number]>).map(([up, fee]) => {
    const lab = up === null ? (l === 'en' ? `Above ${num(prev, l)} cc` : `${num(prev, l)} cc 以上`) : (prev === 0 ? (l === 'en' ? `Up to ${num(up, l)} cc` : `${num(up, l)} cc 或以下`) : l === 'en' ? `${num(prev + 1, l)} to ${num(up, l)} cc` : `${num(prev + 1, l)} 至 ${num(up, l)} cc`);
    prev = up ?? prev; return [lab, money(fee, l)];
  });
};

export default defineGuide({
  id: 'coe-renewal', group: 'end', order: 20, tool: 'renew', related: ['pqp', 'parf-rebate', 'scrap-car', 'coe-rebate'], sources: ['lta-renewal', 'lta-rebate', 'dgs-pqp'],
  en: {
    slug: 'coe-renewal', nav: 'COE renewal', card: 'Renew for 5 or 10 years, or scrap',
    title: `COE Renewal ${mo('en')}: 5 or 10 Year Cost and Late Fees`,
    description: `COE renewal cost for ${mo('en')}: the PQP by category, 5 or 10 years, the PARF rebate you give up, late renewal fees for 2026 and when scrapping costs less.`,
    h1: 'COE renewal: cost and choices',
    intro: `What it costs to keep a car beyond ten years, at the PQP for ${mo('en')}. Figures read on ${day(FETCHED, 'en')}.`,
    resume: `Renewing a Category A COE in ${mo('en')} costs ${en(renewalCost(PQP_NEXT.A, 10))} for ten years or ${en(renewalCost(PQP_NEXT.A, 5))} for five; in Category B it is ${en(renewalCost(PQP_NEXT.B, 10))} or ${en(renewalCost(PQP_NEXT.B, 5))}. That price is the prevailing quota premium, the three month average of COE results, and you pay it without bidding. The cash price is only part of the cost. A car deregistered at ten years still collects its PARF rebate, and renewing gives it up for good: for a car whose COE dates from before February 2023 and whose ARF was ${en(arf)}, that is ${en(parfLost)}. Counting it, a ten year renewal costs about ${en(r10.perYear)} a year and a five year renewal ${en(r5.perYear)} a year, against roughly ${en(CAR_A.perYear10)} a year for a new Category A car kept ten years. A five year renewal of a car cannot be repeated.`,
    faqs: [
      { q: 'When can I renew my COE?', a: 'In the month the COE expires, at that month’s PQP, or one month earlier at the previous month’s PQP, in which case the new period starts on the first day of the following month and the remaining days are forfeited. Renewal is done online on OneMotoring with Singpass, paid by eNETS Debit or, for larger amounts, SGQR PayNow.' },
      { q: 'What happens if I renew my COE late?', a: `You can still renew within one month after expiry, at the PQP of the expiry month plus a late fee, which for a private car ranges from ${en(PARAMS.coe.renewalLateFees[0][1] as number)} to ${en(PARAMS.coe.renewalLateFees[PARAMS.coe.renewalLateFees.length - 1][1] as number)} depending on engine capacity. Meanwhile the car is deregistered and may not be driven. Past that month the vehicle must be disposed of.` },
      { q: 'Can I renew a five year COE again?', a: 'Not for a car or a motorcycle. LTA allows a five year renewal of a Category A, B or D vehicle only once; at the end of it the vehicle must be deregistered. A ten year renewal has no such limit for cars, which have no statutory lifespan. Goods vehicles in Category C follow a different rule, with repeated five year renewals up to their lifespan.' },
      { q: 'Do I get a COE rebate if I scrap a renewed car early?', a: 'Yes. The rebate on a renewed COE is based on the PQP you paid to renew, prorated to the unused months, exactly as for a first certificate. There is no PARF rebate any more, since it was given up at renewal. The COE rebate calculator works with the PQP you paid.' },
    ],
    body: (h) => `
<h2>Renew or deregister: the trade off</h2>
<p>At ten years an owner has two choices. Deregistering returns the PARF rebate, a share of the ARF paid when the car was new, and ends the cost. Renewing keeps a car you already know, often in good condition, at the price of the PQP, and ends the right to any PARF rebate. The calculator above adds both sides: what you pay now, and the rebate you would have received by scrapping.</p>
<p>The PARF at stake depends on when the COE was obtained. For a car from before the second exercise of February 2023, the rebate in the tenth year is ${h.pct(P.parf.pre2023.rates[5])} of the ARF paid, with no cap. For a COE obtained between then and February 2026 the same share applies with a cap of ${h.m(P.parf.y2023to2026.cap)}, and for certificates from February 2026 the share drops to ${h.pct(P.parf.from2026.rates[5])}, capped at ${h.m(P.parf.from2026.cap)}. A car registered under the newest rules therefore gives up little PARF by renewing, which tilts the choice towards renewal.</p>
${h.mini('parf', { t: 'The PARF you would give up', p: ['arf', 'regime'], d: { age: 10, regime: 'pre2023' } })}
<h2>Five years or ten</h2>
<p>A ten year renewal costs the full PQP; a five year renewal costs half, rounded up. Per year they cost the same, but they are not the same commitment. After five years the car must be deregistered, and since the PARF is already gone, the only rebate left is the COE rebate for any months unused. After ten years a car can be renewed again. Owners who plan to keep a reliable car for as long as it runs usually take ten years; those who want a bridge to a later purchase take five.</p>
<p>At today’s PQP, a ten year renewal of a Category A car costs ${h.m(renewalCost(PQP_NEXT.A, 10) / 10)} a year and a five year renewal ${h.m(renewalCost(PQP_NEXT.A, 5) / 5)} a year before the lost PARF. Maintenance on an older car tends to rise, and road tax gains an age surcharge after ten years, rising each year up to ${h.pct(P.roadTax.ageSurcharge[0][1])}. The ${h.a('road-tax', 'road tax calculator')} shows the surcharge for your car’s age.</p>
<h2>Late renewal fees</h2>
${h.table(['Private car engine', 'Late renewal fee'], lateRows('en'), `Late fee for renewing a COE within one month after expiry. Motorcycles: ${h.m(PARAMS.coe.motorcycleRenewalLateFee)}; company cars, goods and public service vehicles: ${h.m(coeRenewalLateFee(9999))}. Source: LTA COE renewal page.`, ['l', 'r'])}
<p>The fee is small next to the PQP, but the rule behind it is strict: a COE that has expired leaves the car deregistered, so it cannot be driven until the renewal goes through, and after one month it must be scrapped or exported. The PQP charged is that of the month of expiry, not the month you finally pay.</p>
<h2>Paying for the renewal</h2>
<p>Renewal is an online transaction on OneMotoring, open every day except between midnight and 6 am. Personal account holders pay by eNETS Debit, within the daily limit set by their bank, and a PQP above the bank limits can be paid by SGQR PayNow. A COE rebate from another vehicle you have deregistered can be used to offset the PQP of a car you own, as long as the rebate is still within its twelve months of validity; if the rebate is larger than the PQP, encash it first and pay the renewal separately, because any balance left in an offset is forfeited.</p>
<h2>Which PQP and which category</h2>
<p>Every car renews at the PQP of its own category. A car first registered with an open Category E COE renews under Category A or B according to its engine and power, and a weekend or off peak car pays the same PQP as a normal car and keeps its status. The figure for ${mo('en')} on this page is our calculation with LTA’s rule, explained on the ${h.a('pqp', 'PQP page')}, until the official series is updated. If you would rather sell, the ${h.a('scrap-car', 'scrapping guide')} lists what you get back and the steps involved.</p>`,
  },
  zh: {
    slug: 'coe-renewal', nav: '拥车证续期', card: '续期五年、十年还是报废',
    title: `拥车证续期 ${mo('zh')}：五年或十年费用与逾期费`,
    description: `${mo('zh')}拥车证续期费用：各类别 PQP、续期五年或十年、续期时放弃的 PARF 回扣、2026年逾期续期费用，以及什么情况下报废更划算。`,
    h1: '拥车证续期：费用与选择',
    intro: `按${mo('zh')}的 PQP，计算车辆在十年后继续使用要花多少钱。数字读取于${day(FETCHED, 'zh')}。`,
    resume: `${mo('zh')}为A类拥车证续期，十年要付 ${zh(renewalCost(PQP_NEXT.A, 10))}，五年要付 ${zh(renewalCost(PQP_NEXT.A, 5))}；B类则为 ${zh(renewalCost(PQP_NEXT.B, 10))} 或 ${zh(renewalCost(PQP_NEXT.B, 5))}。这个价格就是预定市场价格，即拥车证结果的三个月平均值，不必投标就能支付。现金只是成本的一部分。车辆在十年时注销，仍可领取 PARF 回扣，续期则会永久放弃这笔钱：一辆在2023年2月之前取得拥车证、当初附加注册费为 ${zh(arf)} 的车，放弃的就是 ${zh(parfLost)}。把这一项算进去，续期十年每年约 ${zh(r10.perYear)}，续期五年每年约 ${zh(r5.perYear)}；相比之下，一辆新的A类车用满十年每年约 ${zh(CAR_A.perYear10)}。汽车续期五年只能一次，期满后必须注销。在计算器中输入您的车辆类别和当初所付的附加注册费，即可比较续期与报废。`,
    faqs: [
      { q: '什么时候可以为拥车证续期？', a: '可以在拥车证到期的那个月按当月 PQP 续期，也可以提早一个月按上个月的 PQP 续期；后者的新期限从下个月第一天开始，剩下的天数会作废。续期在 OneMotoring 网上用 Singpass 办理，可以用 eNETS 借记付款，金额较大时用 SGQR PayNow 付款。' },
      { q: '逾期续期会怎样？', a: `到期后一个月内仍可续期，按到期月份的 PQP 计算，再加逾期费；私家车的逾期费按引擎排量从 ${zh(PARAMS.coe.renewalLateFees[0][1] as number)} 到 ${zh(PARAMS.coe.renewalLateFees[PARAMS.coe.renewalLateFees.length - 1][1] as number)} 不等。在此期间车辆已被注销，不能上路，直到续期完成为止。超过一个月，车辆就必须报废或出口，所以最好在到期日之前完成续期。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
      { q: '续期五年的拥车证还能再续吗？', a: '汽车和摩托车不能。陆路交通管理局规定，A、B、D类车辆续期五年只能一次，期满后必须注销。续期十年则没有次数限制，因为汽车没有法定使用年限。C类货车的规则不同，可以多次续期五年，直到达到法定使用年限为止。选择五年之前，请先想好期满后的换车打算。' },
      { q: '续期后提早报废，还有拥车证回扣吗？', a: '有。续期拥车证的回扣以您续期时所付的 PQP 为基础，按未用月数比例计算，与第一张拥车证完全相同。只是不再有 PARF 回扣，因为续期时已经放弃了。拥车证回扣计算器可以直接输入您续期时所付的 PQP 和剩余月数来计算。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
    ],
    body: (h) => `
<h2>续期还是注销：如何取舍</h2>
<p>车龄十年时，车主有两个选择。注销可以取回 PARF 回扣，即新车时所付附加注册费的一部分，成本也就此结束。续期则可以继续使用一辆自己熟悉、往往状况良好的车，代价是 PQP，并失去领取 PARF 回扣的权利。页面顶部的计算器把两边都算进去：现在要付的钱，以及报废时本来可以领到的回扣。</p>
<p>涉及的 PARF 金额取决于拥车证的取得时间。2023年2月第二轮之前取得的拥车证，第十年的回扣为所付附加注册费的 ${h.pct(P.parf.pre2023.rates[5])}，没有上限。之后到2026年2月取得的拥车证比例相同，但上限为 ${h.m(P.parf.y2023to2026.cap)}；2026年2月起取得的拥车证，比例降到 ${h.pct(P.parf.from2026.rates[5])}，上限 ${h.m(P.parf.from2026.cap)}。所以按最新规则注册的车，续期时放弃的 PARF 很少，选择会更倾向于续期。</p>
${h.mini('parf', { t: '您会放弃的 PARF', p: ['arf', 'regime'], d: { age: 10, regime: 'pre2023' } })}
<h2>五年还是十年</h2>
<p>续期十年支付 PQP 全额，续期五年支付一半并向上取整。按年计算两者一样，但承诺不同。五年后车辆必须注销，由于 PARF 已经放弃，唯一剩下的只有未用月份的拥车证回扣。十年后则可以再次续期。打算一直开到车子开不动为止的车主，通常选择十年；只想过渡到之后再买车的人，选择五年。</p>
<p>按目前的 PQP，A类车续期十年每年 ${h.m(renewalCost(PQP_NEXT.A, 10) / 10)}，续期五年每年 ${h.m(renewalCost(PQP_NEXT.A, 5) / 5)}，尚未计入放弃的 PARF。旧车的维修费往往会增加，车龄超过十年后路税还要加收附加费，逐年增加，最高 ${h.pct(P.roadTax.ageSurcharge[0][1])}。${h.a('road-tax', '路税计算器')}会按您的车龄显示附加费。</p>
<h2>逾期续期费用</h2>
${h.table(['私家车引擎排量', '逾期续期费'], lateRows('zh'), `在拥车证到期后一个月内续期的逾期费。摩托车：${h.m(PARAMS.coe.motorcycleRenewalLateFee)}；公司用车、货车和公共服务车辆：${h.m(coeRenewalLateFee(9999))}。来源：陆路交通管理局拥车证续期页面。`, ['l', 'r'])}
<p>与 PQP 相比，逾期费很少，但背后的规则很严格：拥车证到期后车辆就被注销，在续期完成前不能驾驶，超过一个月就必须报废或出口。收取的是到期月份的 PQP，而不是您最终付款那个月的 PQP。</p>
<h2>怎样支付续期费用</h2>
<p>续期在 OneMotoring 网上办理，除午夜至早上6时外每天开放。个人账户持有人用 eNETS 借记付款，以银行设定的每日限额为准；PQP 超过银行限额时，可以用 SGQR PayNow 付款。您注销另一辆车所得的拥车证回扣，只要仍在十二个月有效期内，就可以用来抵付自己名下汽车的 PQP。如果回扣多于 PQP，应先把回扣兑现，再另行支付续期费用，因为抵付后剩下的余额会作废。</p>
<h2>适用哪个 PQP、哪个类别</h2>
<p>每辆车都按自己类别的 PQP 续期。原本用开放的E类拥车证注册的汽车，会按引擎和功率归入A类或B类续期；周末用车和非高峰时段用车支付与普通汽车相同的 PQP，续期后保留原来的身份。本页${mo('zh')}的数字是本站按陆路交通管理局规则计算的结果，计算方法见 ${h.a('pqp', 'PQP 页面')}，官方序列更新后即改用官方数字。如果您更想卖车或报废，${h.a('scrap-car', '报废指南')}列出能取回的金额和办理步骤。</p>`,
  },
});
