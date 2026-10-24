/** « coe bidding » (10 k – 100 k) : comment se forme la prime, prix de réserve, dépôt, TCOE, calendrier. */
import { defineGuide } from '../../lib/page-types';
import { LATEST, premium, stats, shareAtOrBelow, exName, money, day, FETCHED, NEXT_EX, SCHEDULE, monthYear, num } from '../../lib/data';
import { P } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const C = PARAMS.coe;
const en = (x: number) => money(x, 'en'), zh = (x: number) => money(x, 'zh');
const A = premium(LATEST, 'A');
const s24 = stats('A', 24);
const probe = Math.round(s24.median / 1000) * 1000;
const hit = shareAtOrBelow('A', probe, 24);
const schedEn = SCHEDULE.map((s) => [`${s.round === 1 ? '1st' : '2nd'} exercise of ${monthYear(s.month, 'en')}`, day(s.start, 'en'), day(s.end, 'en')]);
const schedZh = SCHEDULE.map((s) => [`${monthYear(s.month, 'zh')}第${s.round === 1 ? '一' : '二'}轮`, day(s.start, 'zh'), day(s.end, 'zh')]);
const nextEn = NEXT_EX ? `The next exercise opens on ${day(NEXT_EX.start, 'en')} at 12 noon and closes on ${day(NEXT_EX.end, 'en')} at 4 pm.` : '';
const nextZh = NEXT_EX ? `下一轮于${day(NEXT_EX.start, 'zh')}中午12时开始，${day(NEXT_EX.end, 'zh')}下午4时截止。` : '';

