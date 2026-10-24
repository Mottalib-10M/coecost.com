/** « coe cat b » : grosses voitures, écart avec A et E, effet d'un ARF plus lourd. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, PREVIOUS, premium, change, stats, lastN, record, yearly, exName, money, day, FETCHED, signed, num, pct, monthYear, PQP_NEXT } from '../../lib/data';
import { P } from '../../lib/engine/car-cost';
import { CAR_A, CAR_B } from '../_facts';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const B = premium(LATEST, 'B'), A = premium(LATEST, 'A'), E = premium(LATEST, 'E');
const s24 = stats('B', 24);
const rec = record('B');
const ys = yearly('B'), last = ys[ys.length - 1];
const l12 = lastN(12);
const bAbove = l12.filter((e) => e.cats.B.premium > e.cats.A.premium).length;
const eAbove = l12.filter((e) => e.cats.E.premium >= e.cats.B.premium).length;
const row = (e: (typeof l12)[number], l: 'en' | 'zh') => [exName(e, l, true), money(e.cats.B.premium, l), money(e.cats.E.premium, l), signed(e.cats.B.premium - e.cats.A.premium, l), num(e.cats.B.bids, l)];
const arfShare = CAR_B.u.netArf / CAR_B.u.basicWithCoe, coeShare = CAR_B.coe / CAR_B.u.basicWithCoe;
const arfShareA = CAR_A.u.netArf / CAR_A.u.basicWithCoe;
const reserve = Math.round(s24.median / 1000) * 1000;

export default defineGuide({
  id: 'coe-cat-b', group: 'coe', order: 4, tool: 'bid', toolArg: { cat: 'B', reserve }, related: ['coe-cat-a', 'arf', 'ves', 'coe-results'], sources: ['lta-coe', 'dgs-coe', 'lta-arf'],
  en: {
    slug: 'coe-cat-b', nav: 'COE Category B', card: 'Larger cars, Cat E and the ARF effect',
    title: 'COE Cat B Price 2026: Latest Result, Cat E and History',
    description: `Category B COE in 2026: the ${en(B)} premium of the latest exercise, the gap with Category A and open Category E, the last 12 results, the record since 2010.`,
    h1: 'COE Category B: larger cars',
    intro: `Category B covers every car above the Category A limits. Latest result: ${en(B)} in the ${exName(LATEST, 'en')}, read on ${day(FETCHED, 'en')}.`,
    resume: `The Category B premium was ${en(B)} in the ${exName(LATEST, 'en')}, ${signed(change('B'), 'en')} on the ${exName(PREVIOUS, 'en')}, against ${en(A)} for Category A and ${en(E)} for the open Category E. Any car with an engine above ${num(P.catA.maxCc, 'en')} cc, or more than ${P.catA.maxKw} kW of power, needs a Category B certificate; so does an electric car above ${P.catA.evMaxKw} kW. In ${bAbove} of the last 12 exercises Category B cost more than Category A, and Category E closed at or above Category B in ${eAbove} of them. For a large car the ARF takes a much bigger share of the price: on a car with an OMV of ${en(CAR_B.omv)} in VES band C1, the ARF is ${en(CAR_B.u.netArf)}, ${pct(CAR_B.u.netArf / CAR_B.u.basicWithCoe, 'en', 0)} of the price before the dealer’s margin. The calculator above shows how often a given Category B reserve price would have won.`,
    faqs: [
      { q: 'Why is Category B sometimes cheaper than Category A?', a: `Each category has its own quota and its own bidders, so the two premiums are set separately. When the Category B quota grows faster than demand for large cars, or many Category A buyers rush in at once, the order flips for a few exercises. Over the last 12 exercises Category B was the more expensive one ${bAbove} times.` },
      { q: 'What is the difference between COE Category B and Category E?', a: 'A Category B certificate can only register a car above the Category A limits. A Category E certificate is open: it can register a car of either category, a goods vehicle or a bus, but not a motorcycle. Because dealers can switch between B and E, the two premiums usually move together, with E slightly above.' },
      { q: 'What was the highest Category B COE price?', a: `The highest Category B premium in the series since 2010 is ${en(rec.value)}, reached in the ${exName(rec.ex, 'en')}. Over the last 24 exercises the premium ranged from ${en(s24.min)} to ${en(s24.max)}. Every result is in LTA’s open data set on data.gov.sg, which this site reads after each exercise.` },
    ],
    body: (h) => `
<h2>Category B and Category E over the last 12 exercises</h2>
${h.table(['Exercise', 'Cat B', 'Cat E', 'B minus A', 'Cat B bids'], l12.map((e) => row(e, 'en')), 'Source: LTA via data.gov.sg (Singapore Open Data Licence 1.0).', ['l', 'r', 'r', 'r', 'r'])}
<p>The fourth column shows how far Category B closed above or below Category A in the same exercise. The two car categories share the same calendar and are often bid for by the same dealers, yet their premiums can part by several thousand dollars from one exercise to the next. Category E, in the third column, is the reference point for dealers who need flexibility.</p>
<h2>Which cars need a Category B certificate</h2>
<p>The rule is the mirror image of Category A. A petrol, diesel or hybrid car goes into Category B as soon as one of two limits is crossed: more than ${h.n(P.catA.maxCc)} cc of engine, or more than ${P.catA.maxKw} kW of maximum power. A fully electric car goes into Category B above ${P.catA.evMaxKw} kW. In practice that means most cars with a two litre engine, most turbocharged models with sporty tuning, large SUVs, people carriers and the more powerful electric cars.</p>
<p>Power is the limit people forget. Several hybrids combine a modest engine with an electric motor whose combined output passes ${P.catA.maxKw} kW, and the importer’s type approval, not the brochure headline, sets the category. Check the figure before you commit to a model, or test it in the ${h.a('coe-cat-a', 'Category A checker')}.</p>
${h.mini('cost', { t: 'Cost per year of a larger car', p: ['omv', 'band'], d: { omv: CAR_B.omv, cc: CAR_B.cc, kw: 135, band: 'C1' } })}
<h2>For large cars, the ARF becomes a major part of the price</h2>
<p>Take a car with an OMV of ${h.m(CAR_B.omv)}, a 1,998 cc engine and VES band C1. Its tiered ARF is ${h.m(CAR_B.u.grossArf)}, and the band C1 surcharge of ${h.m(P.ves[2026].C1)} brings it to ${h.m(CAR_B.u.netArf)}. Excise duty and GST add ${h.m(CAR_B.u.dutyGst)}. With the Category B premium of ${h.m(CAR_B.coe)}, the car reaches ${h.m(CAR_B.u.basicWithCoe)} before the dealer’s margin. The ARF is ${h.pct(arfShare)} of that and the COE ${h.pct(coeShare)}. On the Category A car with half the OMV, the ARF is only ${h.pct(arfShareA)} of the price, and the certificate takes most of the rest. The bigger the OMV, the more the tiered ARF grows, because each slice above ${h.m(P.arf.from2023[0][0]!)} is taxed at more than its own value.</p>
<p>That has two consequences. A change in the Category B premium moves the price of a large car proportionally less than that of a small car. And the PARF rebate, which is a share of the ARF, matters more: under the rules for COEs obtained from February 2026, it is capped at ${h.m(P.parf.from2026.cap)}, a cap a large car can reach. The ${h.a('arf', 'ARF calculator')} shows each tier and the ${h.a('ves', 'VES page')} the five bands.</p>
<h2>A longer view</h2>
<p>Category B averaged ${h.m(last.mean)} over the ${last.n} exercises held so far in ${last.year}. Its highest result in the published series is ${h.m(rec.value)}, in the ${exName(rec.ex, 'en')}. Renewing a Category B car at ten years costs the Category B prevailing quota premium, which by our calculation is ${h.m(PQP_NEXT.B)} for renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')}; half of that renews it for five years.</p>
<p>LTA is consulting on a new way to split cars between categories, aimed at separating mass market cars from higher value ones. Until it decides, the engine and power limits above remain the rule, and the calculators on this site apply them. When a new split is announced, this page, its table and the calculators change on the day of publication, and certificates already obtained follow whatever transition LTA sets.</p>`,
  },
  zh: {
    slug: 'coe-cat-b', nav: 'B类拥车证', card: '较大汽车、E类与附加注册费的影响',
    title: 'B类拥车证价格 2026：最新结果、与E类比较及历史',
    description: `2026年B类拥车证：最新一轮价格 ${zh(B)}，与A类及开放E类的差距，最近12轮结果，以及2010年以来的最高纪录，读取自 data.gov.sg。`,
    h1: 'B类拥车证：较大的汽车',
    intro: `B类涵盖所有超出A类上限的汽车。最新结果：${exName(LATEST, 'zh')} ${zh(B)}，读取于${day(FETCHED, 'zh')}。`,
    resume: `${exName(LATEST, 'zh')}B类拥车证价格为 ${zh(B)}，比${exName(PREVIOUS, 'zh')}变动 ${signed(change('B'), 'zh')}；同一轮A类为 ${zh(A)}，开放的E类为 ${zh(E)}。凡是引擎超过 ${num(P.catA.maxCc, 'zh')} cc，或功率超过 ${P.catA.maxKw} kW 的汽车，都需要B类拥车证；功率超过 ${P.catA.evMaxKw} kW 的纯电动车也一样。在最近12轮中，B类有 ${bAbove} 轮比A类贵，E类有 ${eAbove} 轮等于或高于B类。对大型车来说，附加注册费在车价中所占的比例大得多：一辆 OMV 为 ${zh(CAR_B.omv)}、排放等级 C1 的车，附加注册费为 ${zh(CAR_B.u.netArf)}，占车行加价前车价的 ${pct(CAR_B.u.netArf / CAR_B.u.basicWithCoe, 'zh', 0)}。页面顶部的计算器会显示某个B类保留价在过去有多少轮能够中标，可以选择回看半年、一年或两年，并与最新结果比较，看看自己的出价与市场相差多少。`,
    faqs: [
      { q: '为什么B类有时比A类便宜？', a: `每个类别都有自己的配额和投标者，两个价格是分开决定的。当B类配额增长快于大型车需求，或大批A类买家同时涌入时，几轮之内两者的高低就会对调。在最近12轮中，B类有 ${bAbove} 轮是较贵的一类，其余各轮则是A类较贵或两者相同。所以不能假定大车的拥车证一定更贵。` },
      { q: 'B类和E类拥车证有什么不同？', a: 'B类拥车证只能注册超出A类上限的汽车。E类拥车证是开放的：可以注册任何一类汽车、货车或巴士，但不能注册摩托车。由于车行可以在B类和E类之间切换，两者的价格通常同步变动，E类略高一些，有时也会低于B类。注销时的拥车证回扣按两者中较低的价格计算。' },
      { q: 'B类拥车证最高价格是多少？', a: `在2010年以来的序列中，B类最高价格为 ${zh(rec.value)}，出现在${exName(rec.ex, 'zh')}。最近24轮的价格介于 ${zh(s24.min)} 至 ${zh(s24.max)}。所有结果都在陆路交通管理局于 data.gov.sg 发布的开放数据集中，本站在每轮竞标后读取，并更新本页的表格。` },
    ],
    body: (h) => `
<h2>最近12轮的B类与E类</h2>
${h.table(['轮次', 'B类', 'E类', 'B类减A类', 'B类投标数'], l12.map((e) => row(e, 'zh')), '来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证 1.0 版）。', ['l', 'r', 'r', 'r', 'r'])}
<p>第四列显示同一轮中B类比A类高出或低了多少。两个汽车类别的竞标日期相同，往往也是同一批车行在投标，但两者的价格在相邻两轮之间可以相差好几千元。第三列的E类，是需要弹性的车行用来参照的价格：哪一类便宜，车行就会把订单转到哪一类去投标。</p>
<h2>哪些车需要B类拥车证</h2>
<p>规则正好与A类相反。汽油车、柴油车或混合动力车，只要超过两个上限中的任何一个，就属于B类：引擎超过 ${h.n(P.catA.maxCc)} cc，或最大功率超过 ${P.catA.maxKw} kW。纯电动车功率超过 ${P.catA.evMaxKw} kW 也属于B类。实际上，这包括大多数两升引擎的车、大多数运动调校的涡轮车款、大型SUV、多用途车，以及功率较高的电动车。</p>
<p>功率是人们最容易忽略的上限。有些混合动力车引擎不大，但加上电动机后综合功率超过 ${P.catA.maxKw} kW，而决定类别的是进口商的型式认证，而不是宣传册上的标题数字。决定车款之前先核对这个数字，或在${h.a('coe-cat-a', 'A类判断工具')}中试算。</p>
${h.mini('cost', { t: '较大汽车的每年成本', p: ['omv', 'band'], d: { omv: CAR_B.omv, cc: CAR_B.cc, kw: 135, band: 'C1' } })}
<h2>对大型车而言，附加注册费成为车价的主要部分</h2>
<p>以一辆 OMV 为 ${h.m(CAR_B.omv)}、1,998 cc 引擎、排放等级 C1 的车为例。分级计算的附加注册费为 ${h.m(CAR_B.u.grossArf)}，加上 C1 级 ${h.m(P.ves[2026].C1)} 的附加费，达到 ${h.m(CAR_B.u.netArf)}。消费税和商品及服务税另加 ${h.m(CAR_B.u.dutyGst)}。再加上 ${h.m(CAR_B.coe)} 的B类拥车证，车行加价前的总额为 ${h.m(CAR_B.u.basicWithCoe)}。其中附加注册费占 ${h.pct(arfShare)}，拥车证占 ${h.pct(coeShare)}。OMV 只有一半的A类车，附加注册费仅占车价的 ${h.pct(arfShareA)}，其余大部分是拥车证。OMV 越高，分级附加注册费增长越快，因为超过 ${h.m(P.arf.from2023[0][0]!)} 的每一段，税额都高于这一段本身的价值。</p>
<p>这带来两个结果。B类价格的变动，对大型车车价的影响比例小于小型车。而 PARF 回扣作为附加注册费的一部分，就显得更重要：按2026年2月起取得的拥车证规则，回扣上限为 ${h.m(P.parf.from2026.cap)}，大型车很容易达到这个上限。${h.a('parf-rebate', 'PARF 回扣计算器')}会显示车龄与回扣的关系。</p>
<h2>更长的视角</h2>
<p>${last.year}年迄今举行的 ${last.n} 轮中，B类平均价格为 ${h.m(last.mean)}。公布序列中的最高结果为${exName(rec.ex, 'zh')}的 ${h.m(rec.value)}。B类车在十年后续期，要付B类的预定市场价格；按本站计算，${monthYear(PQP_NEXT.appliesTo, 'zh')}续期为 ${h.m(PQP_NEXT.B)}，续期五年只需一半。</p>
<p>陆路交通管理局正就新的汽车类别划分方式征求意见，目的是区分大众车与较高价值的车。在当局作出决定之前，上述排量与功率上限仍是现行规则，本站的计算器也照此计算。新规则一旦公布，本页的说明、表格和计算器都会在当天更新，旧规则下已取得的拥车证则按当局的过渡安排处理。</p>`,
  },
});
