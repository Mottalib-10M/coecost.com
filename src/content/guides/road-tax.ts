/** « road tax singapore » / « road tax calculator » : formules par cylindrée et puissance, surtaxe d'âge, hybrides. */
import { defineGuide } from '../../lib/page-types';
import { money, day, num, pct, PARAMS_READ } from '../../lib/data';
import { P, roadTaxAnnual, roadTaxSixMonthly } from '../../lib/engine/car-cost';

const en = (x: number, d = 2) => money(x, 'en', d), zh = (x: number, d = 2) => money(x, 'zh', d);
const CCS = [996, 1197, 1496, 1598, 1798, 1998, 2494, 2998, 3500];
const rt = (cc: number, age = 0) => roadTaxAnnual({ fuel: 'petrol', cc, age }).total;
const ccRows = (l: 'en' | 'zh') => CCS.map((cc) => [`${num(cc, l)} cc`, money(roadTaxSixMonthly('petrol', cc, 0), l, 2), money(rt(cc), l, 2), money(rt(cc, 12), l, 2)]);
const AS = [...P.roadTax.ageSurcharge].reverse();
const ageRows = (l: 'en' | 'zh') => AS.map(([over, s]) => [l === 'en' ? `More than ${over} years` : `超过${over}年`, `+${pct(s, l, 0)}`, money(rt(1598, over + 0.5), l, 2)]);
const hy = { cc: 1798, kw: 100 };
const hyIce = roadTaxSixMonthly('petrol', hy.cc, 0), hyEv = roadTaxSixMonthly('ev', 0, hy.kw), hyTot = roadTaxSixMonthly('hybrid', hy.cc, hy.kw);
const band = (i: number) => P.roadTax.ice[i];

