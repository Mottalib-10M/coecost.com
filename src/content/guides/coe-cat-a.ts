/** « coe cat a » : définition, série des 24 derniers exercices, moyennes, effet sur le coût d'une petite voiture. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, PREVIOUS, premium, change, stats, lastN, record, yearly, bidRatio, exName, money, day, FETCHED, signed, num, monthYear, PQP_NEXT } from '../../lib/data';
import { P } from '../../lib/engine/car-cost';
import { CAR_A } from '../_facts';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const A = premium(LATEST, 'A');
const s24 = stats('A', 24), s48 = stats('A', 48);
const rec = record('A');
const ys = yearly('A'), last = ys[ys.length - 1], prevY = ys[ys.length - 2];
const tableEn = lastN(12).map((e) => [exName(e, 'en', true), money(e.cats.A.premium, 'en'), num(e.cats.A.quota, 'en'), num(e.cats.A.bids, 'en'), num(bidRatio(e, 'A'), 'en', 2)]);
const tableZh = lastN(12).map((e) => [exName(e, 'zh', true), money(e.cats.A.premium, 'zh'), num(e.cats.A.quota, 'zh'), num(e.cats.A.bids, 'zh'), num(bidRatio(e, 'A'), 'zh', 2)]);

export default defineGuide({
  id: 'coe-cat-a', group: 'coe', order: 3, tool: 'category', related: ['coe-cat-b', 'coe-results', 'ev-road-tax', 'home'], sources: ['lta-coe', 'dgs-coe'],
  en: {
    slug: 'coe-cat-a', nav: 'COE Category A', card: 'Which cars qualify and the latest premium',
    title: 'COE Cat A Price 2026: Latest Premium, Rules and History',
    description: `Category A COE in 2026: the ${en(A)} premium of the latest exercise, which cars qualify (1,600 cc, 97 kW, EVs 110 kW), the last 12 results and yearly averages.`,
    h1: 'COE Category A: price and rules',
    intro: `Category A is the certificate for smaller cars. Latest result: ${en(A)} in the ${exName(LATEST, 'en')}, read on ${day(FETCHED, 'en')}.`,
    resume: `The Category A premium closed at ${en(A)} in the ${exName(LATEST, 'en')}, ${signed(change('A'), 'en')} against the ${exName(PREVIOUS, 'en')}. A car belongs to Category A when its engine is no larger than ${num(P.catA.maxCc, 'en')} cc and its maximum power no higher than ${P.catA.maxKw} kW; a fully electric car qualifies up to ${P.catA.evMaxKw} kW of motor power, a rule in force for certificates obtained since the first exercise of May 2022. Both limits apply together, so a 1.5 litre turbo engine with more than ${P.catA.maxKw} kW goes into Category B. Over the last 24 exercises the Category A premium moved between ${en(s24.min)} and ${en(s24.max)}; its average for ${last.year} so far is ${en(last.mean)}, against ${en(prevY.mean)} in ${prevY.year}. Type the engine figures from the brochure in the calculator to check the category of a model.`,
    faqs: [
      { q: 'Which cars fall into COE Category A?', a: `Cars with an engine up to ${num(P.catA.maxCc, 'en')} cc and a maximum power output up to ${P.catA.maxKw} kW, which LTA also writes as 130 bhp, and fully electric cars up to ${P.catA.evMaxKw} kW. Hybrids are judged on the engine and on the combined maximum power stated in the type approval, so some hybrids with small engines still land in Category B.` },
      { q: 'Can I use a Category E COE for a Category A car?', a: 'Yes. The open Category E certificate can register any vehicle except a motorcycle, including a Category A car. It usually costs more than Category A, so dealers use it mainly when Category E happens to be cheaper than the category the car needs, or for flexibility when the model is not yet decided.' },
      { q: 'What was the highest Category A COE price?', a: `In the published series since 2010, the highest Category A premium was ${en(rec.value)}, in the ${exName(rec.ex, 'en')}. Over the last 48 exercises the median was ${en(s48.median)}. The full series is in the open data set that LTA publishes on data.gov.sg, and the COE results page lists every exercise of the last two years.` },
      { q: 'Does LTA plan to change Category A?', a: 'LTA opened a public consultation in October 2026 on a new way to separate mass market cars from higher value cars across the COE categories. Nothing changes for bidding until LTA announces a decision. The rules on this page are those in force today, and they will be updated on the day a change is published.' },
    ],
    body: (h) => `
<h2>Category A results of the last 12 exercises</h2>
${h.table(['Exercise', 'Premium', 'Quota', 'Bids', 'Bids per COE'], tableEn, 'Category A. Source: LTA via data.gov.sg (Singapore Open Data Licence 1.0).', ['l', 'r', 'r', 'r', 'r'])}
<p>The fourth column counts valid bids, the last one divides them by the quota. When that ratio sits close to one, nearly everybody who bid got a certificate and the premium tends to ease; when it climbs well above one, more bidders had to be outbid and the premium rises. In the ${exName(LATEST, 'en')}, ${h.n(LATEST.cats.A.bids)} bids competed for ${h.n(LATEST.cats.A.quota)} certificates.</p>
<h2>The two limits, and why both matter</h2>
<p>Category A was created for the mass market car. For a petrol or diesel car the test has two parts: an engine capacity of at most ${h.n(P.catA.maxCc)} cc and a maximum power output of at most ${P.catA.maxKw} kW. The power limit is there because small turbocharged engines would otherwise put fast, expensive cars into the cheaper category. Today a car with a 1.4 litre turbo making 110 kW belongs to Category B despite its small engine. The calculator at the top applies both limits to the figures you type; take them from the brochure or the type approval, not from the name of the model.</p>
<p>Electric cars have no engine capacity, so for them only power counts, with a higher limit of ${P.catA.evMaxKw} kW. That rule applies to COEs obtained from the first exercise of May 2022; before that, electric cars were sorted with the same ${P.catA.maxKw} kW limit as petrol cars. Many compact electric models are offered in Singapore in a version tuned below ${P.catA.evMaxKw} kW precisely so that they qualify. The ${h.a('ev-road-tax', 'EV road tax page')} explains how power also drives their road tax.</p>
${h.mini('cost', { t: 'Cost per year of a Category A car', p: ['omv', 'years'], d: { omv: CAR_A.omv } })}
<h2>What the Category A premium does to the price of a car</h2>
<p>For a car with an OMV of ${h.m(CAR_A.omv)}, the taxes before the COE come to ${h.m(CAR_A.u.basicWithoutCoe)}. Add the Category A premium of ${h.m(A)} and the total reaches ${h.m(CAR_A.u.basicWithCoe)}: the certificate is ${h.pct(CAR_A.coeShare)} of the price before the dealer’s margin. That share is the main reason small cars in Singapore cost several times what they cost elsewhere. It also explains why a change of a few thousand dollars in the premium matters more to buyers of small cars than to buyers of large ones.</p>
<p>Spread over ten years and counting the PARF rebate at the end, that car costs about ${h.m(CAR_A.perYear10)} a year before insurance, parking, petrol and ERP. A premium ${h.m(10000)} higher adds ${h.m(10000 / 10)} a year over ten years, because the COE rebate is zero for a certificate used to the end. The ${h.a('home', 'full cost calculator')} lets you replace the premium with any figure.</p>
<h2>Averages over the years</h2>
<p>The Category A premium averaged ${h.m(last.mean)} over the ${last.n} exercises held in ${last.year}, after ${h.m(prevY.mean)} in ${prevY.year}. The highest result on record is ${h.m(rec.value)} in the ${exName(rec.ex, 'en')}. Long series show cycles: premiums fall when a large wave of ten year old cars is deregistered and the quota grows, and rise when the quota shrinks again. The ${h.a('coe-cat-b', 'Category B page')} compares the two car categories, and the ${h.a('coe-results', 'COE results page')} shows all five side by side for any exercise.</p>
<h2>Renewing a Category A COE</h2>
<p>An owner who keeps a Category A car beyond ten years renews at the prevailing quota premium of the category, not at the latest result. Our calculation of the Category A PQP for renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')} is ${h.m(PQP_NEXT.A)}, the average of the last three months of results. Renewal for five years costs half of that and cannot be repeated.</p>`,
  },
  zh: {
    slug: 'coe-cat-a', nav: 'A类拥车证', card: '哪些车属于A类与最新价格',
    title: 'A类拥车证价格 2026：最新结果、车辆规则与历史',
    description: `2026年A类拥车证：最新一轮价格 ${zh(A)}，哪些车属于A类（1,600 cc、97 kW，电动车110 kW），最近12轮结果与每年平均价格。`,
    h1: 'A类拥车证：价格与规则',
    intro: `A类是较小汽车的拥车证。最新结果：${exName(LATEST, 'zh')} ${zh(A)}，读取于${day(FETCHED, 'zh')}。`,
    resume: `${exName(LATEST, 'zh')}A类拥车证价格为 ${zh(A)}，比${exName(PREVIOUS, 'zh')}变动 ${signed(change('A'), 'zh')}。汽车要属于A类，引擎排量不得超过 ${num(P.catA.maxCc, 'zh')} cc，最大功率不得超过 ${P.catA.maxKw} kW；纯电动车的电机功率上限为 ${P.catA.evMaxKw} kW，这条规则适用于2022年5月第一轮起取得的拥车证。两个上限必须同时符合，所以一台功率超过 ${P.catA.maxKw} kW 的1.5升涡轮引擎车会被归入B类。在最近24轮中，A类价格介于 ${zh(s24.min)} 至 ${zh(s24.max)} 之间；${last.year}年迄今平均为 ${zh(last.mean)}，${prevY.year}年为 ${zh(prevY.mean)}。把宣传册上的引擎排量和最大功率输入计算器，就能确认某款车属于哪一类；再用下方的成本计算器，看看这个价格摊到每年、每月是多少钱，以及车龄五年与十年报废时的差别。`,
    faqs: [
      { q: '哪些车属于A类拥车证？', a: `引擎排量不超过 ${num(P.catA.maxCc, 'zh')} cc、最大输出功率不超过 ${P.catA.maxKw} kW（陆路交通管理局也写作130匹马力）的汽车，以及功率不超过 ${P.catA.evMaxKw} kW 的纯电动车。混合动力车按引擎排量和型式认证上的综合最大功率判断，所以有些小排量混合动力车仍属于B类，买车前最好核对。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
      { q: 'A类车可以用E类拥车证注册吗？', a: '可以。开放的E类拥车证可以注册摩托车以外的任何车辆，包括A类车。E类通常比A类贵，所以车行主要在E类刚好比所需类别便宜时使用它，或在车款尚未确定、需要保留弹性时使用。个人取得的E类拥车证还可以转让一次。计算拥车证回扣时，则按E类与A类价格中较低者计算。' },
      { q: 'A类拥车证最高价格是多少？', a: `在2010年以来公布的序列中，A类最高价格为 ${zh(rec.value)}，出现在${exName(rec.ex, 'zh')}。最近48轮的中位数为 ${zh(s48.median)}。完整序列见陆路交通管理局在 data.gov.sg 发布的开放数据集，拥车证结果页面则列出最近两年的每一轮。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
      { q: '陆路交通管理局打算改变A类吗？', a: '陆路交通管理局在2026年10月就拥车证类别展开公众咨询，提议用新的方式区分大众车与较高价值的车。在当局宣布决定之前，竞标规则不变。本页的规则是目前生效的规则，一旦有变化公布，会在当天更新，页面顶部的日期也会随之改变。已取得的拥车证会按当局公布的过渡安排处理。' },
    ],
    body: (h) => `
<h2>最近12轮A类结果</h2>
${h.table(['轮次', '价格', '配额', '投标', '每张拥车证投标数'], tableZh, 'A类。来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证 1.0 版）。', ['l', 'r', 'r', 'r', 'r'])}
<p>第四列是有效投标数，最后一列是投标数除以配额。比值接近一时，几乎所有投标者都拿到拥车证，价格往往回落；比值明显高于一时，有更多投标者要被淘汰，价格就会上升。${exName(LATEST, 'zh')}，${h.n(LATEST.cats.A.bids)} 份投标争夺 ${h.n(LATEST.cats.A.quota)} 张拥车证。</p>
<h2>两个上限，为什么都重要</h2>
<p>A类是为大众车而设的。对汽油车或柴油车，判断标准有两项：引擎排量不超过 ${h.n(P.catA.maxCc)} cc，最大输出功率不超过 ${P.catA.maxKw} kW。设功率上限，是因为小排量涡轮引擎会让一些又快又贵的车进入较便宜的类别。如今一台1.4升涡轮、功率110 kW 的车，虽然排量小，也属于B类。页面顶部的计算器会对您输入的数据同时套用两个上限；数据请以宣传册或型式认证为准，而不是车款名称。</p>
<p>电动车没有引擎排量，所以只看功率，上限较高，为 ${P.catA.evMaxKw} kW。这条规则适用于2022年5月第一轮起取得的拥车证；在此之前，电动车和汽油车一样以 ${P.catA.maxKw} kW 为界。不少小型电动车在新加坡推出功率调校在 ${P.catA.evMaxKw} kW 以下的版本，正是为了符合A类。功率同样决定电动车的路税，详见${h.a('road-tax', '路税页面')}。</p>
${h.mini('cost', { t: 'A类车的每年成本', p: ['omv', 'years'], d: { omv: CAR_A.omv } })}
<h2>A类价格对车价的影响</h2>
<p>一辆 OMV 为 ${h.m(CAR_A.omv)} 的车，拥车证之前的税费合计 ${h.m(CAR_A.u.basicWithoutCoe)}。加上 ${h.m(A)} 的A类价格，总额达到 ${h.m(CAR_A.u.basicWithCoe)}：拥车证占车行加价前车价的 ${h.pct(CAR_A.coeShare)}。这个比例正是新加坡小型车价格比其他地方高出好几倍的主要原因，也说明为什么拥车证价格变动几千元，对小型车买家的影响比对大型车买家更大。</p>
<p>分摊到十年并计入期满时的 PARF 回扣，这辆车每年约 ${h.m(CAR_A.perYear10)}，未含保险、停车、油费和电子道路收费。拥车证价格每高 ${h.m(10000)}，十年内每年就多 ${h.m(10000 / 10)}，因为用满十年的拥车证没有回扣。在${h.a('home', '买车成本计算器')}中可以把拥车证价格换成任何数字。</p>
<h2>历年平均</h2>
<p>${last.year}年已举行的 ${last.n} 轮中，A类平均价格为 ${h.m(last.mean)}，${prevY.year}年为 ${h.m(prevY.mean)}。历史最高为${exName(rec.ex, 'zh')}的 ${h.m(rec.value)}。长期序列呈现周期：大批车龄十年的车辆注销、配额增加时，价格回落；配额再次减少时，价格上升。${h.a('coe-cat-b', 'B类页面')}比较两个汽车类别，${h.a('coe-results', '拥车证结果')}页面则并列显示任何一轮的五个类别。</p>
<h2>续期A类拥车证</h2>
<p>车主若想在十年后继续使用A类车，续期时支付的是该类别的预定市场价格，而不是最新结果。按本站计算，${monthYear(PQP_NEXT.appliesTo, 'zh')}续期的A类 PQP 为 ${h.m(PQP_NEXT.A)}，即最近三个月结果的平均值。续期五年只需一半，但不能再次续期；续期也意味着放弃 PARF 回扣，详见拥车证续期页面的比较。</p>`,
  },
});
