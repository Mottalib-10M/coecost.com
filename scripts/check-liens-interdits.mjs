#!/usr/bin/env node
/**
 * Fait échouer le build si dist/ contient un lien vers un domaine qu'on ne lie pas sans
 * autorisation écrite : lta.gov.sg, onemotoring.lta.gov.sg, mas.gov.sg, iras.gov.sg
 * (décision du 2026-10-24, AUDIT-DONNEES-DROITS règle 5). Ces pages se citent en texte :
 * organisme, titre, adresse sans schéma, date de lecture (src/lib/helpers.ts, sourceList).
 *
 * Est un défaut : toute adresse avec schéma (http://, https://, //) vers ces domaines, où
 * qu'elle soit (href, JSON-LD, script), et tout attribut href/src/action qui les vise.
 * Usage : node scripts/check-liens-interdits.mjs [dist]   (auto-test : --self-test)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOM = String.raw`(?:[a-z0-9-]+\.)*(?:lta|mas|iras)\.gov\.sg`;
const RE_URL = new RegExp(String.raw`(?:https?:)?\/\/` + DOM + String.raw`(?![a-z0-9.-])`, 'gi');
const RE_ATTR = new RegExp(String.raw`\b(?:href|src|action|formaction)\s*=\s*["']?\s*(?:https?:\/\/|\/\/)?` + DOM, 'gi');

export function defauts(text) {
  const out = new Set();
  for (const m of text.matchAll(RE_URL)) out.add(m[0]);
  for (const m of text.matchAll(RE_ATTR)) out.add(m[0]);
  return [...out];
}

function selfTest() {
  const bad = ['<a href="https://onemotoring.lta.gov.sg/x">', '<a href="https://www.lta.gov.sg/">', '"url":"https://www.mas.gov.sg/a"', "<a href='//www.iras.gov.sg/'>", '<a href="www.iras.gov.sg/x">'];
  const good = ['<span>onemotoring.lta.gov.sg/content/x.html</span>', '<a href="https://data.gov.sg/datasets/x">', 'https://www.ltagov.sg.example.com/', 'https://atlas.gov.sg/'];
  const ko = [...bad.filter((s) => defauts(s).length === 0), ...good.filter((s) => defauts(s).length > 0)];
  if (ko.length) { console.error('check-liens-interdits auto-test ÉCHEC', ko); process.exit(1); }
  console.log(`check-liens-interdits auto-test OK (${bad.length} mauvais, ${good.length} bons)`);
}

if (process.argv.includes('--self-test')) selfTest();
else {
  selfTest();
  const root = process.argv[2] ?? 'dist';
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(html?|js|mjs|json|xml|txt|webmanifest)$/i.test(f)) files.push(p); } };
  walk(root);
  if (files.length === 0) { console.error(`check-liens-interdits : aucun fichier dans ${root}, contrôle non fait`); process.exit(1); }
  let n = 0;
  for (const f of files) { const d = defauts(readFileSync(f, 'utf8')); if (d.length) { n += d.length; console.error(`${f} : ${d.join(' | ')}`); } }
  if (n) { console.error(`check-liens-interdits : ${n} lien(s) vers LTA / OneMotoring / MAS / IRAS dans ${root} (citer sans lien)`); process.exit(1); }
  console.log(`check-liens-interdits : 0 lien interdit sur ${files.length} fichiers`);
}
