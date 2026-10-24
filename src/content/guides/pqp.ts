/** « pqp » / « prevailing quota premium » : la règle, notre calcul du mois suivant, la série officielle. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, PQP_NEXT, PQP_OFFICIAL, PQP_OFFICIAL_LAST, PQP_NEXT_IS_COMPUTED, pqpSeries, premium, exName, money, day, FETCHED, signed, monthYear, EXERCISES } from '../../lib/data';
import { renewalCost } from '../../lib/engine/car-cost';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const K = ['A', 'B', 'C', 'D'] as const;
const series = pqpSeries(12);
const rows = (l: 'en' | 'zh') => series.map((r) => [monthYear(r.month, l), ...K.map((c) => money(r[c], l))]);
const based = (l: 'en' | 'zh') => PQP_NEXT.basedOn.map((m) => monthYear(m, l)).join(l === 'en' ? ', ' : '、');
const exIn = PQP_NEXT.basedOn.reduce((n, m) => n + EXERCISES.filter((e) => e.month === m).length, 0);
const gapA = PQP_NEXT.A - premium(LATEST, 'A');
const label = (l: 'en' | 'zh') => (PQP_NEXT_IS_COMPUTED ? (l === 'en' ? 'our calculation, pending the official figure' : '本站计算，官方数字尚未公布') : (l === 'en' ? 'official' : '官方'));

export default defineGuide({
  id: 'pqp', group: 'coe', order: 6, tool: 'pqp', related: ['coe-renewal', 'coe-results', 'parf-rebate', 'coe-cat-a'], sources: ['lta-renewal', 'dgs-pqp', 'dgs-coe', 'sodl'],
  en: {
    slug: 'pqp', nav: 'PQP (prevailing quota premium)', card: 'The price of renewing a COE, month by month',
    title: `PQP ${monthYear(PQP_NEXT.appliesTo, 'en')}: Prevailing Quota Premium by Category`,
    description: `PQP for COE renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')}, Categories A to D, how LTA computes the three month average, the last 12 months and the cost of a 5 or 10 year renewal.`,
    h1: 'PQP: the prevailing quota premium',
    intro: `The price of renewing a COE, recalculated every month. Figures for ${monthYear(PQP_NEXT.appliesTo, 'en')} are ${label('en')}; data read on ${day(FETCHED, 'en')}.`,
    resume: `For COE renewals in ${monthYear(PQP_NEXT.appliesTo, 'en')}, the prevailing quota premium works out at ${en(PQP_NEXT.A)} for Category A, ${en(PQP_NEXT.B)} for Category B, ${en(PQP_NEXT.C)} for Category C and ${en(PQP_NEXT.D)} for Category D. These are ${label('en')}: the moving average of the quota premiums of ${based('en')}, the ${exIn} exercises of the last three months, rounded up to the dollar, which is the rule LTA applies. Recomputed this way, the open data reproduces every official monthly PQP since 2002. The Category A figure is ${signed(PQP_NEXT.A - PQP_OFFICIAL.A, 'en')} against the official PQP for ${monthYear(PQP_OFFICIAL_LAST, 'en')}. Renewing for ten years costs the full PQP, ${en(renewalCost(PQP_NEXT.A, 10))} in Category A; renewing for five years costs half, rounded up, ${en(renewalCost(PQP_NEXT.A, 5))}. Because it averages three months, the PQP trails the latest result by ${en(Math.abs(gapA))} in Category A.`,
    faqs: [
      { q: 'How is the PQP calculated?', a: 'LTA takes the quota premiums of the bidding exercises held in the three months before the month of renewal, averages them and rounds the result up to the next dollar. With two exercises a month that is usually six results. Each category has its own PQP, and the same figure applies to every renewal in that category during the month.' },
      { q: 'Which PQP applies if my COE expires mid month?', a: 'Renew in the month the COE expires and you pay that month’s PQP, with no days lost. You may also renew a month early at the previous month’s PQP: the new period then starts on the first day of the following month and the days left on the old certificate are forfeited. Renewing after expiry costs the PQP of the expiry month plus a late fee.' },
      { q: 'What PQP does a car registered with a Category E COE pay?', a: 'A vehicle registered with an open Category E certificate renews under the category that matches the vehicle itself: Category A or B for a car, Category C for a goods vehicle or bus. There is no Category E PQP. Weekend and off peak cars renew at the same PQP as normal cars of their category and keep their status.' },
      { q: 'Why does this page show a calculated PQP?', a: `LTA announces each month’s PQP once the second exercise of the month before has closed, and the open data series catches up later. Until it does, this page shows the figure recomputed from the results of ${based('en')} with LTA’s rule. The test suite checks that this method gives the official figure for every past month.` },
    ],
    body: (h) => `
<h2>PQP for each renewal month, last 12 months</h2>
${h.table(['Renewal month', 'Cat A', 'Cat B', 'Cat C', 'Cat D'], rows('en'), `Official PQP series. ${monthYear(PQP_NEXT.appliesTo, 'en')} (${label('en')}): ${K.map((c) => `${c} ${h.m(PQP_NEXT[c])}`).join(', ')}. Source: LTA via data.gov.sg (Singapore Open Data Licence 1.0).`, ['l', 'r', 'r', 'r', 'r'])}
<p>Each line is the PQP that applied to renewals during that month. The open data set dates each figure by the last month of results it uses; this page shifts it to the month of renewal, which is how LTA quotes it on OneMotoring and how owners read it. The two descriptions point to the same number.</p>
<h2>A three month average, rounded up</h2>
<p>The prevailing quota premium is the price of keeping a vehicle on the road beyond its first ten years without bidding again. Rather than tying renewals to a single exercise, LTA uses the average of the quota premiums of the last three months of bidding, rounded up to the dollar. That smooths the swings between exercises: in a period when premiums rise, the PQP stays below the latest results, and in a falling market it stays above them. Today the Category A PQP is ${h.m(PQP_NEXT.A)} against a latest result of ${h.m(premium(LATEST, 'A'))}.</p>
<p>The figure for ${monthYear(PQP_NEXT.appliesTo, 'en')} uses the results of ${based('en')}. Next month, the oldest of those three months drops out and the newest exercises come in, so you can see the direction of the next PQP by comparing the month that leaves with the exercises held since. The ${h.a('coe-results', 'COE results page')} lists them.</p>
${h.mini('renew', { t: 'What renewing would cost you', p: ['cat', 'years'] })}
<h2>Five years or ten</h2>
<p>An owner can renew for ten years by paying the full PQP, or for five years by paying half of it, rounded up. A ten year renewal can be followed by further renewals; a five year renewal of a car or motorcycle cannot be renewed again, and the vehicle must be deregistered at the end of it. Neither option brings back a PARF rebate: once the COE is renewed, the PARF entitlement is gone for good, which is why the ${h.a('coe-renewal', 'renewal calculator')} counts it as part of the cost.</p>
<p>Spread over the period, a ten year renewal of a Category A car costs ${h.m(renewalCost(PQP_NEXT.A, 10) / 10)} a year and a five year renewal ${h.m(renewalCost(PQP_NEXT.A, 5) / 5)} a year at the current PQP. The yearly cost is the same; the difference lies in what you can do at the end and in how much you commit now.</p>
<h2>Renewing early, on time or late</h2>
<p>Each month’s PQP is known once the second exercise of the month before has closed. An owner whose COE expires in a given month has two ways to renew on time. Renewing in the expiry month uses that month’s PQP, and the new period starts the day after the old certificate ends. Renewing a month earlier uses the previous month’s PQP, which can be worth it in a rising market, but the new period then starts on the first day of the following month and the days left on the old certificate are lost. Renewing after expiry is possible for one month, at the PQP of the expiry month plus a late fee.</p>
<h2>Months without bidding</h2>
<p>The average only counts months in which exercises were held. When bidding was suspended in April, May and June 2020, LTA based the PQP of May, June and July 2020 on the results of January, February and March 2020. The calculation used on this page follows the same rule, which is one of the reasons it matches the official series month for month.</p>
<h2>Where the figures come from</h2>
<p>The official monthly series is LTA’s data set on ${h.src('dgs-pqp', 'data.gov.sg')}, and the exercise results used for our calculation come from the ${h.src('dgs-coe', 'COE bidding results')} data set, both under the ${h.src('sodl', 'Singapore Open Data Licence')}. The renewal rules are on LTA’s ${h.src('lta-renewal', 'COE renewal page')}. When the official figure for ${monthYear(PQP_NEXT.appliesTo, 'en')} appears in the open data, the update script compares it with our calculation and stops if they differ, so a wrong figure cannot reach this page silently.</p>`,
  },
  zh: {
    slug: 'pqp', nav: 'PQP（预定市场价格）', card: '每月拥车证续期价格',
    title: `${monthYear(PQP_NEXT.appliesTo, 'zh')} PQP：各类别预定市场价格与续期费用`,
    description: `${monthYear(PQP_NEXT.appliesTo, 'zh')}拥车证续期的 PQP（A至D类）、陆路交通管理局如何计算三个月平均值、最近12个月的官方数字，以及续期五年或十年各要付多少钱。`,
    h1: 'PQP：预定市场价格',
    intro: `拥车证续期的价格，每月重新计算。${monthYear(PQP_NEXT.appliesTo, 'zh')}的数字为${label('zh')}；数据读取于${day(FETCHED, 'zh')}。`,
    resume: `${monthYear(PQP_NEXT.appliesTo, 'zh')}拥车证续期的预定市场价格为：A类 ${zh(PQP_NEXT.A)}，B类 ${zh(PQP_NEXT.B)}，C类 ${zh(PQP_NEXT.C)}，D类 ${zh(PQP_NEXT.D)}。这些数字是${label('zh')}：取${based('zh')}共 ${exIn} 轮竞标的配额价格，求移动平均，再向上取整到元，这正是陆路交通管理局采用的规则。用这个方法重算开放数据，自2002年以来每个月的官方 PQP 都分毫不差。A类数字比${monthYear(PQP_OFFICIAL_LAST, 'zh')}的官方 PQP 变动 ${signed(PQP_NEXT.A - PQP_OFFICIAL.A, 'zh')}。续期十年支付 PQP 全额，A类为 ${zh(renewalCost(PQP_NEXT.A, 10))}；续期五年支付一半并向上取整，为 ${zh(renewalCost(PQP_NEXT.A, 5))}。由于是三个月的平均值，A类 PQP 与最新结果相差 ${zh(Math.abs(gapA))}，在价格上升时偏低，在价格下跌时偏高。`,
    faqs: [
      { q: 'PQP 是怎样计算的？', a: '陆路交通管理局取续期月份之前三个月内各轮竞标的配额价格，求平均值，再向上取整到元。每月两轮竞标，通常就是六个结果。每个类别有自己的 PQP，同一个月内该类别的所有续期都适用同一个数字，不论车辆的品牌、车龄或当初所付的拥车证价格。没有竞标的月份不计算在内。' },
      { q: '拥车证在月中到期，适用哪个月的 PQP？', a: '在拥车证到期的那个月续期，就付当月的 PQP，一天也不浪费。也可以提早一个月、按上个月的 PQP 续期：新期限从下个月第一天开始，旧拥车证剩下的几天就会作废。到期后才续期，要付到期月份的 PQP 再加逾期费，而且只能在到期后一个月内办理。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
      { q: '用E类拥车证注册的车，续期时付哪个 PQP？', a: '用开放的E类拥车证注册的车辆，续期时按车辆本身所属的类别计算：汽车按A类或B类，货车或巴士按C类。没有E类 PQP。周末用车和非高峰时段用车，按同类普通汽车的 PQP 续期，续期后仍保留原来的身份和相关优惠。续期费用因此可能比当初的E类价格低一些。' },
      { q: '为什么本页显示的是计算出来的 PQP？', a: `陆路交通管理局在上个月第二轮竞标结束后公布当月的 PQP，开放数据序列则较晚更新。在更新之前，本页显示的是按当局规则、用${based('zh')}的结果重算的数字。本站的测试会核对，这个方法对过去每个月都能得出官方数字，如有不同，更新程序会停止。` },
    ],
    body: (h) => `
<h2>最近12个续期月份的 PQP</h2>
${h.table(['续期月份', 'A类', 'B类', 'C类', 'D类'], rows('zh'), `官方 PQP 序列。${monthYear(PQP_NEXT.appliesTo, 'zh')}（${label('zh')}）：${K.map((c) => `${c}类 ${h.m(PQP_NEXT[c])}`).join('，')}。来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证 1.0 版）。`, ['l', 'r', 'r', 'r', 'r'])}
<p>每一行是该月续期适用的 PQP。开放数据集以所用结果的最后一个月来标记每个数字；本页把它换成续期月份，这也是陆路交通管理局在 OneMotoring 上的写法和车主的理解方式。两种标记指的是同一个数字。</p>
<h2>三个月平均，向上取整</h2>
<p>预定市场价格是车辆在头十年之后继续上路、而不必重新投标的价格。陆路交通管理局没有把续期与某一轮挂钩，而是取最近三个月竞标配额价格的平均值，向上取整到元。这样可以平滑每轮之间的波动：价格上升时，PQP 低于最新结果；价格下跌时，PQP 高于最新结果。目前A类 PQP 为 ${h.m(PQP_NEXT.A)}，最新结果为 ${h.m(premium(LATEST, 'A'))}。</p>
<p>${monthYear(PQP_NEXT.appliesTo, 'zh')}的数字采用${based('zh')}的结果。下个月，三个月中最早的那个月会被移出，最新的几轮会加入，所以把移出的月份与之后举行的几轮比较，就能看出下一个 PQP 的方向。${h.a('coe-results', '拥车证结果')}页面列出了这些轮次。</p>
${h.mini('renew', { t: '续期要花多少钱', p: ['cat', 'years'] })}
<h2>五年还是十年</h2>
<p>车主可以支付 PQP 全额续期十年，或支付一半（向上取整）续期五年。续期十年之后还可以再续；汽车或摩托车续期五年后不能再续，期满时必须注销。两种做法都拿不回 PARF 回扣：拥车证一旦续期，PARF 资格就永久失去，所以${h.a('coe-renewal', '续期计算器')}把它算作成本的一部分。</p>
<p>按目前的 PQP 分摊，A类车续期十年每年 ${h.m(renewalCost(PQP_NEXT.A, 10) / 10)}，续期五年每年 ${h.m(renewalCost(PQP_NEXT.A, 5) / 5)}。每年成本相同，差别在于期满时还能做什么，以及现在要投入多少钱。</p>
<h2>提早、准时或逾期续期</h2>
<p>每个月的 PQP 在上个月第二轮竞标结束后就已确定。拥车证在某个月到期的车主，有两种准时续期的方法。在到期月份续期，按当月的 PQP 计算，新期限从旧拥车证结束的次日开始。提早一个月续期，按上个月的 PQP 计算，在价格上升时可能比较划算，但新期限要从下个月第一天开始，旧拥车证剩下的天数就会作废。到期后续期也可以，但只限一个月内，要付到期月份的 PQP 再加逾期费。</p>
<h2>没有竞标的月份</h2>
<p>平均值只计算有举行竞标的月份。2020年4月、5月和6月暂停竞标时，陆路交通管理局以2020年1月、2月和3月的结果，计算2020年5月、6月和7月的 PQP。本页所用的计算遵循同一规则，这也是它能与官方序列逐月吻合的原因之一。</p>
<h2>数字的来源</h2>
<p>官方月度序列来自陆路交通管理局在 ${h.src('dgs-pqp', 'data.gov.sg')} 发布的数据集，本站计算所用的竞标结果来自${h.src('dgs-coe', '拥车证竞标结果')}数据集，两者都依据${h.src('sodl', '新加坡开放数据许可证')}使用。续期规则见陆路交通管理局的${h.src('lta-renewal', '拥车证续期页面')}。当${monthYear(PQP_NEXT.appliesTo, 'zh')}的官方数字出现在开放数据中时，更新程序会把它与本站的计算比较，一旦不同就会停止，所以错误的数字不会悄悄出现在本页上。</p>`,
  },
});