export default defineGuide({
  id: 'road-tax', group: 'own', order: 11, tool: 'roadTax', related: ['road-tax-renewal', 'ev-road-tax', 'cost-of-owning', 'coe-renewal'], sources: ['lta-roadtax', 'lta-tax'],
  en: {
    slug: 'road-tax', nav: 'Road tax calculator', card: 'Six monthly and yearly road tax by engine',
    title: 'Road Tax Singapore 2026: Calculator by Engine cc and Age',
    description: 'Road tax in Singapore for 2026: the LTA formula by engine capacity, a table from 1,000 to 3,500 cc, the surcharge for cars over 10 years, hybrids and EVs.',
    h1: 'Road tax in Singapore: how much you pay',
    intro: `Six monthly and yearly road tax for petrol, hybrid and electric cars, from the formulas LTA publishes. Rules read on ${day(PARAMS_READ, 'en')}.`,
    resume: `Road tax on a petrol car depends on its engine capacity. A 1,496 cc car pays ${en(rt(1496))} a year, a 1,598 cc car ${en(rt(1598))}, a 1,998 cc car ${en(rt(1998))} and a 2,998 cc car ${en(rt(2998))}. The six monthly amount follows a formula in bands of engine size, multiplied by ${P.roadTax.factor}: for example ${en(band(2)[1], 0)} plus ${en(band(2)[2])} for each cc above ${num(band(2)[3], 'en')} in the band up to ${num(band(2)[0] as number, 'en')} cc. Electric cars pay on motor power instead, plus a flat component of ${en(P.roadTax.evAfcSixMonthly, 0)} every six months, and a hybrid pays the higher of its engine and power figures. A car more than ten years old pays a surcharge of ${pct(AS[0][1], 'en', 0)}, rising ten points a year to ${pct(AS[AS.length - 1][1], 'en', 0)} beyond fourteen years. Road tax is renewed every six or twelve months; the calculator gives both.`,
    faqs: [
      { q: 'How is road tax calculated in Singapore?', a: `For a petrol or diesel car, LTA applies a formula to the engine capacity: a fixed amount for each band plus a rate per cc above the start of the band, and the result is multiplied by ${P.roadTax.factor}. Electric cars use the same approach on maximum motor power in kW. The yearly figure is twice the six monthly one, before any age surcharge.` },
      { q: 'Does road tax depend on the price or the COE category?', a: 'No. Road tax ignores the price of the car, its OMV and its COE category. Two cars with the same engine capacity pay the same road tax whatever their brand. That is why a large engine in a modest car costs more to tax each year than a small turbo engine in an expensive one.' },
      { q: 'Do I get road tax back when I sell or scrap the car?', a: 'When you sell, any road tax already paid passes to the new owner with the car, so many sellers add the unused months to the asking price. When you deregister, the unused part is refunded automatically to the last registered owner. In both cases the road tax must still be valid at the time.' },
    ],
    body: (h) => `
<h2>Road tax by engine capacity</h2>
${h.table(['Engine', 'Six months', 'One year', 'One year, car aged 12'], ccRows('en'), `Petrol cars, ${PARAMS_READ.slice(0, 4)} formula. Source: LTA vehicle tax structure.`, ['l', 'r', 'r', 'r'])}
<p>The bands explain the jumps. Up to ${num(band(0)[0] as number, 'en')} cc a car pays a flat ${h.m(band(0)[1])} before the factor. Between ${num(band(0)[0] as number, 'en')} and ${num(band(1)[0] as number, 'en')} cc each extra cc costs ${h.m(band(1)[2], 3)}, then ${h.m(band(2)[2], 3)} up to ${num(band(2)[0] as number, 'en')} cc, ${h.m(band(3)[2], 2)} up to ${num(band(3)[0] as number, 'en')} cc, and ${h.m(band(4)[2], 0)} beyond. That is why a 2.5 litre car pays more than twice the tax of a 1.6 litre one, and a 3.5 litre car several times as much.</p>
<h2>The age surcharge</h2>
${h.table(['Age of the car', 'Surcharge', 'One year, 1,598 cc'], ageRows('en'), 'Surcharge on the road tax of cars older than 10 years. Source: LTA road tax page.', ['l', 'r', 'r'])}
<p>A car keeps its normal road tax for its first ten years. After that the surcharge rises by ten points a year, reaching half of the road tax again beyond fourteen years. It is one of the costs to weigh when deciding whether to ${h.a('coe-renewal', 'renew a COE')} or scrap the car.</p>
${h.mini('roadTaxRenew', { t: 'Renewing your road tax', p: ['cc', 'months'] })}
<h2>Hybrids and electric cars</h2>
<p>A petrol electric hybrid pays the higher of two calculations: one on its engine capacity, one on the power of its electric motor. For a ${num(hy.cc, 'en')} cc hybrid with a ${hy.kw} kW motor, the engine gives ${h.m(hyIce, 2)} for six months and the motor ${h.m(hyEv, 2)}, so the hybrid pays ${h.m(hyTot, 2)}. Most hybrids end up taxed on their engine, but a plug in hybrid with a large motor can be taxed on power.</p>
<p>A fully electric car pays road tax on its maximum power, with steeper rates for larger motors, plus the additional flat component of ${h.m(P.roadTax.evAfcSixMonthly)} every six months, which replaces the petrol duty an electric car does not pay at the pump. The ${h.a('ev-road-tax', 'EV road tax page')} goes through the power bands.</p>
<h2>Six months or twelve</h2>
<p>The yearly amount is exactly twice the six monthly one, so renewing for twelve months saves nothing; it only saves a renewal. GIRO renews every six months by default and can be set to yearly. Weekend and off peak cars can only renew for twelve months at a time. Since 15 February 2017 there is no road tax disc to display: the record is held by LTA, and drivers heading to Malaysia should carry a copy of the road tax validity and the insurance certificate.</p>
<h2>Road tax over the life of a car</h2>
<p>Over ten years, a 1,496 cc car pays ${h.m(rt(1496) * 10, 0)} of road tax and a 1,998 cc car ${h.m(rt(1998) * 10, 0)}. Those sums are small next to the COE and the ARF, which is why road tax rarely decides which car people buy. It starts to matter on older cars: kept to fifteen years after a COE renewal, the same 1,998 cc car would pay ${h.m(rt(1998, 14.5), 0)} in its fifteenth year alone, because of the age surcharge.</p>
<h2>Checking the exact amount</h2>
<p>OneMotoring shows the road tax due for a given registration number, or for an engine capacity and an age. The calculator above applies the same published formula and rounds to the cent, so the two should agree; if they do not, the LTA figure is the one you pay, and we would like to hear about the gap. Age counts from the original registration date.</p>
<h2>What road tax does not cover</h2>
<p>Road tax is only one of the yearly costs of a car. Insurance, which must cover the whole road tax period, parking, petrol or charging, ERP and servicing usually cost far more. The ${h.a('cost-of-owning', 'cost of owning calculator')} adds them to depreciation and road tax, and ${h.a('road-tax-renewal', 'road tax renewal')} explains the prerequisites and the late fees.</p>`,
  },
  zh: {
    slug: 'road-tax', nav: '路税计算器', card: '按引擎排量计算半年与全年路税',
    title: '路税 2026：新加坡汽车按引擎排量与车龄计算每年金额',
    description: '2026年新加坡路税：陆路交通管理局按引擎排量计算的公式、1,000 至 3,500 cc 对照表、车龄超过10年的附加费，以及混合动力车与电动车的算法。',
    h1: '新加坡路税：要付多少',
    intro: `按陆路交通管理局公布的公式，计算汽油车、混合动力车和电动车的半年及全年路税。规则读取于${day(PARAMS_READ, 'zh')}。`,
    resume: `汽油车的路税取决于引擎排量。1,496 cc 的车每年路税为 ${zh(rt(1496))}，1,598 cc 为 ${zh(rt(1598))}，1,998 cc 为 ${zh(rt(1998))}，2,998 cc 为 ${zh(rt(2998))}。半年路税按引擎排量分段的公式计算，再乘以 ${P.roadTax.factor}：例如在 ${num(band(2)[0] as number, 'zh')} cc 以下这一段，是 ${zh(band(2)[1], 0)} 加上超过 ${num(band(2)[3], 'zh')} cc 的部分每 cc ${zh(band(2)[2])}。电动车改按电机功率计算，并每六个月加收 ${zh(P.roadTax.evAfcSixMonthly, 0)} 的附加固定费用；混合动力车按引擎和功率各算一次，取较高者。车龄超过十年的车须加付 ${pct(AS[0][1], 'zh', 0)} 的附加费，每年增加十个百分点，超过十四年为 ${pct(AS[AS.length - 1][1], 'zh', 0)}。路税每六个月或十二个月续缴一次，计算器同时给出两种金额。输入排量、车龄或电机功率，即可得到您的车要缴的路税。`,
    faqs: [
      { q: '新加坡的路税是怎样计算的？', a: `对汽油车或柴油车，陆路交通管理局按引擎排量套用公式：每一段有固定金额，再加上超出该段起点的部分每 cc 的费率，结果乘以 ${P.roadTax.factor}。电动车用同样的方法，按电机最大功率（kW）计算。全年金额是半年金额的两倍，未计车龄附加费。计算器按同一公式计算，精确到分。` },
      { q: '路税和车价或拥车证类别有关吗？', a: '无关。路税不看车价、公开市场价值或拥车证类别。引擎排量相同的两辆车，不论品牌和价格，路税都一样。所以一辆普通的车配上大排量引擎，每年的路税会比一辆配小排量涡轮引擎的昂贵车更高，买车时值得把这一项也算进去。电动车则按电机功率计算，与车价同样无关。' },
      { q: '卖车或报废时，路税可以退回吗？', a: '卖车时，已缴的路税会随车转给新车主，所以很多卖家会把未用的月份计入售价。注销车辆时，未用部分会自动退还给最后登记的车主。两种情况下，当时的路税都必须仍然有效；如果已经过期，要先续缴才能办理过户或注销。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
    ],
    body: (h) => `
<h2>按引擎排量的路税</h2>
${h.table(['引擎', '半年', '一年', '一年（车龄12年）'], ccRows('zh'), `汽油车，${PARAMS_READ.slice(0, 4)}年公式。来源：陆路交通管理局车辆税务结构。`, ['l', 'r', 'r', 'r'])}
<p>分段说明了路税为什么会跳升。${num(band(0)[0] as number, 'zh')} cc 以下，乘以系数前固定为 ${h.m(band(0)[1])}。${num(band(0)[0] as number, 'zh')} 至 ${num(band(1)[0] as number, 'zh')} cc 之间，每多一 cc 加 ${h.m(band(1)[2], 3)}；到 ${num(band(2)[0] as number, 'zh')} cc 为 ${h.m(band(2)[2], 3)}，到 ${num(band(3)[0] as number, 'zh')} cc 为 ${h.m(band(3)[2], 2)}，超过后为 ${h.m(band(4)[2], 0)}。所以2.5升车的路税是1.6升车的两倍以上，3.5升车更是好几倍。</p>
<h2>车龄附加费</h2>
${h.table(['车龄', '附加费', '一年（1,598 cc）'], ageRows('zh'), '车龄超过10年的汽车路税附加费。来源：陆路交通管理局路税页面。', ['l', 'r', 'r'])}
<p>汽车在头十年缴付正常路税。之后附加费每年增加十个百分点，超过十四年时，等于再多付一半路税。在决定${h.a('coe-renewal', '续期拥车证')}还是报废时，这是需要考虑的成本之一。</p>
${h.mini('roadTaxRenew', { t: '续缴您的路税', p: ['cc', 'months'] })}
<h2>混合动力车与电动车</h2>
<p>油电混合动力车按两种方法计算，取较高者：一种按引擎排量，一种按电动机功率。一辆 ${num(hy.cc, 'zh')} cc、电机 ${hy.kw} kW 的混合动力车，按引擎计算半年为 ${h.m(hyIce, 2)}，按电机计算为 ${h.m(hyEv, 2)}，所以要缴 ${h.m(hyTot, 2)}。大多数混合动力车按引擎计税，但电机较大的插电式混合动力车可能按功率计税。</p>
<p>纯电动车按最大功率缴路税，电机越大费率越高，另外每六个月加收 ${h.m(P.roadTax.evAfcSixMonthly)} 的附加固定费用，用来代替电动车不必在油站缴付的汽油税。功率分段的详情见${h.a('ev-road-tax', '电动车路税页面（英文）')}，本页顶部的计算器也可以直接选择纯电来计算。</p>
<h2>半年还是一年</h2>
<p>全年路税正好是半年的两倍，所以一次缴十二个月并不会更便宜，只是少办一次手续。GIRO 默认每六个月续缴一次，也可以改为每年一次。周末用车和非高峰时段用车只能一次续缴十二个月。自2017年2月15日起，车上不再需要展示路税标签，记录由陆路交通管理局保存；开车去马来西亚的人，应随车携带路税有效证明和保险证书的副本。</p>
<h2>一辆车一生要缴多少路税</h2>
<p>十年下来，1,496 cc 的车共缴 ${h.m(rt(1496) * 10, 0)} 路税，1,998 cc 的车共缴 ${h.m(rt(1998) * 10, 0)}。与拥车证和附加注册费相比，这些金额并不大，所以路税很少左右买哪一款车。但对旧车来说就不同了：同一辆 1,998 cc 的车如果在续期后用到第十五年，单是第十五年的路税就要 ${h.m(rt(1998, 14.5), 0)}，因为有车龄附加费。</p>
<h2>核对确切金额</h2>
<p>OneMotoring 可以按车牌号码，或按引擎排量和车龄，显示应缴的路税。页面顶部的计算器套用同一条公布的公式，并精确到分，所以两者应该一致；如果不一致，以陆路交通管理局的数字为准，也欢迎告诉我们差异所在。车龄从原始注册日期起算，可在 OneMotoring 的车辆资料中查到。</p>
<h2>路税没有包括什么</h2>
<p>路税只是养车的年度费用之一。保险（必须涵盖整个路税期间）、停车、油费或充电费、电子道路收费和保养，通常都比路税高得多。${h.a('cost-of-owning', '拥车成本计算器')}会把这些费用与折旧和路税加在一起，${h.a('road-tax-renewal', '路税续缴')}一页则说明续缴前的条件和逾期费用。</p>`,
  },
});