export default defineGuide({
  id: 'coe-bidding', group: 'coe', order: 2, tool: 'bid', related: ['coe-results', 'coe-cat-a', 'motorcycle-coe', 'home'], sources: ['lta-coe', 'lta-schedule', 'dgs-coe'],
  en: {
    slug: 'coe-bidding', nav: 'COE bidding', card: 'Reserve price, deposit and the 2026 dates',
    title: 'COE Bidding 2026: Reserve Price, Deposit, Dates and Rules',
    description: 'How COE bidding works in 2026: reserve price and current COE price, the deposit for each category, temporary COE validity, dates left this year, past results.',
    h1: 'How COE bidding works',
    intro: 'What happens to your bid during the three days of an exercise, what it costs to take part, and how often a given reserve price would have been enough in the past.',
    resume: `A COE bid is a reserve price: the most you are prepared to pay. During the three working days of an exercise the bidding system raises every bid in the running by one dollar steps up to its reserve, and the current COE price is always the highest losing bid plus one dollar. At the close, every bid at or above that price wins and pays it, so the quota premium is the same for all winners. To bid you need an account with DBS or POSB (ATM, individuals) or with DBS, UOB or Maybank online (companies and traders), and a deposit of ${en(C.bidDeposit)} for Categories A, B, C and E or ${en(P.moto.bidDeposit)} for Category D. Over the last 24 exercises a Category A reserve of ${en(probe)} would have won ${hit.hits} times. ${nextEn}`,
    faqs: [
      { q: 'Can I withdraw or lower a COE bid?', a: `No. Once the system accepts a bid, the deposit and the bank’s administration fee are taken and the bid stays in the exercise. You can only revise the reserve price upwards, in steps of one dollar, as many times as you like before the close. Each revision costs an administration fee: ${en(C.oneMotoringRevisionFee)} through OneMotoring, or the bank’s own fee at an ATM.` },
      { q: 'What happens to my deposit if I lose?', a: `The deposit, minus the administration fees, goes back to your bank account ${num(C.depositRefundWorkingDays, 'en')} working day after the results are announced. If you win, the deposit counts towards the premium and you pay the difference when you register the vehicle. If the deposit is larger than the premium, the surplus offsets the registration fee and ARF.` },
      { q: 'How long is a temporary COE valid?', a: `A successful bid gives a temporary COE that must be used to register a vehicle before it expires: ${C.tcoeMonths.A} months for Categories A and B, ${C.tcoeMonths.C} months for Categories C and E, and ${C.tcoeMonths.D} month for Category D certificates won since May 2023. A temporary COE that expires unused is lost together with the whole deposit.` },
      { q: 'Can I bid for someone else?', a: 'Not with your own account. An individual bids in their own name with their own ATM card, must be at least 18, and the car can only be registered under that ID. Companies and motor traders may bid on behalf of clients and place several bids in one exercise. Most buyers let the dealer bid for them as part of the sale.' },
    ],
    body: (h) => `
<h2>From reserve price to quota premium</h2>
<p>When you submit a bid you type a reserve price, the highest amount you would pay. The system does not use that figure directly. It keeps a current COE price for each category, equal to the highest bid that is out of the running plus ${h.m(1)}, and moves every live bid up one dollar at a time as others arrive. Your bid stays in the running while your reserve is at least the current price. When the current price rises above your reserve, your status turns to “out bid” and you drop out unless you revise upwards.</p>
<p>The price stops rising when the number of bids still in the running equals the quota. At 4 pm on the closing day, every bid at or above the current price wins, and that price becomes the quota premium for the exercise. Two people who typed ${h.m(A + 20000)} and ${h.m(A)} pay exactly the same if both won. If several bids sit on the same amount at the cut off and accepting them all would exceed the quota, none of the tied bids wins; the unused certificate is carried to the matching exercise of the next month. LTA’s ${h.src('lta-coe', 'COE page')} works through an example of that rule.</p>
${h.mini('results', { t: 'Results of any exercise', p: ['ex', 'cat'] })}
<h2>What you need before the exercise opens</h2>
<p>Individuals bid at a DBS or POSB ATM; companies and motor traders bid through DBS, UOB or Maybank online banking. The account must hold the deposit, ${h.m(C.bidDeposit)} for Categories A, B, C and E and ${h.m(P.moto.bidDeposit)} for Category D, plus the bank’s administration fee, which LTA says ranges from ${h.m(C.bankAdminFee[0])} to ${h.m(C.bankAdminFee[1])}. An individual must be at least ${C.minBidderAge} and may submit one bid per exercise, in their own name and with their own account. A six digit acknowledgement code is issued with every accepted bid or revision: keep it private, because it is what allows a revision from another channel.</p>
<p>You can follow your bid on OneMotoring with Singpass. The status reads “accepted” while you are in the running and “out bid” once the current price has passed your reserve. The current prices of all categories are visible during the exercise, so the price at the close is rarely a surprise to people who watch it on the last afternoon, and that is also when most revisions are made.</p>
<h2>After the results</h2>
<p>A winning bid becomes a temporary COE in the bidder’s ID. You then have ${C.tcoeMonths.A} months to register a car in Category A or B, ${C.tcoeMonths.C} months in C or E and ${C.tcoeMonths.D} month for a motorcycle. At registration you pay the premium minus the deposit already held. Certificates in Categories A, B and D cannot be transferred; C and E certificates won by an individual can be transferred once, and those won by a company cannot be transferred at all.</p>
<h2>Choosing a reserve price</h2>
<p>Nobody knows the next premium, and this site does not guess it. What the calculator at the top does is replay the past: it counts in how many of the last six, twelve or twenty four months of exercises your reserve would have been enough. Over the last 24 exercises the Category A premium ranged from ${h.m(s24.min)} to ${h.m(s24.max)}, with a median of ${h.m(s24.median)}. Since everybody pays the same premium, a reserve set well above recent results does not cost more when you win; it only commits you to paying more if the premium does climb that far.</p>
<p>Most buyers never bid themselves. A dealer package usually includes the COE: either a certificate promised at a fixed price, with the dealer carrying the risk, or a number of bidding attempts, with the price passed on to you. Ask which one you are signing, and compare the COE line of the offer with recent ${h.a('coe-results', 'COE results')}. The ${h.a('home', 'full car cost calculator')} shows what the premium does to your cost per year.</p>
<h2>Bidding dates left in 2026</h2>
${h.table(['Exercise', 'Opens (12 noon)', 'Closes (4 pm)'], schedEn, `Schedule published by LTA for 2026. The 2027 schedule has not been published yet.`, ['l', 'l', 'l'])}
<p>Exercises usually open on the first and third Monday of the month and last three working days, closing on Wednesday afternoon. A public holiday in between pushes the close back. LTA announces the quota for each category before every exercise; it is revised every three months from the number of vehicles deregistered, the allowed growth of the vehicle population and adjustments for taxis and expired certificates. The full calendar is on LTA’s ${h.src('lta-schedule', 'schedule of exercises')}.</p>`,
  },
  zh: {
    slug: 'coe-bidding', nav: '拥车证竞标', card: '保留价、押金与2026年日期',
    title: '拥车证竞标 2026：保留价、押金、竞标日期与规则',
    description: '2026年拥车证竞标怎样进行：保留价与当前拥车证价格如何变化、各类别押金多少、临时拥车证有效期、今年余下的竞标日期，以及您的保留价在过往各轮能否中标。',
    h1: '拥车证竞标怎样进行',
    intro: '竞标三天里您的出价会经历什么、参加竞标要花多少钱，以及某个保留价在过去有多少次能够中标。',
    resume: `拥车证投标就是一个保留价，即您愿意支付的最高金额。在一轮竞标的三个工作日里，系统会把所有仍在竞争中的投标以每次一元的幅度往上调，直到各自的保留价；当前拥车证价格始终等于最高的落选出价加一元。竞标截止时，所有等于或高于这个价格的投标都中标，并按这个价格付款，所以同一类别所有中标者的配额价格都一样。投标需要 DBS 或 POSB 账户（个人用提款机），或 DBS、UOB、Maybank 的网上银行（公司和车行），并缴付押金：A、B、C、E类为 ${zh(C.bidDeposit)}，D类为 ${zh(P.moto.bidDeposit)}。在最近24轮中，A类保留价定为 ${zh(probe)} 的话，有 ${hit.hits} 轮能够中标。${nextZh}`,
    faqs: [
      { q: '拥车证投标可以撤回或调低吗？', a: `不可以。系统一旦接受投标，就会扣除押金和银行行政费，投标会一直留在本轮。您只能以一元为单位调高保留价，在截止前可以调整任意多次。每次调整都要付行政费：通过 OneMotoring 为 ${zh(C.oneMotoringRevisionFee)}，在提款机调整则按银行自己的收费。所以提交前请确认类别和金额。` },
      { q: '没有中标，押金怎么办？', a: `押金扣除银行和 OneMotoring 的行政费后，会在结果公布后 ${num(C.depositRefundWorkingDays, 'zh')} 个工作日退回您的银行账户。如果中标，押金会计入拥车证价格，注册车辆时只需补付差额。如果押金高于拥车证价格，多出的部分会用来抵付注册费和附加注册费，不必另外申请。下一轮可以重新投标。` },
      { q: '临时拥车证的有效期有多长？', a: `中标后会得到临时拥车证，必须在到期前用来注册车辆：A类和B类为 ${C.tcoeMonths.A} 个月，C类和E类为 ${C.tcoeMonths.C} 个月，2023年5月起取得的D类为 ${C.tcoeMonths.D} 个月。临时拥车证过期未用，就会作废，全部押金也会被没收，不能申请退还，所以最好在投标前就选定车款并确认交车时间。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
      { q: '可以替别人投标吗？', a: '不能用自己的账户替别人投标。个人必须以自己的名字和自己的提款卡投标，年满18岁，中标后车辆只能注册在这个身份证号码下。公司和车行可以代客户投标，每一轮可以投多份。大多数买家都让车行在购车配套中代为投标。签约时请确认由谁投标、以谁的名义注册。' },
    ],
    body: (h) => `
<h2>从保留价到配额价格</h2>
<p>提交投标时，您输入的是保留价，也就是愿付的最高金额。系统并不直接使用这个数字。它为每个类别维持一个当前拥车证价格，等于已落选的最高出价加 ${h.m(1)}，并在新投标进来时把所有仍在竞争中的投标每次调高一元。只要您的保留价不低于当前价格，投标就仍在竞争中。当前价格一旦超过您的保留价，状态就会变成“已被超越”，除非调高保留价，否则就会出局。</p>
<p>当仍在竞争中的投标数量等于配额时，价格就停止上升。截止当天下午4时，所有等于或高于当前价格的投标都中标，这个价格就是本轮的配额价格。一个人出价 ${h.m(A + 20000)}，另一个人出价 ${h.m(A)}，只要都中标，付的钱完全一样。如果在截止价格上有几份同价投标，全部接受会超过配额，那么这些同价投标都不会中标，剩下的拥车证转到下个月对应的那一轮。陆路交通管理局的${h.src('lta-coe', '拥车证页面')}有一个例子说明这条规则。</p>
${h.mini('results', { t: '任何一轮的结果', p: ['ex', 'cat'] })}
<h2>竞标开始前要准备什么</h2>
<p>个人在 DBS 或 POSB 提款机投标；公司和车行通过 DBS、UOB 或 Maybank 的网上银行投标。账户里必须有足够的押金：A、B、C、E类 ${h.m(C.bidDeposit)}，D类 ${h.m(P.moto.bidDeposit)}，另加银行行政费，陆路交通管理局说明一般为 ${h.m(C.bankAdminFee[0])} 至 ${h.m(C.bankAdminFee[1])}。个人须年满 ${C.minBidderAge} 岁，每一轮只能以自己的名字和账户投一次标。每次投标或调整被接受后，都会收到一个六位数的确认码，请妥善保管，因为在其他渠道调整出价时需要它。</p>
<p>您可以用 Singpass 在 OneMotoring 上查看投标状态：仍在竞争中显示“已接受”，当前价格超过保留价后显示“已被超越”。竞标期间可以看到所有类别的当前价格，所以在最后一个下午留意价格的人，很少会对截止价格感到意外，大多数调整也是在那时进行的。</p>
<h2>结果公布之后</h2>
<p>中标后会得到一张登记在投标者身份证号码下的临时拥车证。之后，A类或B类须在 ${C.tcoeMonths.A} 个月内注册车辆，C类或E类为 ${C.tcoeMonths.C} 个月，摩托车为 ${C.tcoeMonths.D} 个月。注册时只需补付拥车证价格减去已缴押金的差额。A、B、D类拥车证不能转让；个人取得的C类和E类可以转让一次，公司取得的则完全不能转让。</p>
<h2>怎样定保留价</h2>
<p>没有人知道下一轮价格，本站也不猜测。页面顶部的计算器做的是重播过去：计算在最近六个月、一年或两年的竞标中，您的保留价有多少轮能够中标。最近24轮A类价格介于 ${h.m(s24.min)} 至 ${h.m(s24.max)}，中位数为 ${h.m(s24.median)}。由于所有中标者付同样的价格，把保留价定得比近期结果高很多，中标时并不会多付；它只是表示，如果价格真的升到那么高，您也愿意付。</p>
<p>大多数买家从不自己投标。车行配套通常包括拥车证：要么以固定价格保证取得拥车证，风险由车行承担；要么包含若干次投标，价格转嫁给您。签约前问清楚是哪一种，并把报价中的拥车证一项与近期${h.a('coe-results', '拥车证结果')}比较。${h.a('home', '买车成本计算器')}会显示拥车证价格对每年成本的影响。</p>
<h2>2026年余下的竞标日期</h2>
${h.table(['轮次', '开始（中午12时）', '截止（下午4时）'], schedZh, '陆路交通管理局公布的2026年时间表。2027年时间表尚未公布。', ['l', 'l', 'l'])}
<p>每轮竞标通常在每月第一个和第三个星期一开始，为期三个工作日，在星期三下午截止，中间如有公共假期则顺延。陆路交通管理局在每轮开始前公布各类别的配额；配额每三个月按注销车辆数量、允许的车辆增长率以及德士和过期拥车证的调整重新计算。完整时间表见陆路交通管理局的${h.src('lta-schedule', '竞标时间表')}。</p>`,
  },
});
