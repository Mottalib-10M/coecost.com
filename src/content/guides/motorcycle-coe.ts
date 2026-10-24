/** « motorcycle coe » / « coe cat d » : prime D, coût d'une moto neuve, road tax, renouvellement. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, PREVIOUS, premium, change, stats, lastN, exName, money, day, FETCHED, signed, num, monthYear, PQP_NEXT, pct } from '../../lib/data';
import { P, motorcycleUpfront, motorcycleRoadTax, renewalCost, coeRebate } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const M = PARAMS.motorcycle;
const en = (x: number, d = 0) => money(x, 'en', d), zh = (x: number, d = 0) => money(x, 'zh', d);
const D = premium(LATEST, 'D');
const s24 = stats('D', 24);
const bike = { omv: 8000, cc: 400 };
const u = motorcycleUpfront(bike.omv, D);
const rt = motorcycleRoadTax('petrol', bike.cc, 0);
const rtSmall = motorcycleRoadTax('petrol', 150, 0), rtBig = motorcycleRoadTax('petrol', 1200, 0);
const rows = (l: 'en' | 'zh') => lastN(8).map((e) => [exName(e, l, true), money(e.cats.D.premium, l), num(e.cats.D.quota, l), num(e.cats.D.bids, l)]);
const tier = (i: number) => M.arf[i];
const reb = coeRebate(D, 48);
const LB = (l: 'en' | 'zh') => day(M.lifespan.firstRegBefore, l), LE = (l: 'en' | 'zh') => day(M.lifespan.ends, l);
const lfRows = (l: 'en' | 'zh') => M.lateFees.rows.map(([up, ...f]) => [up === null ? (l === 'en' ? `${num(M.lateFees.rows[0][0] as number + 1, l)} cc and above` : `${num(M.lateFees.rows[0][0] as number + 1, l)} cc 及以上`) : (l === 'en' ? `Below ${num((up as number) + 1, l)} cc` : `${num((up as number) + 1, l)} cc 以下`), ...f.map((x) => money(x as number, l))]);

export default defineGuide({
  id: 'motorcycle-coe', group: 'coe', order: 5, tool: 'moto', related: ['coe-results', 'coe-bidding', 'coe-renewal', 'road-tax'], sources: ['lta-coe', 'lta-tax', 'lta-roadtax', 'lta-renewal', 'dgs-coe'],
  en: {
    slug: 'motorcycle-coe', nav: 'Motorcycle COE (Cat D)', card: 'Cat D premium and the cost of a new bike',
    title: 'Motorcycle COE 2026: Cat D Price, Bike Cost and Road Tax',
    description: `Motorcycle COE (Category D) in 2026: the ${en(D)} premium of the latest exercise, the ARF, duty and GST on a new bike, road tax by engine size and COE renewal.`,
    h1: 'Motorcycle COE: Category D',
    intro: `Category D is the certificate for motorcycles and scooters. Latest result: ${en(D)} in the ${exName(LATEST, 'en')}, read on ${day(FETCHED, 'en')}.`,
    resume: `The Category D premium closed at ${en(D)} in the ${exName(LATEST, 'en')}, ${signed(change('D'), 'en')} on the ${exName(PREVIOUS, 'en')}; over the last 24 exercises it moved between ${en(s24.min)} and ${en(s24.max)}. A new motorcycle pays more than its COE. On an OMV of ${en(bike.omv)} the ARF is ${en(u.arf)}, because the first ${en(tier(0)[0] as number)} is taxed at ${pct(tier(0)[1], 'en', 0)}, the next slice at ${pct(tier(1)[1], 'en', 0)} and anything above ${en(tier(1)[0] as number)} at ${pct(tier(2)[1], 'en', 0)}. Excise duty of ${pct(M.exciseDutyRate, 'en', 0)}, GST and the ${en(P.registrationFee)} registration fee bring that bike to ${en(u.total)} with the COE, before the dealer’s margin. A ${num(bike.cc, 'en')} cc engine then pays ${en(rt.total, 2)} of road tax a year. Unlike cars, motorcycles get no PARF rebate when they are scrapped, and the MAS car loan limits do not apply to them.`,
    faqs: [
      { q: 'How much is the deposit to bid for a motorcycle COE?', a: `${en(M.bidDeposit)} for Category D certificates since the first exercise of May 2023, against ${en(PARAMS.coe.bidDeposit)} for cars. A successful bid gives a temporary COE valid for only ${PARAMS.coe.tcoeMonths.D} month, so the bike should be chosen and ready for registration before you bid. An unused temporary COE is lost together with the deposit.` },
      { q: 'Can I renew the COE of an old motorcycle?', a: `Yes, at the Category D prevailing quota premium, for five or ten years. By our calculation it is ${en(PQP_NEXT.D)} for renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')}, so ${en(renewalCost(PQP_NEXT.D, 5))} for five years. Motorcycles first registered before ${LB('en')} have a statutory lifespan ending on ${LE('en')} and cannot be renewed past it.` },
      { q: 'Is road tax different for electric motorcycles?', a: `Yes. An electric motorcycle pays road tax on the power of its motor rather than on engine capacity, plus an additional flat component of ${en(M.evAfcSixMonthly)} every six months, which stands in for the petrol duty it does not pay. A petrol electric hybrid pays the higher of the two calculations. The calculator handles both through the electric option.` },
    ],
    body: (h) => `
<h2>Category D results of the last eight exercises</h2>
${h.table(['Exercise', 'Premium', 'Quota', 'Bids'], rows(h.lang), 'Category D. Source: LTA via data.gov.sg (Singapore Open Data Licence 1.0).', ['l', 'r', 'r', 'r'])}
<p>Category D is a small market: a few hundred certificates per exercise, against more than a thousand in Category A. Its premium is an order of magnitude lower than for cars, but it reacts to the same forces. When delivery riders and commuters renew their fleets at the same time, the bids climb above the quota and the premium follows.</p>
<h2>The price of a new motorcycle, line by line</h2>
<p>Motorcycles have their own tax schedule, separate from cars. The ARF is still charged in tiers on the OMV, but the rates are lighter at the bottom: ${h.pct(tier(0)[1])} on the first ${h.m(tier(0)[0] as number)}, ${h.pct(tier(1)[1])} on the next ${h.m((tier(1)[0] as number) - (tier(0)[0] as number))}, and ${h.pct(tier(2)[1])} on everything above ${h.m(tier(1)[0] as number)}. Excise duty is ${h.pct(M.exciseDutyRate)} of the OMV, against ${h.pct(P.exciseDutyRate)} for cars. GST at ${h.pct(P.gstRate)} applies to the OMV plus duty, and the registration fee is the same ${h.m(P.registrationFee)}.</p>
<p>For a bike with an OMV of ${h.m(bike.omv)} that gives ${h.m(u.duty)} of excise duty, ${h.m(u.gst)} of GST and an ARF of ${h.m(u.arf)}, so ${h.m(u.withoutCoe)} before the certificate. With the latest Category D premium of ${h.m(D)} the total is ${h.m(u.total)}. A big touring bike with an OMV of ${h.m(20000)} pays far more ARF, because every dollar above ${h.m(tier(1)[0] as number)} carries a full dollar of ARF. There is no VES rebate or surcharge on motorcycles.</p>
${h.mini('bid', { t: 'Would your Category D reserve have won?', p: ['reserve'], d: { cat: 'D', reserve: Math.round(s24.median / 100) * 100 } })}
<h2>Road tax on a motorcycle</h2>
<p>Six monthly road tax on a petrol motorcycle depends on engine capacity: a flat ${h.m(M.ice[0][1])} times ${P.roadTax.factor} up to ${M.ice[0][0]} cc, then ${h.m(M.ice[1][2], 2)} more per cc above ${M.ice[0][0]} cc up to ${h.n(M.ice[1][0] as number)} cc, and a higher rate beyond. In a year that is ${h.m(rtSmall.total, 2)} for a 150 cc scooter, ${h.m(rt.total, 2)} for a ${bike.cc} cc bike and ${h.m(rtBig.total, 2)} for a 1,200 cc machine. Unlike cars, motorcycles pay no surcharge for age. Late renewal is charged as below.</p>
${h.table(['Engine', ...M.lateFees.cols.map((c) => c.charAt(0).toUpperCase() + c.slice(1))], lfRows('en'), 'Late fee for motorcycle road tax, by time since expiry. Source: LTA road tax page.', ['l', 'r', 'r', 'r', 'r'])}
<h2>At the end of ten years</h2>
<p>When the certificate expires, a motorcycle is either renewed or deregistered. Renewal costs the Category D prevailing quota premium for ten years, or half of it for five, and a five year renewal cannot be repeated. Renewing late, within one month of expiry, adds a fee of ${h.m(PARAMS.coe.motorcycleRenewalLateFee)}; beyond that month the bike must be disposed of. A deregistered motorcycle gets a COE rebate for any unused months but no PARF rebate, because it never paid the car ARF that PARF refunds. The ${h.a('coe-renewal', 'COE renewal calculator')} works for Category D as well.</p>
<p>A motorcycle first registered before ${LB('en')} has a statutory lifespan that ends on ${LE('en')} whatever its COE says, unless it is under a vintage or classic scheme. Check the first registration date on OneMotoring before renewing such a bike.</p>
<h2>Selling or scrapping early</h2>
<p>Because there is no PARF rebate, the only money a motorcycle returns at deregistration is the COE rebate: the premium paid times the unused months, divided by 120. A bike bought at the latest Category D premium of ${h.m(D)} and scrapped with four years left would return ${h.m(reb)}. Most riders sell instead, and the used price follows the remaining COE and the current premium more than the bike itself. The MAS rules that cap car loans at a share of the price and at seven years do not cover motorcycles, so a lender sets its own terms; compare the total repaid, not the monthly figure.</p>`,
  },
  zh: {
    slug: 'motorcycle-coe', nav: '摩托车拥车证（D类）', card: 'D类价格与新摩托车成本',
    title: '摩托车拥车证 2026：D类价格、新车成本与路税',
    description: `2026年摩托车拥车证（D类）：最新一轮价格 ${zh(D)}，新摩托车的附加注册费、消费税和商品及服务税，按排量计算的路税，以及拥车证续期规则。`,
    h1: '摩托车拥车证：D类',
    intro: `D类是摩托车和踏板车的拥车证。最新结果：${exName(LATEST, 'zh')} ${zh(D)}，读取于${day(FETCHED, 'zh')}。`,
    resume: `${exName(LATEST, 'zh')}D类拥车证价格为 ${zh(D)}，比${exName(PREVIOUS, 'zh')}变动 ${signed(change('D'), 'zh')}；最近24轮介于 ${zh(s24.min)} 至 ${zh(s24.max)} 之间。新摩托车要付的远不止拥车证。OMV 为 ${zh(bike.omv)} 的摩托车，附加注册费为 ${zh(u.arf)}，因为首 ${zh(tier(0)[0] as number)} 按 ${pct(tier(0)[1], 'zh', 0)} 征收，下一段按 ${pct(tier(1)[1], 'zh', 0)}，超过 ${zh(tier(1)[0] as number)} 的部分按 ${pct(tier(2)[1], 'zh', 0)}。加上 ${pct(M.exciseDutyRate, 'zh', 0)} 的消费税、商品及服务税和 ${zh(P.registrationFee)} 的注册费，连同拥车证共 ${zh(u.total)}，未含车行利润。${num(bike.cc, 'zh')} cc 的引擎每年路税为 ${zh(rt.total, 2)}。与汽车不同，摩托车报废时没有 PARF 回扣，金管局的汽车贷款上限也不适用于摩托车。在计算器中输入您看中的车款的 OMV 和排量，即可得到上路成本和每年路税，并与最新的D类价格比较。`,
    faqs: [
      { q: '投标摩托车拥车证要缴多少押金？', a: `2023年5月第一轮起，D类押金为 ${zh(M.bidDeposit)}，汽车则为 ${zh(PARAMS.coe.bidDeposit)}。中标后得到的临时拥车证只有 ${PARAMS.coe.tcoeMonths.D} 个月有效期，所以投标前就应选好摩托车并准备好注册文件。临时拥车证过期未用，会连同押金一起作废，不能再用于其他车辆。中标后注册时只需补付差额。` },
      { q: '旧摩托车的拥车证可以续期吗？', a: `可以，按D类预定市场价格续期五年或十年。按本站计算，${monthYear(PQP_NEXT.appliesTo, 'zh')}续期为 ${zh(PQP_NEXT.D)}，续期五年为 ${zh(renewalCost(PQP_NEXT.D, 5))}。${LB('zh')}前首次注册的摩托车，法定使用期限于${LE('zh')}结束，不能续期超过这个日期。续期五年的摩托车不能再次续期。` },
      { q: '电动摩托车的路税有什么不同？', a: `有。电动摩托车按电机功率而不是引擎排量计算路税，另外每六个月加收 ${zh(M.evAfcSixMonthly)} 的附加固定费用，用来代替它不必缴付的汽油税。油电混合摩托车则按两种方法各算一次，取较高者。计算器的电动选项可以处理这两种情况，只需选择纯电并输入功率。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
    ],
    body: (h) => `
<h2>最近八轮D类结果</h2>
${h.table(['轮次', '价格', '配额', '投标'], rows('zh'), 'D类。来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证 1.0 版）。', ['l', 'r', 'r', 'r'])}
<p>D类是一个小市场：每轮只有几百张拥车证，而A类有一千多张。它的价格比汽车低一个数量级，但受同样的力量推动。当送餐骑士和通勤者同时更换摩托车时，投标数超过配额，价格就随之上升。</p>
<h2>新摩托车的价格，逐项计算</h2>
<p>摩托车有自己的税制，与汽车分开。附加注册费仍按 OMV 分级征收，但低端税率较轻：首 ${h.m(tier(0)[0] as number)} 按 ${h.pct(tier(0)[1])}，接下来的 ${h.m((tier(1)[0] as number) - (tier(0)[0] as number))} 按 ${h.pct(tier(1)[1])}，超过 ${h.m(tier(1)[0] as number)} 的部分按 ${h.pct(tier(2)[1])}。消费税为 OMV 的 ${h.pct(M.exciseDutyRate)}，汽车则为 ${h.pct(P.exciseDutyRate)}。${h.pct(P.gstRate)} 的商品及服务税按 OMV 加消费税计算，注册费同样是 ${h.m(P.registrationFee)}。</p>
<p>OMV 为 ${h.m(bike.omv)} 的摩托车，消费税为 ${h.m(u.duty)}，商品及服务税为 ${h.m(u.gst)}，附加注册费为 ${h.m(u.arf)}，拥车证之前合计 ${h.m(u.withoutCoe)}。加上最新的D类价格 ${h.m(D)}，总额为 ${h.m(u.total)}。OMV 为 ${h.m(20000)} 的大型旅行摩托车，附加注册费会高得多，因为超过 ${h.m(tier(1)[0] as number)} 的每一元都要再付一元附加注册费。摩托车没有车辆排放计划的回扣或附加费。</p>
${h.mini('bid', { t: '您的D类保留价过去能否中标？', p: ['reserve'], d: { cat: 'D', reserve: Math.round(s24.median / 100) * 100 } })}
<h2>摩托车的路税</h2>
<p>汽油摩托车的半年路税按引擎排量计算：${M.ice[0][0]} cc 以下固定为 ${h.m(M.ice[0][1])} 乘以 ${P.roadTax.factor}，超过 ${M.ice[0][0]} cc 后每 cc 加 ${h.m(M.ice[1][2], 2)}，直到 ${h.n(M.ice[1][0] as number)} cc，超过后税率更高。换算成每年，150 cc 的踏板车为 ${h.m(rtSmall.total, 2)}，${bike.cc} cc 的摩托车为 ${h.m(rt.total, 2)}，1,200 cc 的大型车为 ${h.m(rtBig.total, 2)}。与汽车不同，摩托车没有车龄附加费。逾期续缴的费用如下。</p>
${h.table(['排量', '到期后1个月内', '1至2.5个月', '超过2.5个月', '超过6个月'], lfRows('zh'), '摩托车路税逾期费用，按到期后的时间计算。来源：陆路交通管理局路税页面。', ['l', 'r', 'r', 'r', 'r'])}
<h2>十年期满时</h2>
<p>拥车证到期时，摩托车要么续期，要么注销。续期十年支付D类预定市场价格，续期五年支付一半，而续期五年后不能再续。在到期后一个月内续期，须加付 ${h.m(PARAMS.coe.motorcycleRenewalLateFee)} 的逾期费；超过一个月，摩托车就必须处理掉。注销的摩托车可得未用月份的拥车证回扣，但没有 PARF 回扣，因为它从未缴付 PARF 所退还的汽车附加注册费。${h.a('coe-renewal', '拥车证续期计算器')}同样适用于D类。</p>
<p>${LB('zh')}前首次注册的摩托车，无论拥车证期限如何，法定使用期限都在${LE('zh')}结束，除非属于古董车或经典车计划。为这类摩托车续期前，请先在 OneMotoring 上核对首次注册日期。</p>
<h2>提早出售或报废</h2>
<p>由于没有 PARF 回扣，摩托车注销时唯一能取回的是拥车证回扣：所付价格乘以未用月数，再除以120。以最新D类价格 ${h.m(D)} 购入、还剩四年就报废的摩托车，可取回 ${h.m(reb)}。大多数骑士会选择出售，二手价格主要取决于剩余的拥车证期限和当时的拥车证价格，而不是摩托车本身。金管局对汽车贷款比例和七年期限的限制不适用于摩托车，贷款条件由贷方自定，比较时请看还款总额，而不只是每月供款。</p>`,
  },
});
