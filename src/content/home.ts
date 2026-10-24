/**
 * Accueil (en + zh) : vise « coe », « coe price », « car cost singapore ». Texte ici, mise en page dans
 * src/components/HomePage.astro. Tous les montants viennent de data.ts / _facts.ts (moteur + data.gov.sg).
 */
import type { FAQ, Helpers } from '../lib/page-types';
import { CAR_A, CAR_B, LATEST, PREVIOUS, premium, change, stats, record, yearly, PQP_NEXT } from './_facts';
import { exName, money, pct, signed, day, monthYear, FETCHED, NEXT_EX, catShort, EXERCISES, FIRST } from '../lib/data';
import { P } from '../lib/engine/car-cost';
import PARAMS from '../data/params-2026.json';

interface HomeText { title: string; description: string; h1: string; intro: string; resume: string; valeur: string; recentTitle: string; recentIntro: string; yearsTitle: string; yearsIntro: string; foldTitle: string; faqs: FAQ[]; why: (h: Helpers) => string; sections: (h: Helpers) => Array<{ title: string; html: string }> }

const A = premium(LATEST, 'A'), B = premium(LATEST, 'B'), C = premium(LATEST, 'C'), D = premium(LATEST, 'D'), E = premium(LATEST, 'E');
const recA = record('A'), recB = record('B');
const s24A = stats('A', 24), s24B = stats('B', 24);
const ys = yearly('A');
const y2019 = ys.find((y) => y.year === 2019)!, yNow = ys[ys.length - 1];
const en = (x: number, d = 0) => money(x, 'en', d), zh = (x: number, d = 0) => money(x, 'zh', d);
const pen = (x: number) => pct(x, 'en', 0), pzh = (x: number) => pct(x, 'zh', 0);
const nextEn = NEXT_EX ? `The next exercise opens on ${day(NEXT_EX.start, 'en')} at 12 noon and closes on ${day(NEXT_EX.end, 'en')} at 4 pm.` : 'LTA has not yet published the next exercise dates.';
const nextZh = NEXT_EX ? `下一轮于${day(NEXT_EX.start, 'zh')}中午12时开始，${day(NEXT_EX.end, 'zh')}下午4时结束。` : '陆路交通管理局尚未公布下一轮日期。';
const pending = PARAMS.pending;
const T0 = P.arf.from2023[0], TL = P.arf.from2023[P.arf.from2023.length - 1], TP = P.arf.from2023[P.arf.from2023.length - 2];
const EEAI_RATE = PARAMS.eeai.rate, EEAI_CAP = PARAMS.eeai.caps['2026'], AGE_MAX = P.roadTax.ageSurcharge[0][1];

