/** « road tax renewal » (10 k – 100 k) : prérequis, quatre façons de payer, pénalités de retard, amende. */
import { defineGuide } from '../../lib/page-types';
import { money, day, num, PARAMS_READ } from '../../lib/data';
import { P, roadTaxRenewal, roadTaxLateFee } from '../../lib/engine/car-cost';
import PARAMS from '../../data/params-2026.json';

const RN = PARAMS.roadTax.renewal, LF = P.roadTax.lateFees;
const en = (x: number, d = 0) => money(x, 'en', d), zh = (x: number, d = 0) => money(x, 'zh', d);
const r12 = roadTaxRenewal({ fuel: 'petrol', cc: 1496, age: 4, months: 12 }).total;
const r6 = roadTaxRenewal({ fuel: 'petrol', cc: 1496, age: 4, months: 6 }).total;
const exLate = roadTaxLateFee(996, 3.5);
const old = roadTaxRenewal({ fuel: 'petrol', cc: 1496, age: 12.5, months: 12 });
const evR = roadTaxRenewal({ fuel: 'ev', cc: 0, kw: 100, age: 2, months: 12 });
const lfRows = (l: 'en' | 'zh') => { let prev = 0; return LF.rows.map(([up, ...f]) => { const lab = up === null ? (l === 'en' ? `Above ${num(prev, l)} cc` : `${num(prev, l)} cc 以上`) : prev === 0 ? (l === 'en' ? `Up to ${num(up, l)} cc` : `${num(up, l)} cc 或以下`) : (l === 'en' ? `${num(prev + 1, l)} to ${num(up, l)} cc` : `${num(prev + 1, l)} 至 ${num(up, l)} cc`); prev = up ?? prev; return [lab, ...f.map((x) => money(x, l))]; }); };
const colsZh = ['到期后1个月内', '1至2.5个月', '超过2.5个月', '超过3个月'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default defineGuide({
  id: 'road-tax-renewal', group: 'own', order: 12, tool: 'roadTaxRenew', related: ['road-tax', 'cost-of-owning', 'ev-road-tax', 'coe-renewal'], sources: ['lta-roadtax'],
  en: {
    slug: 'road-tax-renewal', nav: 'Road tax renewal', card: 'Prerequisites, ways to pay and late fees',
    title: 'Road Tax Renewal 2026: Amount, Prerequisites and Late Fees',
    description: `Road tax renewal in Singapore for 2026: the cost for 6 or 12 months, the insurance, inspection and fines checks, four ways to renew, late fees, the ${en(LF.maxFine)} fine.`,
    h1: 'Road tax renewal: amount, steps and late fees',
    intro: `What to pay, what must be in order before you pay, and what happens if the road tax lapses. Rules read on LTA’s road tax page on ${day(PARAMS_READ, 'en')}.`,
    resume: `Renewing road tax for a four year old 1,496 cc petrol car costs ${en(r12, 2)} for twelve months or ${en(r6, 2)} for six; the calculator gives the amount for any engine, motor power or age, including the surcharge on cars over ten years. Three things must be in order at least ${num(RN.prereqWorkingDays, 'en')} working day before you pay: insurance covering the whole road tax period, a vehicle inspection if one is due, and no outstanding fines with LTA, HDB, URA or the Traffic Police. You can then renew online on OneMotoring, at an AXS station, by GIRO or at an authorised road tax collection centre. Renewing late adds a fee that grows with the delay, from ${en(LF.rows[0][1] as number)} to ${en(LF.rows[LF.rows.length - 1][4] as number)} for a car, and keeping or using a car without valid road tax is an offence punishable by a fine of up to ${en(LF.maxFine)}.`,
    faqs: [
      { q: 'Can I renew road tax if my car insurance expires soon?', a: 'Not for a period your insurance does not cover. The policy must cover third party liability for death and bodily injury for the entire road tax period you are paying for. Renew the insurance first, wait for the insurer to update LTA’s records, then renew the road tax at least one working day later.' },
      { q: 'How does road tax renewal by GIRO work?', a: `LTA sends a GIRO payment schedule about ${num(RN.giroScheduleMonths, 'en')} month before the road tax expires, with the deadline for the prerequisites. The deduction takes place ${num(RN.giroDeductWorkingDays, 'en')} working days before expiry, or one working day earlier if that date falls on a weekend or holiday. If a prerequisite is missing, the deduction fails and you must renew another way.` },
      { q: 'How much is the late fee for road tax?', a: `It depends on engine capacity and on how long the road tax has lapsed. For a car up to ${num(LF.rows[0][0] as number, 'en')} cc it is ${en(LF.rows[0][1] as number)} within a month, rising to ${en(LF.rows[0][4] as number)} after three months; LTA’s own example is a small car renewed three and a half months late, which pays ${en(exLate)} on top of the road tax.` },
    ],
    body: (h) => `
<h2>Before you pay: three prerequisites</h2>
<p>The renewal will be refused unless three checks pass. First, insurance: the policy must cover the whole period of road tax you are buying, including third party liability for death and bodily injury. Second, inspection: cars above a certain age must pass a periodic inspection, and LTA sends a notice about ${num(RN.inspectionNoticeMonths, 'en')} months before the road tax expires when one is due; a lost notice does not stop you from getting the car inspected at an authorised centre. Third, fines: outstanding fines or warrants with LTA, HDB, URA or the Traffic Police can block the renewal.</p>
<p>All three must be in LTA’s records at least ${num(RN.prereqWorkingDays, 'en')} working day before you pay, so leave a margin before the expiry date. Weekend and off peak cars also need their plate seals inspected, and they can only renew for twelve months at a time.</p>
<h2>Four ways to renew</h2>
<p>Online on OneMotoring, every day except between midnight and 1 am, by Visa or Mastercard credit or debit card or by eNETS Debit. At AXS stations and AXS online channels, with the same hours. By GIRO, which renews automatically every six months unless you choose yearly. Or at an authorised road tax collection centre with the original documents; since ${day(RN.noCashAtInspectionCentresFrom, 'en')} the inspection centres no longer accept cash, cheques or cashier’s orders for road tax. Since ${day(RN.discAbolished, 'en')} no disc is issued, so a receipt or the validity record on OneMotoring is the proof.</p>
${h.mini('own', { t: 'Road tax inside the full cost of owning', p: ['price', 'years'] })}
<h2>What changes the amount</h2>
<p>The renewal amount is the road tax for the period, plus the age surcharge once the car is over ten years old, plus the flat component for an electric car. The same 1,496 cc car at twelve and a half years pays ${h.m(old.total, 2)} for a year, of which ${h.m(old.surcharge, 2)} is surcharge. An electric car with a 100 kW motor, two years old, pays ${h.m(evR.total, 2)} for a year, of which ${h.m(evR.afc, 2)} is the additional flat component. Renewing for six or twelve months costs the same per month, so the choice only changes how often you renew.</p>
<h2>Late renewal fees</h2>
${h.table(['Engine', ...LF.cols.map(cap)], lfRows('en'), `Late fee for a private car, by time since the road tax expired. Company cars and other vehicle types pay a separate scale. Source: LTA road tax page.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The fee steps up at one month, two and a half months and three months after expiry, and it is charged on top of the road tax itself. The bigger risk is the offence itself: keeping or using a vehicle whose road tax has expired can lead to a fine of up to ${h.m(LF.maxFine)}, and LTA may charge the owner in court. A car that sits unused in a car park still needs valid road tax as long as it is registered.</p>
<h2>Selling, scrapping or exporting</h2>
<p>A car cannot be transferred or deregistered while its road tax has lapsed, so an expired road tax must be renewed first. When the car is sold, the remaining road tax goes with it to the new owner, and it is fair to reflect the unused months in the price. When the car is deregistered, the unused road tax is refunded automatically to the last registered owner. The ${h.a('road-tax', 'road tax calculator')} shows how the amount is built, and the ${h.a('ev-road-tax', 'EV road tax page')} covers electric cars, whose late fees LTA does not list separately.</p>`,
  },
  zh: {
    slug: 'road-tax-renewal', nav: '路税续缴', card: '续缴条件、付款方式与逾期费',
    title: '路税续缴 2026：应付金额、续缴条件与逾期费用',
    description: '2026年新加坡路税续缴：六个月或十二个月要付多少、保险、验车和罚款三项续缴条件、网上与 GIRO 等四种续缴方式、按排量计算的逾期费用，以及最高罚款。',
    h1: '路税续缴：金额、步骤与逾期费',
    intro: `要付多少钱、付款前要准备好什么，以及路税过期会怎样。规则于${day(PARAMS_READ, 'zh')}读取自陆路交通管理局路税页面。`,
    resume: `一辆车龄四年、1,496 cc 的汽油车，续缴十二个月路税要付 ${zh(r12, 2)}，六个月为 ${zh(r6, 2)}；计算器可以算出任何排量、电机功率或车龄的金额，包括车龄超过十年的附加费。付款前至少 ${num(RN.prereqWorkingDays, 'zh')} 个工作日，必须准备好三件事：涵盖整个路税期间的保险、如需验车须已通过检验，以及没有欠陆路交通管理局、建屋发展局、市区重建局或交通警察的罚款。之后可以在 OneMotoring 网上、AXS 站、通过 GIRO 或在授权的路税收费中心续缴。逾期续缴要付逾期费，拖得越久越高，汽车从 ${zh(LF.rows[0][1] as number)} 到 ${zh(LF.rows[LF.rows.length - 1][4] as number)} 不等；保留或使用没有有效路税的车辆属于违法，最高可罚款 ${zh(LF.maxFine)}，车主还可能被控上法庭。在计算器中输入排量、车龄和过期月数，就能看到连同逾期费在内要付的总额。`,
    faqs: [
      { q: '车险快到期了，还能续缴路税吗？', a: '不能续缴保险没有涵盖的期间。保单必须在您所缴路税的整个期间内，涵盖第三方死亡和身体伤害责任。请先续保，等保险公司更新陆路交通管理局的记录，至少一个工作日后再续缴路税，否则付款会被拒绝，路税也可能因此逾期。具体以陆路交通管理局 OneMotoring 上的资料为准。' },
      { q: '用 GIRO 续缴路税是怎样运作的？', a: `陆路交通管理局会在路税到期前约 ${num(RN.giroScheduleMonths, 'zh')} 个月寄出 GIRO 扣款时间表，注明完成各项条件的截止日期。扣款在到期前 ${num(RN.giroDeductWorkingDays, 'zh')} 个工作日进行，如遇周末或假期则提前一个工作日。如果条件未满足，扣款就会失败，您必须改用其他方式尽快续缴。请确保账户有足够余额，并设定足够的付款限额。` },
      { q: '路税逾期费是多少？', a: `取决于引擎排量和过期多久。${num(LF.rows[0][0] as number, 'zh')} cc 以下的汽车，一个月内为 ${zh(LF.rows[0][1] as number)}，超过三个月升到 ${zh(LF.rows[0][4] as number)}；陆路交通管理局自己的例子是一辆小型车逾期三个半月才续缴，除路税外还要付 ${zh(exLate)} 的逾期费，越早续缴越省钱，最好在到期前完成。具体以陆路交通管理局 OneMotoring 上的资料为准。` },
    ],
    body: (h) => `
<h2>付款之前：三项条件</h2>
<p>除非通过三项检查，否则续缴会被拒绝。第一是保险：保单必须涵盖您所购买的整个路税期间，包括第三方死亡和身体伤害责任。第二是验车：达到一定车龄的汽车必须通过定期检验，需要验车时，陆路交通管理局会在路税到期前约 ${num(RN.inspectionNoticeMonths, 'zh')} 个月寄出通知；通知遗失也可以直接到授权检验中心验车。第三是罚款：欠陆路交通管理局、建屋发展局、市区重建局或交通警察的罚款或拘捕令，都可能阻止续缴。</p>
<p>这三项必须在付款前至少 ${num(RN.prereqWorkingDays, 'zh')} 个工作日出现在陆路交通管理局的记录中，所以请在到期日前预留时间。周末用车和非高峰时段用车还要检查车牌封条，而且只能一次续缴十二个月。</p>
<h2>四种续缴方式</h2>
<p>在 OneMotoring 网上续缴，每天开放，午夜至凌晨1时除外，可用 Visa 或万事达信用卡、借记卡，或 eNETS 借记付款。AXS 站和 AXS 网上渠道，开放时间相同。GIRO 会自动每六个月续缴一次，也可以选择每年一次。或者带着原始文件到授权的路税收费中心办理；自${day(RN.noCashAtInspectionCentresFrom, 'zh')}起，检验中心不再接受现金、支票或银行本票缴付路税。自${day(RN.discAbolished, 'zh')}起不再发放路税标签，收据或 OneMotoring 上的有效记录就是证明，也可以随时在网上下载或打印路税有效证明。</p>
${h.mini('own', { t: '路税在拥车总成本中占多少', p: ['price', 'years'] })}
<h2>哪些因素改变金额</h2>
<p>续缴金额包括该期间的路税、车龄超过十年后的附加费，以及电动车的附加固定费用。同一辆 1,496 cc 的车在车龄十二年半时，续缴一年要付 ${h.m(old.total, 2)}，其中 ${h.m(old.surcharge, 2)} 是附加费。一辆电机功率 100 kW、车龄两年的电动车，续缴一年要付 ${h.m(evR.total, 2)}，其中 ${h.m(evR.afc, 2)} 是附加固定费用。续缴六个月或十二个月，每月的费用相同，所以选择哪一种只关系到办理的次数，而不是总额。</p>
<h2>逾期续缴费用</h2>
${h.table(['引擎', ...colsZh], lfRows('zh'), '私家车逾期续缴路税的费用，按过期时间计算。公司用车和其他车辆另有标准。来源：陆路交通管理局路税页面。', ['l', 'r', 'r', 'r', 'r'])}
<p>逾期费在到期后一个月、两个半月和三个月时逐级提高，另外还要缴付路税本身。更大的风险是违法本身：保留或使用路税已过期的车辆，最高可罚款 ${h.m(LF.maxFine)}，陆路交通管理局也可能把车主告上法庭。只要车辆仍然注册，即使停在停车场不开，也需要有效路税。如果打算长时间不用车，应考虑正式注销或封存，而不是让路税过期。</p>
<h2>卖车、报废或出口</h2>
<p>路税过期的车辆不能过户或注销，所以必须先续缴。车辆出售时，剩余的路税会随车转给新车主，把未用的月份反映在售价中是合理的，买家也应在付款前核对路税的到期日。车辆注销时，未用的路税会自动退还给最后登记的车主。${h.a('road-tax', '路税计算器')}说明金额怎样计算；电动车的路税见${h.a('ev-road-tax', '电动车路税页面（英文）')}，陆路交通管理局没有另外列出电动车的逾期费。</p>`,
  },
});
