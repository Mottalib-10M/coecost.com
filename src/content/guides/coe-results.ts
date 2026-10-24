/** « coe results » (10 k – 100 k) : résultats du dernier exercice et de chacun des 48 précédents. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, PREVIOUS, CATS, premium, change, stats, lastN, bidRatio, exName, money, day, FETCHED, NEXT_EX, catName, catShort, monthYear, signed, num, EXERCISES, FIRST } from '../../lib/data';

const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const A = premium(LATEST, 'A'), B = premium(LATEST, 'B'), E = premium(LATEST, 'E');
const ups = CATS.filter((c) => change(c) > 0), downs = CATS.filter((c) => change(c) < 0);
const s12 = stats('A', 12);
const hiRatio = CATS.reduce((a, c) => (bidRatio(LATEST, c) > bidRatio(LATEST, a) ? c : a), 'A' as (typeof CATS)[number]);
const nextEn = NEXT_EX ? `The next exercise runs from ${day(NEXT_EX.start, 'en')} to ${day(NEXT_EX.end, 'en')}.` : '';
const nextZh = NEXT_EX ? `下一轮竞标于${day(NEXT_EX.start, 'zh')}至${day(NEXT_EX.end, 'zh')}举行。` : '';
const listEn = (cs: string[]) => cs.map((c) => `Category ${c}`).join(', ');
const listZh = (cs: string[]) => cs.map((c) => `${c}类`).join('、');
const rowsEn = lastN(6).map((e) => [exName(e, 'en', true), ...CATS.map((c) => money(premium(e, c), 'en'))]);
const rowsZh = lastN(6).map((e) => [exName(e, 'zh', true), ...CATS.map((c) => money(premium(e, c), 'zh'))]);

export default defineGuide({
  id: 'coe-results', group: 'coe', order: 1, tool: 'results', related: ['coe-bidding', 'coe-cat-a', 'coe-cat-b', 'pqp'], sources: ['dgs-coe', 'lta-coe', 'lta-schedule', 'sodl'],
  en: {
    slug: 'coe-results', nav: 'COE results', card: 'Premium, quota and bids of every exercise',
    title: `COE Results ${monthYear(LATEST.month, 'en')}: Premiums of All Five Categories`,
    description: `COE results of the ${exName(LATEST, 'en')}: premium, quota and bids for Categories A to E, change on the exercise before and every result since 2010.`,
    h1: 'COE results of every bidding exercise',
    intro: `Premium, quota and bids for each category, from the latest exercise back to ${monthYear(FIRST.month, 'en')}. Read from LTA open data on ${day(FETCHED, 'en')}.`,
    resume: `The ${exName(LATEST, 'en')} closed with a premium of ${en(A)} in Category A, ${en(B)} in Category B, ${en(premium(LATEST, 'C'))} in Category C, ${en(premium(LATEST, 'D'))} in Category D and ${en(E)} in the open Category E. ${ups.length ? `${listEn(ups)} rose against the ${exName(PREVIOUS, 'en')}` : 'No category rose'}${downs.length ? `, while ${listEn(downs)} fell` : ''}. Category A moved by ${signed(change('A'), 'en')} and Category B by ${signed(change('B'), 'en')}. Over the last six months of bidding, Category A stayed between ${en(s12.min)} and ${en(s12.max)}. The premium is the lowest successful bid: every successful bidder in the category pays it, whatever they bid. Competition was strongest in Category ${hiRatio}, with ${num(bidRatio(LATEST, hiRatio), 'en', 2)} bids for each certificate on offer. Pick any of the last 48 exercises in the calculator to see its five results side by side. ${nextEn}`,
    faqs: [
      { q: 'Where do these COE results come from?', a: `From the Land Transport Authority’s data set of COE bidding results on data.gov.sg, published under the Singapore Open Data Licence. A script reads it after each exercise and writes it into the site. The current file holds ${EXERCISES.length} exercises, the latest being the ${exName(LATEST, 'en')}, and was read on ${day(FETCHED, 'en')}.` },
      { q: 'What does "quota premium" mean in the results?', a: 'It is the price of a certificate in that exercise: the lowest bid that still won one. All successful bidders pay it, so a person who bid far above the result pays the same as one who bid just enough. Unsuccessful bidders get their deposit back.' },
      { q: 'Why do some exercises leave certificates unallocated?', a: 'When the number of bids is close to the quota, a few certificates can remain because bids tied at the cut off price would exceed the quota, or because some bids were withdrawn. The unallocated certificates are added to a later exercise. The difference between quota and successful bids shows how many.' },
      { q: 'At what time are COE results released?', a: 'Bidding closes at 4 pm on the Wednesday of the exercise week. LTA publishes the results after the close, on OneMotoring and then in its open data. This page and every calculator on the site update once the open data set carries the new exercise, and the date at the top changes with them.' },
    ],
    body: (h) => `
<h2>Results of the last six exercises</h2>
${h.table(['Exercise', ...CATS.map((c) => catShort(c, 'en'))], rowsEn, 'Quota premium by category. Source: LTA via data.gov.sg (Singapore Open Data Licence 1.0).', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Each line is one exercise; each column a category. Category A is for smaller cars, B for larger and more powerful ones, C for goods vehicles and buses, D for motorcycles and E is the open category whose certificate can register any vehicle except a motorcycle. ${h.a('coe-cat-a', 'Category A')} and ${h.a('coe-cat-b', 'Category B')} have pages of their own with longer series.</p>
<h2>How to read one exercise</h2>
<p>For every category LTA publishes four numbers. The quota is how many certificates were offered. The bids received count every valid bid placed during the three days of the exercise. Successful bids are those that won a certificate, usually equal to the quota or a few below it. The quota premium is the price everybody who won pays. A ratio of bids to quota above one means that some bidders went home without a certificate; the higher that ratio, the more the premium had to rise to separate them.</p>
<p>In the ${exName(LATEST, 'en')} Category A had ${h.n(LATEST.cats.A.quota)} certificates for ${h.n(LATEST.cats.A.bids)} bids, Category B ${h.n(LATEST.cats.B.quota)} for ${h.n(LATEST.cats.B.bids)}, and Category E ${h.n(LATEST.cats.E.quota)} for ${h.n(LATEST.cats.E.bids)}. The calculator at the top shows the same figures for any of the last 48 exercises, with the change on the exercise before.</p>
${h.mini('bid', { t: 'Would your reserve price have cleared?', p: ['cat', 'reserve'] })}
<h2>Why results move from one exercise to the next</h2>
<p>The quota is fixed in advance for a quarter, based on how many vehicles were deregistered in the months before. When many ten year old cars are scrapped, more certificates come back into the pool some time later and the quota rises. Demand moves faster: a new model launch, a change in loan rules or in the tax schedule, a rush before a rebate ends, all bring more bidders into one exercise. Dealers bid on behalf of most buyers, so their order books matter more than individual decisions.</p>
<p>The open Category E tends to follow Category B closely, because dealers can use an E certificate for a large car and switch between the two when one is cheaper. Category C moves with business demand for vans and lorries, and Category D, for motorcycles, has its own small market of a few hundred certificates per exercise.</p>
<h2>What a result does not tell you</h2>
<p>A result is the price of one certificate in one exercise. It says nothing certain about the next exercise, and this site does not forecast one. It is not the price of a car either: the COE comes on top of the open market value, excise duty, GST, the additional registration fee and the registration fee. The ${h.a('home', 'car cost calculator')} adds them all. And for owners renewing an old certificate, the relevant figure is the prevailing quota premium, a three month average described on the ${h.a('pqp', 'PQP page')}.</p>
<p>Results also do not show who won. Bids are anonymous, and a large share are placed by dealers for cars they have already sold. The bids received figure counts bids, not people: an individual may place only one bid per exercise, while a company or motor trader may place several.</p>
<h2>The data behind this page</h2>
<p>All figures come from LTA’s COE bidding results data set on ${h.src('dgs-coe', 'data.gov.sg')}, which covers every exercise since ${monthYear(FIRST.month, 'en')}. The site reads it after each exercise and checks it against the prevailing quota premium series, which LTA computes from the same results. When a number here differs from what you see on OneMotoring, OneMotoring is right; please tell us through the contact page. The bidding calendar for the rest of the year is on LTA’s ${h.src('lta-schedule', 'schedule of exercises')}.</p>`,
  },
  zh: {
    slug: 'coe-results', nav: '拥车证结果', card: '每一轮的价格、配额与投标数',
    title: `拥车证结果 ${monthYear(LATEST.month, 'zh')}：A至E类最新价格与历史`,
    description: `${exName(LATEST, 'zh')}拥车证结果：A至E类的价格、配额与投标数，与上一轮相比的变化，以及2010年以来每一轮的结果，读取自 data.gov.sg。`,
    h1: '每一轮拥车证竞标结果',
    intro: `各类别的价格、配额与投标数，从最新一轮一直到${monthYear(FIRST.month, 'zh')}。于${day(FETCHED, 'zh')}从陆路交通管理局开放数据读取。`,
    resume: `${exName(LATEST, 'zh')}竞标结束，A类价格为 ${zh(A)}，B类 ${zh(B)}，C类 ${zh(premium(LATEST, 'C'))}，D类 ${zh(premium(LATEST, 'D'))}，开放的E类 ${zh(E)}。与${exName(PREVIOUS, 'zh')}相比，${ups.length ? `${listZh(ups)}上涨` : '没有类别上涨'}${downs.length ? `，${listZh(downs)}下跌` : ''}；A类变动 ${signed(change('A'), 'zh')}，B类变动 ${signed(change('B'), 'zh')}。在最近六个月的竞标中，A类价格介于 ${zh(s12.min)} 至 ${zh(s12.max)} 之间。配额价格就是最低的成功出价：同一类别的所有成功投标者都按这个价格付款，与各自出价多少无关。这一轮竞争最激烈的是${hiRatio}类，每张拥车证有 ${num(bidRatio(LATEST, hiRatio), 'zh', 2)} 份投标。在计算器中选择最近48轮中的任何一轮，即可并排查看五个类别的结果，以及与前一轮相比的升跌。${nextZh}`,
    faqs: [
      { q: '这些拥车证结果从哪里来？', a: `来自陆路交通管理局在 data.gov.sg 发布的拥车证竞标结果数据集，依据新加坡开放数据许可证使用。程序在每轮竞标后读取数据并写入本站。目前的文件共有 ${EXERCISES.length} 轮，最新一轮是${exName(LATEST, 'zh')}，读取于${day(FETCHED, 'zh')}。如有疑问，以陆路交通管理局 OneMotoring 上的数字为准。` },
      { q: '结果中的“配额价格”是什么意思？', a: '它是这一轮一张拥车证的价格，也就是仍能中标的最低出价。所有成功投标者都支付这个价格，所以出价远高于结果的人，和出价刚好够的人付的钱一样。没有中标的投标者可以全数取回押金，这次投标也不会影响下一轮能否参加或出价多少。这也是结果表中唯一的价格栏位，代表该类别本轮的成交价。' },
      { q: '为什么有些轮次会剩下拥车证？', a: '当投标数量接近配额时，可能因为在截止价格上同价的投标加起来超过配额，或部分投标被撤回，而剩下几张拥车证。剩下的拥车证会加入之后的轮次。配额与成功投标数之间的差额，就是剩下的数量，在结果表中可以直接看到。剩下的数量通常很少，对价格的影响不大。' },
      { q: '拥车证结果几点公布？', a: '竞标在竞标周的星期三下午4时截止。陆路交通管理局在截止后公布结果，先在 OneMotoring 上，然后在开放数据中。开放数据集收录新一轮结果后，本页和所有计算器就会自动更新，页面顶部的读取日期也会随之改变。如果竞标周遇上公共假期，截止日期会顺延。' },
    ],
    body: (h) => `
<h2>最近六轮的结果</h2>
${h.table(['轮次', ...CATS.map((c) => catShort(c, 'zh'))], rowsZh, '各类别配额价格。来源：陆路交通管理局，经 data.gov.sg（新加坡开放数据许可证 1.0 版）。', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>每一行是一轮竞标，每一列是一个类别。A类为较小的汽车，B类为较大、功率较高的汽车，C类为货车和巴士，D类为摩托车，E类为开放类，其拥车证可用于摩托车以外的任何车辆。${h.a('coe-cat-a', 'A类')}和${h.a('coe-cat-b', 'B类')}各有专页，列出更长的序列和每年的变化。</p>
<h2>怎样看一轮结果</h2>
<p>陆路交通管理局为每个类别公布四个数字。配额是本轮提供的拥车证数量。收到的投标数是三天竞标期间所有有效投标的总数。成功投标数是中标的数量，通常等于配额或略少。配额价格是所有中标者支付的价格。投标数与配额之比大于一，代表有人空手而归；比值越高，价格就要升得越高才能把投标者分开。</p>
<p>${exName(LATEST, 'zh')}，A类有 ${h.n(LATEST.cats.A.quota)} 张拥车证、${h.n(LATEST.cats.A.bids)} 份投标；B类有 ${h.n(LATEST.cats.B.quota)} 张、${h.n(LATEST.cats.B.bids)} 份；E类有 ${h.n(LATEST.cats.E.quota)} 张、${h.n(LATEST.cats.E.bids)} 份。页面顶部的计算器可以显示最近48轮中任何一轮的这些数字，以及与上一轮相比的变化。</p>
${h.mini('bid', { t: '您的保留价过去能否中标？', p: ['cat', 'reserve'] })}
<h2>为什么结果每轮都在变</h2>
<p>配额按季度预先确定，依据的是之前几个月注销的车辆数量。当大批车龄十年的车辆报废时，一段时间后会有更多拥车证回到配额中，配额随之增加。需求的变化更快：新车款上市、贷款或税务规则调整、回扣结束前的抢购，都会让某一轮的投标者增多。大多数买家由车行代为投标，所以车行的订单比个人的决定影响更大。</p>
<p>开放的E类通常紧跟B类，因为车行可以用E类拥车证注册大型车，哪一类便宜就用哪一类。C类随企业对货车的需求变化，摩托车的D类则是每轮只有几百张拥车证的独立小市场，价格水平与汽车完全不同。</p>
<h2>结果不能告诉您什么</h2>
<p>一个结果只是某一轮一张拥车证的价格，不能确定下一轮会怎样，本站也不作预测。它也不是车价：拥车证之外，还有公开市场价值、消费税、商品及服务税、附加注册费和注册费。${h.a('home', '买车成本计算器')}会把它们全部加起来。至于为旧车续期的车主，需要看的是预定市场价格，即三个月的平均值，详见 ${h.a('pqp', 'PQP 页面')}。</p>
<p>结果也不会显示谁中标。投标是匿名的，很大一部分由车行为已售出的车辆提交。投标数统计的是投标份数，不是人数：个人每一轮只能投一次标，公司和车行则可以投多份，竞标截止前只能调高保留价，不能撤回。</p>
<h2>本页的数据</h2>
<p>所有数字来自陆路交通管理局在 ${h.src('dgs-coe', 'data.gov.sg')} 发布的拥车证竞标结果数据集，涵盖自${monthYear(FIRST.month, 'zh')}以来的每一轮。本站在每轮竞标后读取数据，并与陆路交通管理局用同一批结果计算的预定市场价格序列核对。如本站数字与 OneMotoring 不同，以 OneMotoring 为准，并请通过联系页面告诉我们。今年余下的竞标日期见陆路交通管理局的${h.src('lta-schedule', '竞标时间表')}。</p>`,
  },
});