const EN: HomeText = {
  title: `COE Price ${monthYear(LATEST.month, 'en')}: Latest Results and Full Car Cost`,
  description: 'COE prices of the latest 2026 exercise in all five categories, next bidding dates and the full cost of a car in Singapore: OMV, ARF, VES, COE, road tax, PARF.',
  h1: 'COE prices and the real cost of a car in Singapore',
  intro: `Results of the ${exName(LATEST, 'en')}, read from LTA open data on ${day(FETCHED, 'en')}, and a calculator that turns them into a cost per year.`,
  resume: `In the ${exName(LATEST, 'en')} the COE premium closed at ${en(A)} for Category A, ${en(B)} for Category B, ${en(C)} for Category C, ${en(D)} for motorcycles and ${en(E)} for the open Category E. Against the exercise before, Category A moved by ${signed(change('A'), 'en')} and Category B by ${signed(change('B'), 'en')}. The certificate is only one line of the price: a Category A car with an OMV of ${en(CAR_A.omv)} also pays ${en(CAR_A.u.dutyGst)} of excise duty and GST, an ARF of ${en(CAR_A.u.netArf)} and the ${en(P.registrationFee)} registration fee, which puts it at ${en(CAR_A.u.basicWithCoe)} before the dealer’s margin, with the COE at ${pen(CAR_A.coeShare)} of it. Kept 10 years and scrapped, it costs about ${en(CAR_A.perYear10)} a year in depreciation and road tax; kept 5 years, the larger rebates bring that to ${en(CAR_A.perYear5)}. ${nextEn}`,
  valeur: 'One calculator runs the whole chain, from OMV and ARF tiers to the COE result of the last exercise, road tax and the rebates you get back, and it updates after every bidding exercise from the official open data.',
  recentTitle: 'COE results of the last 24 exercises',
  recentIntro: `Quota premium of each category, the price every successful bidder pays. Category A and B prices over this year of bidding ranged from ${en(s24A.min)} to ${en(s24A.max)} (A) and ${en(s24B.min)} to ${en(s24B.max)} (B).`,
  yearsTitle: 'COE prices by year since 2010',
  yearsIntro: `The average Category A premium went from ${en(y2019.mean)} in 2019 to ${en(yNow.mean)} so far in ${yNow.year}. The highest Category A result on record is ${en(recA.value)} (${exName(recA.ex, 'en')}); for Category B it is ${en(recB.value)} (${exName(recB.ex, 'en')}).`,
  foldTitle: 'The rules behind the price, in detail',
  faqs: [
    { q: 'What is the COE price now?', a: `In the ${exName(LATEST, 'en')} the premium was ${en(A)} for Category A, ${en(B)} for Category B, ${en(C)} for Category C, ${en(D)} for Category D and ${en(E)} for Category E. Every successful bidder in a category pays that same premium, even if the bid was higher. The figures come from LTA’s data set on data.gov.sg, read on ${day(FETCHED, 'en')}.` },
    { q: 'When is the next COE bidding exercise?', a: `${nextEn} LTA holds two exercises a month. Each one usually opens at 12 noon on the first or third Monday and lasts three working days, closing at 4 pm on the Wednesday when no public holiday falls in between. This site reads the results from the open data the same week.` },
    { q: 'How much does a car really cost in Singapore?', a: `For a Category A car with an OMV of ${en(CAR_A.omv)} the taxes and the COE add up to ${en(CAR_A.u.basicWithCoe)} before any dealer margin. Spread over 10 years and counting the PARF rebate at the end, depreciation and road tax come to about ${en(CAR_A.perYear10)} a year. Insurance, parking, petrol and ERP come on top and depend on how you drive.` },
    { q: 'What is the difference between Category A and Category B?', a: `Category A covers non electric cars up to ${P.catA.maxCc} cc and ${P.catA.maxKw} kW, and electric cars up to ${P.catA.evMaxKw} kW. Anything more powerful goes into Category B. The two premiums are often close: in the ${exName(LATEST, 'en')} they were ${en(A)} and ${en(B)}, a gap of ${en(Math.abs(A - B))}.` },
    { q: 'Does this site forecast COE prices?', a: 'No. Nobody publishes a forecast that LTA stands behind, and the premium depends on how many people bid in a given exercise. The site shows the results, their spread over past exercises and how often a given reserve price would have been enough. Those are facts about the past, not a prediction of the next result.' },
    { q: 'What do I get back when I scrap my car?', a: `Two rebates: the PARF rebate, a share of the ARF you paid that falls with the age of the car, and the COE rebate for the unused months of the certificate. Under the rules for COEs obtained since February 2026, a car scrapped at 5 years returns ${pen(P.parf.from2026.rates[0])} of its ARF, capped at ${en(P.parf.from2026.cap)}, and nothing after 10 years.` },
    { q: 'Is COE Cost an LTA website?', a: 'No. It is published by Radif Partners, a company that builds calculators from public data. It is not linked to the Land Transport Authority, a dealer, a bank or an insurer. The COE data comes from data.gov.sg under the Singapore Open Data Licence, and every rule links to the LTA page it was read on.' },
    { q: 'Why does the dealer price differ from the calculator?', a: 'The calculator stops at what the government charges: OMV, duty, GST, ARF, VES, registration fee and COE. A dealer adds a margin, delivery, warranty, often a package of accessories, and may or may not guarantee a COE. Type the dealer price into the advanced field to see the real cost per year of the offer you received.' },
  ],
  why: (h) => `
<h2>What makes up the price of a car in Singapore</h2>
<p>A new car carries seven charges before the dealer adds anything. The base is the open market value (OMV), the price Singapore Customs assesses for the car as imported, freight and insurance included. On that base the government levies an excise duty of ${h.pct(P.exciseDutyRate)} of the OMV, then GST of ${h.pct(P.gstRate)} on the OMV plus the duty. The registration fee is a flat ${h.m(P.registrationFee)}. Then come the two large items: the additional registration fee (ARF), charged in tiers on the OMV, and the certificate of entitlement (COE), bought in a bidding exercise and valid for ten years.</p>
<p>The ARF is where the size of the car starts to count. The first ${h.m(T0[0]!)} of OMV pays ${h.pct(T0[1])}, and each further slice pays more, up to ${h.pct(TL[1])} on what lies above ${h.m(TP[0]!)}. A car with an OMV of ${h.m(CAR_A.omv)} pays an ARF of ${h.m(CAR_A.u.grossArf)}; a car with twice that OMV, ${h.m(CAR_B.omv)}, pays ${h.m(CAR_B.u.grossArf)}, more than twice as much. The ${h.a('arf', 'ARF calculator')} shows each slice.</p>
<p>The Vehicular Emissions Scheme then adjusts the ARF. Cleaner cars in band A get a rebate of ${h.m(-P.ves[2026].A)} in 2026, band B pays nothing extra, and bands C1 to C3 pay a surcharge of up to ${h.m(P.ves[2026].C3)}. An electric car registered in 2026 also gets the EEAI, ${h.pct(EEAI_RATE)} of its ARF up to ${h.m(EEAI_CAP)}, until the scheme ends on 31 December 2026. The ${h.a('ves', 'VES page')} shows the five bands.</p>
${h.mini('arf', { t: 'ARF on your OMV', p: ['omv'] })}
<p>Put together for the Category A car above: ${h.m(CAR_A.omv)} of OMV, ${h.m(CAR_A.u.dutyGst)} of duty and GST, ${h.m(CAR_A.u.netArf)} of ARF in band B, the ${h.m(P.registrationFee)} fee and a COE of ${h.m(CAR_A.coe)} give ${h.m(CAR_A.u.basicWithCoe)}. The certificate alone is ${h.pct(CAR_A.coeShare)} of that sum. For the larger car with an OMV of ${h.m(CAR_B.omv)} in band C1, the total reaches ${h.m(CAR_B.u.basicWithCoe)}, of which the COE is a smaller share and the ARF a much larger one.</p>
<h2>Why a cost per year says more than a sticker price</h2>
<p>Two parts of that price come back. When a car is deregistered before it turns ten, the owner receives a PARF rebate, a share of the ARF actually paid, and a COE rebate for the unused part of the certificate. A car scrapped early returns more, which is why some owners sell at five or six years. Under the schedule announced in February 2026 for new COEs, the PARF share starts at ${h.pct(P.parf.from2026.rates[0])} for a car up to five years old and falls by five points a year to ${h.pct(P.parf.from2026.rates[5])} in the tenth year, with a cap of ${h.m(P.parf.from2026.cap)}.</p>
<p>That is why the calculator at the top ends on a cost per year. The Category A example costs about ${h.m(CAR_A.perYear10)} a year over ten years and ${h.m(CAR_A.perYear5)} a year over five: the shorter period recovers a larger PARF rebate (${h.m(CAR_A.parf5)} against ${h.m(CAR_A.parf10)}) and half the COE (${h.m(CAR_A.coeBack5)}), but spreads the loss over fewer years. Road tax, ${h.m(CAR_A.rt, 2)} a year for this 1,496 cc engine, is added for each year kept. The ${h.a('cost-of-owning', 'cost of owning calculator')} lets you add insurance, parking and petrol.</p>
<h2>How COE bidding sets the premium</h2>
<p>LTA releases a fixed number of certificates in each category for each exercise. Bidders state the most they are willing to pay; when the exercise closes, the lowest successful bid becomes the quota premium and every successful bidder pays that amount, not their own bid. A bid deposit of ${h.m(PARAMS.coe.bidDeposit)} is required for cars, ${h.m(P.moto.bidDeposit)} for motorcycles. ${h.a('coe-bidding', 'How COE bidding works')} explains the reserve price and what happens to it during the three days.</p>
<p>The premium rises when more people bid than there are certificates. In the ${exName(LATEST, 'en')}, Category A received ${h.n(LATEST.cats.A.bids)} bids for a quota of ${h.n(LATEST.cats.A.quota)}. The quota itself follows the number of vehicles deregistered in the months before, so a wave of cars reaching ten years tends to bring more certificates later. The ${h.a('coe-results', 'COE results page')} gives quota, bids and premium for every exercise since ${monthYear(FIRST.month, 'en')}.</p>`,
  sections: (h) => [
    { title: 'The five COE categories', html: `<p>Category A is for cars up to ${P.catA.maxCc} cc and ${P.catA.maxKw} kW, or electric cars up to ${P.catA.evMaxKw} kW. Category B takes every other car. Category C covers goods vehicles and buses, Category D motorcycles, and Category E is the open category: its certificate can be used for any vehicle except a motorcycle, which is why its premium usually sits a little above Category B. Off peak cars, taxis and some public service vehicles follow rules of their own and are not covered here.</p><p>Category is set by the engine, not by the price of the car. A hybrid with a 1,598 cc petrol engine and a combined power above ${P.catA.maxKw} kW goes into Category B even if its OMV is modest. The ${h.a('coe-cat-a', 'Category A page')} and the ${h.a('coe-cat-b', 'Category B page')} show the results of each.</p>` },
    { title: 'Renewing a COE instead of buying a new car', html: `<p>At ten years the COE expires. The owner can renew it for five or ten years by paying the prevailing quota premium (PQP), the moving average of the last three months of results for the category. For renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')} our calculation of the Category A PQP from the open data is ${h.m(PQP_NEXT.A)}; renewing for five years costs half of it. Renewing gives up the PARF rebate, and a car renewed for five years cannot be renewed again. The ${h.a('coe-renewal', 'COE renewal calculator')} weighs the two options.</p>` },
    { title: 'Road tax', html: `<p>Road tax is paid every six or twelve months. For a petrol car it depends on engine capacity, for an electric car on motor power, plus a flat component of ${h.m(P.roadTax.evAfcSixMonthly)} every six months. Cars older than ten years pay a surcharge that rises each year up to ${h.pct(AGE_MAX)}. A 1,496 cc car pays ${h.m(CAR_A.rt, 2)} a year, a 1,998 cc car ${h.m(CAR_B.rt, 2)}. The ${h.a('road-tax', 'road tax calculator')} covers petrol, hybrid and electric cars, and ${h.a('road-tax-renewal', 'road tax renewal')} explains the late fees.</p>` },
    { title: 'Car loans', html: `<p>The Monetary Authority of Singapore caps a car loan at ${h.pct(P.loans.ltvLow)} of the purchase price when the OMV is up to ${h.m(P.loans.lowOmv)} and ${h.pct(P.loans.ltvHigh)} above, over at most ${P.loans.maxYears} years. The purchase price includes the taxes and the COE, so a Category A car at ${h.m(CAR_A.u.basicWithCoe)} with an OMV above ${h.m(P.loans.lowOmv)} needs a cash down payment of at least ${h.m(CAR_A.u.basicWithCoe * (1 - P.loans.ltvHigh))}. Banks quote flat rates, which hide a higher effective rate; the ${h.a('car-loan', 'car loan calculator')} shows both.</p>` },
    { title: 'What may change next', html: `<ul>${pending.en.map((x) => `<li>${x}</li>`).join('')}</ul><p>Each change is applied to the calculators on the day LTA or the Ministry of Finance publishes it, and the date at the top of every page tells you when the figures were last read.</p>` },
  ],
};

