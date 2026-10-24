/** llms.txt (RECETTE §21), généré à partir du registre des pages et des derniers résultats COE. */
import { GUIDES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route, hasRoute } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
import { LATEST, FIRST, exName, CATS, premium } from '../lib/data';
export function GET() {
  const prem = CATS.map((c) => `Cat ${c} S$${premium(LATEST, c)}`).join(', ');
  const lines = [
    `# ${SITE_NAMES.en} / ${SITE_NAMES.zh}`, '',
    `> Independent calculators for the cost of a car in Singapore, in English and Simplified Chinese: COE bidding results for every exercise from ${exName(FIRST, 'en')} to ${exName(LATEST, 'en')} (latest: ${prem}), PQP for COE renewal, tiered ARF on the OMV, VES and EEAI, road tax for petrol, hybrid and electric cars, PARF and COE rebates, and the cost per year. COE and PQP figures contain information from data.gov.sg (Land Transport Authority), made available under the Singapore Open Data Licence version 1.0. Published by Radif Partners, not affiliated with or endorsed by the Land Transport Authority; estimates for guidance only. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label.en} / ${g.label.zh}`, ...GUIDES.filter((p) => p.group === g.id).flatMap((p) => [`- [${p.en.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.en.card}`, ...(p.zh && hasRoute(p.id, 'zh') ? [`- [${p.zh.nav}](${SITE_URL}${route(p.id, 'zh')}): ${p.zh.card}`] : [])]), '']),
    '## About', `- [Method](${SITE_URL}${route('method', 'en')})`, `- [计算方法](${SITE_URL}${route('method', 'zh')})`, `- [About](${SITE_URL}${route('about', 'en')})`, `- [关于本站](${SITE_URL}${route('about', 'zh')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
