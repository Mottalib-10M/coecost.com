#!/usr/bin/env node
/**
 * Relit les données officielles et régénère src/data/*.json (ou data/ en phase de préparation).
 * Usage : node scripts/update-data.mjs [dossier-de-sortie]   (défaut : src/data, sinon data)
 *
 * Sources (toutes sous Singapore Open Data Licence v1.0, https://data.gov.sg/open-data-licence) :
 *  1. « COE Bidding Results / Prices », Land Transport Authority, data.gov.sg
 *     d_69b3380ad7e51aff3a7dcc84eba52b8a : une ligne par exercice et par catégorie
 *     (month, bidding_no, vehicle_class, quota, bids_success, bids_received, premium), depuis 2010.
 *  2. « Motor Vehicle Quota, Quota Premium And Prevailing Quota Premium, Monthly », SingStat
 *     (source LTA), d_22094bf608253d36c0c63b52d852dd6e : PQP publiée après le 2e exercice du mois.
 *
 * Mention obligatoire (licence, § Attribution) écrite dans chaque JSON (`attribution`).
 * Cron prévu : lundi au jeudi 09:30 UTC (17:30 à Singapour), soit après chaque exercice
 * (résultats vers 16 h le mercredi), puis rebuild. Le PQP du mois suivant est recalculé par
 * nous selon la règle LTA (moyenne des 6 dernières primes des 3 derniers mois avec exercice,
 * arrondie au dollar supérieur) et contrôlé contre la série SingStat dès qu'elle paraît.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] || 'src/data/sg';
const API = 'https://data.gov.sg/api/action/datastore_search';
const LICENCE = 'https://data.gov.sg/open-data-licence';
const today = new Date().toISOString().slice(0, 10);
const attribution = (name) =>
  `Contains information from ${name} accessed on ${today} from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0 ${LICENCE}`;

async function all(resourceId) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    let res;
    for (let t = 0; t < 4; t++) {
      res = await fetch(`${API}?resource_id=${resourceId}&limit=1000&offset=${offset}`);
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 5000 * (t + 1)));
    }
    if (!res.ok) throw new Error(`${resourceId} : HTTP ${res.status}`);
    const j = await res.json();
    if (!j.success) throw new Error(`${resourceId} : réponse sans succès`);
    rows.push(...j.result.records);
    if (j.result.records.length < 1000) break;
  }
  return rows;
}

const CAT = { 'Category A': 'A', 'Category B': 'B', 'Category C': 'C', 'Category D': 'D', 'Category E': 'E' };
const num = (s) => (s === null || s === undefined || s === '' || s === 'na' ? null : Number(String(s).replace(/,/g, '')));

// 1. Résultats COE
const coeRaw = await all('d_69b3380ad7e51aff3a7dcc84eba52b8a');
const ex = new Map();
for (const r of coeRaw) {
  const key = `${r.month}-${r.bidding_no}`;
  if (!ex.has(key)) ex.set(key, { month: r.month, round: Number(r.bidding_no), cats: {} });
  const c = CAT[r.vehicle_class.trim()];
  if (!c) continue;
  ex.get(key).cats[c] = { quota: num(r.quota), success: num(r.bids_success), bids: num(r.bids_received), premium: num(r.premium) };
}
const exercises = [...ex.values()].sort((a, b) => (a.month + a.round).localeCompare(b.month + b.round));
if (!exercises.length) throw new Error('aucun exercice COE');
for (const e of exercises) for (const c of 'ABCDE') if (!e.cats[c] || !(e.cats[c].premium > 0)) throw new Error(`exercice ${e.month}/${e.round} : catégorie ${c} absente`);

// 2. PQP : série SingStat (publiée après le 2e exercice du mois M, applicable aux renouvellements du mois M+1)
const pqpRaw = await all('d_22094bf608253d36c0c63b52d852dd6e');
const SERIES = {
  A: 'Cars Up To 1600cc And 97kW, Prevailing Quota Premium, 2nd Bidding',
  B: 'Cars Above 1600cc Or 97kW, Prevailing Quota Premium, 2nd Bidding',
  C: 'Goods Vehicles & Buses, Prevailing Quota Premium, 2nd Bidding',
  D: 'Motorcycles, Prevailing Quota Premium, 2nd Bidding',
};
const MON = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
const official = {};
for (const [c, label] of Object.entries(SERIES)) {
  const row = pqpRaw.find((r) => r.DataSeries?.trim() === label);
  if (!row) throw new Error(`série PQP introuvable : ${label}`);
  for (const [k, v] of Object.entries(row)) {
    const m = /^(\d{4})([A-Z][a-z]{2})$/.exec(k);
    if (!m || num(v) === null) continue;
    const month = `${m[1]}-${MON[m[2]]}`;
    (official[month] ||= {})[c] = num(v);
  }
}
// Notre recalcul (règle LTA) : moyenne des primes des 3 derniers mois où un exercice a eu lieu.
const months = [...new Set(exercises.map((e) => e.month))].sort();
function pqpAfter(month) {
  const i = months.indexOf(month);
  if (i < 2) return null;
  const last3 = months.slice(i - 2, i + 1);
  const res = {};
  for (const c of 'ABCD') {
    const qps = exercises.filter((e) => last3.includes(e.month)).map((e) => e.cats[c].premium);
    res[c] = Math.ceil(qps.reduce((s, x) => s + x, 0) / qps.length);
  }
  return { basedOn: last3, ...res };
}
const lastMonth = months.at(-1);
const lastMonthComplete = exercises.filter((e) => e.month === lastMonth).length === 2;
const computed = {};
for (const m of months.slice(-24)) if (exercises.filter((e) => e.month === m).length === 2) computed[m] = pqpAfter(m);
// Contrôle : notre calcul doit retomber sur la série officielle là où elle existe.
const mismatches = [];
for (const [m, o] of Object.entries(official)) {
  if (!computed[m]) continue;
  for (const c of 'ABCD') if (o[c] && computed[m][c] !== o[c]) mismatches.push(`${m} ${c} : officiel ${o[c]}, calcul ${computed[m][c]}`);
}

mkdirSync(OUT, { recursive: true });
const latest = exercises.at(-1);
writeFileSync(join(OUT, 'coe-results.json'), JSON.stringify({
  source: 'https://data.gov.sg/datasets/d_69b3380ad7e51aff3a7dcc84eba52b8a/view',
  licence: LICENCE, attribution: attribution('COE Bidding Results / Prices (Land Transport Authority)'),
  fetched: today, latest: { month: latest.month, round: latest.round }, count: exercises.length, exercises,
}, null, 1));
writeFileSync(join(OUT, 'pqp.json'), JSON.stringify({
  source: 'https://data.gov.sg/datasets/d_22094bf608253d36c0c63b52d852dd6e/view',
  licence: LICENCE, attribution: attribution('Motor Vehicle Quota, Quota Premium And Prevailing Quota Premium, Monthly (SingStat, source LTA)'),
  fetched: today,
  note: 'official[M] = PQP published after the 2nd exercise of month M (used for renewals in month M+1). computed[M] = our recalculation with the LTA rule (mean of the quota premiums of the last 3 months with bidding, rounded up); it matches official wherever both exist.',
  official, computed, nextFromLatest: lastMonthComplete ? { appliesTo: nextMonth(lastMonth), ...computed[lastMonth] } : null, mismatches,
}, null, 1));
function nextMonth(m) { const [y, mo] = m.split('-').map(Number); return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`; }
console.log(`COE : ${exercises.length} exercices, dernier ${latest.month} n°${latest.round} ; A ${latest.cats.A.premium} B ${latest.cats.B.premium} C ${latest.cats.C.premium} D ${latest.cats.D.premium} E ${latest.cats.E.premium}`);
console.log(`PQP : ${Object.keys(official).length} mois officiels, écarts calcul/officiel : ${mismatches.length}${mismatches.length ? ' → ' + mismatches.slice(0, 5).join(' ; ') : ''}`);
if (mismatches.length) process.exitCode = 1;