const ZH: HomeText = {
  title: `新加坡拥车证价格 2026：${exName(LATEST, 'zh')}结果与买车总成本`,
  description: `2026年最新一轮拥车证竞标结果（五个类别）、下一轮日期，以及在新加坡买车的完整成本：公开市场价值、附加注册费、排放计划、拥车证、路税与 PARF。`,
  h1: '新加坡拥车证价格与买车的真实成本',
  intro: `${exName(LATEST, 'zh')}的结果，于${day(FETCHED, 'zh')}从陆路交通管理局开放数据读取，再由计算器换算成每年成本。`,
  resume: `${exName(LATEST, 'zh')}拥车证价格为：A类 ${zh(A)}，B类 ${zh(B)}，C类 ${zh(C)}，摩托车（D类）${zh(D)}，开放类（E类）${zh(E)}。与上一轮相比，A类变动 ${signed(change('A'), 'zh')}，B类变动 ${signed(change('B'), 'zh')}。拥车证只是车价中的一项：一辆公开市场价值（OMV）为 ${zh(CAR_A.omv)} 的A类车，还要支付 ${zh(CAR_A.u.dutyGst)} 的消费税和商品及服务税、${zh(CAR_A.u.netArf)} 的附加注册费以及 ${zh(P.registrationFee)} 的注册费，合计 ${zh(CAR_A.u.basicWithCoe)}（未含车行利润），其中拥车证占 ${pzh(CAR_A.coeShare)}。如果用满10年再报废，折旧加路税约为每年 ${zh(CAR_A.perYear10)}；只用5年，虽然取回的回扣更多，每年成本却是 ${zh(CAR_A.perYear5)}。${nextZh}`,
  valeur: '一个计算器串起整条计算链：从公开市场价值与附加注册费分级，到最新一轮的拥车证价格、路税以及注销时取回的回扣；每轮竞标后都根据官方开放数据更新。',
  recentTitle: '最近24轮拥车证结果',
  recentIntro: `各类别的配额价格，即所有成功投标者都要支付的价格。这一年的竞标中，A类介于 ${zh(s24A.min)} 至 ${zh(s24A.max)}，B类介于 ${zh(s24B.min)} 至 ${zh(s24B.max)}。`,
  yearsTitle: '2010年以来每年的拥车证价格',
  yearsIntro: `A类平均价格从2019年的 ${zh(y2019.mean)} 升至${yNow.year}年迄今的 ${zh(yNow.mean)}。A类历史最高为 ${zh(recA.value)}（${exName(recA.ex, 'zh')}），B类为 ${zh(recB.value)}（${exName(recB.ex, 'zh')}）。`,
  foldTitle: '车价背后的规则',
  faqs: [
    { q: '现在的拥车证价格是多少？', a: `${exName(LATEST, 'zh')}的价格为：A类 ${zh(A)}，B类 ${zh(B)}，C类 ${zh(C)}，D类 ${zh(D)}，E类 ${zh(E)}。同一类别的所有成功投标者都支付这个价格，即使自己的出价更高。数字来自陆路交通管理局在 data.gov.sg 发布的数据集，读取于${day(FETCHED, 'zh')}。` },
    { q: '下一轮拥车证竞标是什么时候？', a: `${nextZh}陆路交通管理局每月举行两轮竞标，通常在每月第一个和第三个星期一中午12时开始，为期三个工作日，如中间没有公共假期，就在星期三下午4时截止。本站会在同一周从开放数据读取结果，并更新所有页面和计算器。` },
    { q: '在新加坡买一辆车实际要花多少钱？', a: `以 OMV 为 ${zh(CAR_A.omv)} 的A类车为例，税费加拥车证合计 ${zh(CAR_A.u.basicWithCoe)}，未含车行利润。分摊到10年，并计入期满时的 PARF 回扣，折旧和路税约为每年 ${zh(CAR_A.perYear10)}。保险、停车、油费和电子道路收费另计，取决于您的用车方式，可在计算器的进阶栏位中自行输入。` },
    { q: 'A类和B类拥车证有什么区别？', a: `A类适用于排量不超过 ${P.catA.maxCc} cc 且功率不超过 ${P.catA.maxKw} kW 的非电动车，以及功率不超过 ${P.catA.evMaxKw} kW 的电动车；功率更大的车都属于B类。两类价格往往接近：${exName(LATEST, 'zh')}分别为 ${zh(A)} 和 ${zh(B)}，相差 ${zh(Math.abs(A - B))}。类别由引擎决定，与车价无关。` },
    { q: '本站会预测拥车证价格吗？', a: '不会。没有任何获陆路交通管理局认可的预测，价格取决于每一轮有多少人投标。本站只显示过往结果、它们在近期各轮的分布，以及某个保留价在过去有多少轮能够成交。这些是关于过去的事实，不是对下一轮的预测，也不应作为投标保证。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
    { q: '报废车辆时能拿回多少钱？', a: `有两项回扣：PARF 回扣，即所付附加注册费的一部分，比例随车龄下降；以及拥车证未用月份的回扣。按2026年2月起取得的拥车证规则，车龄5年内报废可取回附加注册费的 ${pzh(P.parf.from2026.rates[0])}，上限 ${zh(P.parf.from2026.cap)}；超过10年则没有 PARF 回扣。两项回扣都要在注销后十二个月内使用。` },
    { q: '本站是陆路交通管理局的网站吗？', a: '不是。本站由 Radif Partners 发布，这是一家根据公开数据制作计算器的公司，与陆路交通管理局、车行、银行或保险公司都没有关系。拥车证数据依据新加坡开放数据许可证取自 data.gov.sg，每一条规则都链接到读取它的陆路交通管理局页面，方便您自行核对。' },
    { q: '为什么车行报价和计算结果不同？', a: '计算器只算政府收取的部分：公开市场价值、消费税、商品及服务税、附加注册费、排放计划调整、注册费和拥车证。车行还会加上利润、交车费、保修，常常附带配件套餐，也不一定保证拥车证。把车行报价输入进阶栏位，就能看到这份报价的真实每年成本。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
  ],
  why: (h) => `
<h2>新加坡车价由哪些部分组成</h2>
<p>一辆新车在车行加价之前，已经包含七项收费。基础是公开市场价值（OMV），即新加坡关税局评定的进口价，包括运费和保险。在此基础上，政府征收 OMV 的 ${h.pct(P.exciseDutyRate)} 消费税，再对 OMV 加消费税后的金额征收 ${h.pct(P.gstRate)} 的商品及服务税。注册费固定为 ${h.m(P.registrationFee)}。接下来是两大项：按 OMV 分级征收的附加注册费（ARF），以及通过竞标取得、有效期十年的拥车证（COE）。</p>
<p>附加注册费是车辆大小开始起作用的地方。OMV 的首 ${h.m(T0[0]!)} 按 ${h.pct(T0[1])} 征收，之后每一段税率更高，超过 ${h.m(TP[0]!)} 的部分高达 ${h.pct(TL[1])}。OMV 为 ${h.m(CAR_A.omv)} 的车，附加注册费为 ${h.m(CAR_A.u.grossArf)}；OMV 翻倍到 ${h.m(CAR_B.omv)} 的车，附加注册费为 ${h.m(CAR_B.u.grossArf)}，超过两倍。${h.a('arf', '附加注册费计算器')}会列出每一段。</p>
<p>车辆排放计划（VES）随后调整附加注册费。2026年，A级的清洁车辆可得 ${h.m(-P.ves[2026].A)} 回扣，B级不加不减，C1 至 C3 级须付最高 ${h.m(P.ves[2026].C3)} 的附加费。2026年注册的纯电动车还可获得电动车早期采用奖励（EEAI），即附加注册费的 ${h.pct(EEAI_RATE)}，上限 ${h.m(EEAI_CAP)}，该计划于2026年12月31日结束。</p>
${h.mini('arf', { t: '按您的 OMV 计算附加注册费', p: ['omv'] })}
<p>把上面那辆A类车的各项加起来：${h.m(CAR_A.omv)} 的 OMV、${h.m(CAR_A.u.dutyGst)} 的消费税和商品及服务税、B级的 ${h.m(CAR_A.u.netArf)} 附加注册费、${h.m(P.registrationFee)} 注册费，再加上 ${h.m(CAR_A.coe)} 的拥车证，合计 ${h.m(CAR_A.u.basicWithCoe)}。单是拥车证就占 ${h.pct(CAR_A.coeShare)}。至于 OMV 为 ${h.m(CAR_B.omv)}、排放等级 C1 的较大车款，总额达到 ${h.m(CAR_B.u.basicWithCoe)}，其中拥车证所占比例较小，附加注册费所占比例则大得多。</p>
<h2>为什么每年成本比标价更有意义</h2>
<p>车价中有两部分可以取回。车辆在十年内注销时，车主可得 PARF 回扣（实际所付附加注册费的一部分）以及拥车证未用部分的回扣。越早报废，取回越多，这也是有些车主在五六年时卖车的原因。按2026年2月公布、适用于新拥车证的比例，车龄五年内的 PARF 比例为 ${h.pct(P.parf.from2026.rates[0])}，之后每年减少五个百分点，第十年为 ${h.pct(P.parf.from2026.rates[5])}，上限 ${h.m(P.parf.from2026.cap)}。</p>
<p>所以页面顶部的计算器最后得出的是每年成本。上面的A类车用10年约每年 ${h.m(CAR_A.perYear10)}，用5年约每年 ${h.m(CAR_A.perYear5)}：较短的期限能取回较多的 PARF（${h.m(CAR_A.parf5)}，对比 ${h.m(CAR_A.parf10)}）和一半的拥车证（${h.m(CAR_A.coeBack5)}），但损失分摊到较少的年份。这辆 1,496 cc 车的路税每年 ${h.m(CAR_A.rt, 2)}，按使用年数计入。</p>
<h2>拥车证竞标如何决定价格</h2>
<p>陆路交通管理局每一轮为每个类别释放固定数量的拥车证。投标者说明自己愿付的最高价；竞标截止时，最低的成功出价就成为配额价格，所有成功投标者都按这个价格付款，而不是按自己的出价。汽车投标须缴 ${h.m(PARAMS.coe.bidDeposit)} 押金，摩托车为 ${h.m(P.moto.bidDeposit)}。${h.a('coe-bidding', '拥车证竞标方式')}一页说明保留价，以及三天竞标期间它如何变化。</p>
<p>当投标人数多于拥车证数量时，价格就会上升。${exName(LATEST, 'zh')}，A类收到 ${h.n(LATEST.cats.A.bids)} 份投标，配额为 ${h.n(LATEST.cats.A.quota)}。配额本身取决于之前几个月注销的车辆数量，因此一批车辆到达十年时，往往会在稍后带来更多拥车证。${h.a('coe-results', '拥车证结果')}一页列出自${monthYear(FIRST.month, 'zh')}以来每一轮的配额、投标数和价格。</p>`,
  sections: (h) => [
    { title: '拥车证的五个类别', html: `<p>A类适用于排量不超过 ${P.catA.maxCc} cc 且功率不超过 ${P.catA.maxKw} kW 的汽车，或功率不超过 ${P.catA.evMaxKw} kW 的电动车。B类涵盖其余所有汽车。C类为货车和巴士，D类为摩托车，E类为开放类：其拥车证可用于摩托车以外的任何车辆，因此价格通常略高于B类。非高峰时段用车、德士和部分公共服务车辆另有规则，本站未涵盖。</p><p>类别由引擎决定，而不是由车价决定。一辆 1,598 cc 的混合动力车，如果综合功率超过 ${P.catA.maxKw} kW，即使 OMV 不高也属于B类。${h.a('coe-cat-a', 'A类拥车证')}和${h.a('coe-cat-b', 'B类拥车证')}两页分别列出各自的结果。</p>` },
    { title: '续期拥车证，而不是换新车', html: `<p>拥车证在十年后到期。车主可以支付预定市场价格（PQP）续期五年或十年，PQP 是该类别最近三个月结果的移动平均。以开放数据计算，${monthYear(PQP_NEXT.appliesTo, 'zh')}续期的A类 PQP 为 ${h.m(PQP_NEXT.A)}；续期五年只需一半。续期会放弃 PARF 回扣，而且续期五年的车不能再次续期。${h.a('coe-renewal', '拥车证续期计算器')}会比较这两种选择。</p>` },
    { title: '路税', html: `<p>路税每六个月或十二个月缴付一次。汽油车按引擎排量计算，电动车按电机功率计算，并每六个月另加 ${h.m(P.roadTax.evAfcSixMonthly)} 的固定费用。车龄超过十年的车须付附加费，逐年增加，最高 ${h.pct(AGE_MAX)}。1,496 cc 的车每年路税为 ${h.m(CAR_A.rt, 2)}，1,998 cc 的车为 ${h.m(CAR_B.rt, 2)}。${h.a('road-tax', '路税计算器')}涵盖汽油车、混合动力车和电动车，${h.a('road-tax-renewal', '路税续缴')}一页说明逾期费用。</p>` },
    { title: '汽车贷款', html: `<p>新加坡金融管理局规定，OMV 不超过 ${h.m(P.loans.lowOmv)} 时，汽车贷款最多为购车价的 ${h.pct(P.loans.ltvLow)}，超过时为 ${h.pct(P.loans.ltvHigh)}，期限最长 ${P.loans.maxYears} 年。购车价包括税费和拥车证，因此一辆 ${h.m(CAR_A.u.basicWithCoe)}、OMV 超过 ${h.m(P.loans.lowOmv)} 的A类车，至少需要 ${h.m(CAR_A.u.basicWithCoe * (1 - P.loans.ltvHigh))} 的现金首付。银行报的是平息利率，实际利率更高；${h.a('car-loan', '汽车贷款计算器')}会同时显示两者。</p>` },
    { title: '接下来可能的变化', html: `<ul>${pending.zh.map((x) => `<li>${x}</li>`).join('')}</ul><p>每项变化都会在陆路交通管理局或财政部公布当天更新到计算器中，每页顶部的日期告诉您数字最后读取的时间。</p>` },
  ],
};

export const HOME: { en: HomeText; zh: HomeText; sources: string[] } = { en: EN, zh: ZH, sources: ['dgs-coe', 'dgs-pqp', 'lta-coe', 'lta-tax', 'lta-arf', 'lta-ves', 'lta-rebate', 'lta-parf-2026', 'lta-roadtax', 'lta-renewal', 'mas-loans', 'iras-gst', 'sodl'] };
