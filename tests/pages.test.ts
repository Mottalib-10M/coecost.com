/**
 * Tests de contenu (CONTRIBUTING-PAGES.md) : chaque fichier de src/content/guides, en anglais et en chinois.
 *   Chinois : longueur mesurée en caractères ÷ 2,5 (même règle que check-seo), titres 24-40, descriptions 70-120.
 *   PAGE_FILES=coe-results,pqp npx vitest run tests/pages.test.ts
 * Écrit .cache-raw/page-texts.json, lu par `python3 scripts/sim-pages.py` (même mesure que check-unique).
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { GUIDES } from '../src/lib/pages';
import { helpers, SOURCES } from '../src/lib/helpers';
import { ROUTES } from '../src/i18n/routes';
import { TOOL_KINDS } from '../src/lib/tool-specs';
import type { FAQ } from '../src/lib/page-types';
import { HOME } from '../src/content/home';
import { PLANNED_IDS } from '../src/lib/planned';

const BANNED_ALL = [/—/, /–/, /sgcarmart|motorist\.sg|carousell|oneshift|carro\.sg|singsaver|moneysmart/i, /\bLTA-approved\b|official LTA (site|calculator)|陆路交通管理局官方网站|官方计算器/i, /COE (will|is going to) (rise|fall|drop|reach)|forecast(ed)? premium|拥车证价格(将|会)(上涨|下跌)/i];
const BANNED_EN = [/it'?s important to note/i, /dive into/i, /\bdelve/i, /whether you'?re/i, /navigate the/i, /\bMoreover\b/, /\bAdditionally\b/, /\bFurthermore\b/, /game.?changer/i, /\bunlock/i, /in today'?s world/i, /\bguaranteed\b(?![ -]income)/i, /\$ ?\d+(?:,\d{3})* ?\$/];
const BANNED_ZH = [/——/, /值得注意的是/, /总而言之/, /众所周知/, /不言而喻/, /S\$ ?\d/];
const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
/** Mots ; en chinois, caractères hors espaces ÷ 2,5 (même mesure que check-seo). */
const words = (s: string) => { const t = s.replace(/<[^>]+>/g, ' '); return CJK.test(t) ? Math.floor(t.replace(/\s/g, '').length / 2.5) : t.split(/\s+/).filter(Boolean).length; };
const text = (s: string) => s.replace(/<div class="not-prose my-6 overflow-x-auto">[\s\S]*?<\/table><\/div>/g, ' ').replace(/<!--mini:[^>]*-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const only = (process.env.PAGE_FILES ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const keep = (id: string) => !only.length || only.includes(id);

interface Item { id: string; lang: 'en' | 'zh'; title: string; description: string; intro: string; resume: string; body: string; faqs: FAQ[]; related: string[]; minBody: number }
const items: Item[] = GUIDES.flatMap((g) => (['en', 'zh'] as const).filter((l) => g[l]).map((l) => ({ id: g.id, lang: l, title: g[l]!.title, description: g[l]!.description, intro: g[l]!.intro, resume: g[l]!.resume, body: g[l]!.body(helpers(l)), faqs: g[l]!.faqs, related: g.related, minBody: l === 'zh' ? 400 : 520 })));

const allQ = new Map<string, string[]>();
for (const it of [...items, { id: 'home', lang: 'en', faqs: HOME.en.faqs } as Item, { id: 'home', lang: 'zh', faqs: HOME.zh.faqs } as Item]) for (const f of it.faqs) { const k = f.q.trim().toLowerCase(); allQ.set(k, [...(allQ.get(k) ?? []), `${it.id}/${it.lang}`]); }
const titles = new Map<string, number>(), descs = new Map<string, number>(), slugs = new Map<string, number>();
for (const it of items) { titles.set(it.title, (titles.get(it.title) ?? 0) + 1); descs.set(it.description, (descs.get(it.description) ?? 0) + 1); }
for (const g of GUIDES) for (const l of ['en', 'zh'] as const) if (g[l]) slugs.set(`${l}/${g[l]!.slug}`, (slugs.get(`${l}/${g[l]!.slug}`) ?? 0) + 1);

describe('fichiers de contenu', () => {
  for (const x of items.filter((y) => keep(y.id))) {
    describe(`${x.id} (${x.lang})`, () => {
      it('titre 50-60, terme clé d’abord, année, unique', () => {
        const [lo, hi] = x.lang === 'zh' ? [24, 40] : [50, 60];
        expect(x.title.length, x.title).toBeGreaterThanOrEqual(lo);
        expect(x.title.length, x.title).toBeLessThanOrEqual(hi);
        expect(x.title).toMatch(/2026/);
        expect(x.title).not.toMatch(/^(How|What|When|Why|Is|Are|Do|Does|Can|Should|Calculator|Simulator|Singapore|如何|什么|为什么|新加坡)/);
        expect(titles.get(x.title)).toBe(1);
      });
      it('description 150-160, année, unique', () => {
        const [lo, hi] = x.lang === 'zh' ? [70, 120] : [150, 160];
        expect(x.description.length, x.description).toBeGreaterThanOrEqual(lo);
        expect(x.description.length, x.description).toBeLessThanOrEqual(hi);
        expect(x.description).toMatch(/2026/);
        expect(descs.get(x.description)).toBe(1);
      });
      it('résumé : un paragraphe de 120 mots ou plus', () => {
        expect(words(x.resume), x.resume).toBeGreaterThanOrEqual(120);
        expect(x.resume).not.toMatch(/\n\s*\n|<p>/);
      });
      it(`corps : au moins ${x.minBody} mots de prose, tableaux à part`, () => { expect(words(text(x.body))).toBeGreaterThanOrEqual(x.minBody); });
      it('aucune tournure interdite ni tiret long', () => {
        const res = [...BANNED_ALL, ...(x.lang === 'en' ? BANNED_EN : BANNED_ZH)];
        for (const re of res) for (const part of [x.title, x.description, x.intro, x.resume, x.body, ...x.faqs.flatMap((f) => [f.q, f.a])]) expect(part, String(re)).not.toMatch(re);
      });
      it('FAQ : 3 à 5 questions, réponses de 40 à 90 mots, uniques sur le site', () => {
        expect(x.faqs.length).toBeGreaterThanOrEqual(3);
        expect(x.faqs.length).toBeLessThanOrEqual(5);
        for (const f of x.faqs) {
          if (x.lang === 'zh') {   // même mesure que check-trame : caractères hors espaces, 120 à 280
            const n = f.a.replace(/<[^>]+>/g, '').replace(/ /g, '').length;
            expect(n, `${f.q} (${n} car.)`).toBeGreaterThanOrEqual(120);
            expect(n, `${f.q} (${n} car.)`).toBeLessThanOrEqual(280);
          }
          expect(words(f.a), f.q).toBeGreaterThanOrEqual(40);
          expect(words(f.a), f.q).toBeLessThanOrEqual(90);
          expect(allQ.get(f.q.trim().toLowerCase()), f.q).toHaveLength(1);
        }
      });
      it('pages liées et minis existent', () => {
        for (const r of x.related) expect(ROUTES.some((y) => y.id === r) || PLANNED_IDS.has(r), r).toBe(true);
        for (const m of x.body.matchAll(/<!--mini:([A-Za-z0-9_]+)/g)) expect(TOOL_KINDS, m[1]).toContain(m[1]);
        expect(x.body.match(/<!--mini:/g)?.length ?? 0, 'au moins un mini-simulateur').toBeGreaterThanOrEqual(1);
        expect(x.body).not.toMatch(/undefined|NaN|\[object Object\]|\bnull\b|Infinity/);
        expect(x.resume + x.description + x.title + x.intro + JSON.stringify(x.faqs)).not.toMatch(/undefined|NaN|\bnull\b|Infinity/);
      });
    });
  }
  it('slugs uniques et sans accent', () => { for (const [k, n] of slugs) { expect(n, k).toBe(1); expect(k).toMatch(/^(en|zh)\/[a-z0-9-]+$/); } });
  it.skipIf(!!only.length)('chaque page prévue a son fichier', () => { for (const id of PLANNED_IDS) expect(ROUTES.some((x) => x.id === id), id).toBe(true); });
  it('sources des pages existantes', () => { const S = SOURCES('en'); for (const g of GUIDES) for (const s of g.sources) expect(S[s], `${g.id}: ${s}`).toBeTruthy(); });
  it('accueil : snippets, 6 à 8 questions par langue', () => { for (const l of ['en', 'zh'] as const) {
    const x = HOME[l]; const [tl, th, dl, dh] = l === 'zh' ? [24, 40, 70, 120] : [50, 60, 150, 160]; expect(x.title.length, x.title).toBeGreaterThanOrEqual(tl); expect(x.title.length, x.title).toBeLessThanOrEqual(th); expect(x.description.length, x.description).toBeGreaterThanOrEqual(dl); expect(x.description.length, x.description).toBeLessThanOrEqual(dh); for (const re of [...BANNED_ALL, ...(l === 'en' ? BANNED_EN : BANNED_ZH)]) for (const part of [x.title, x.description, x.intro, x.resume, x.valeur, x.why(helpers(l)), ...x.sections(helpers(l)).map((y) => y.html), ...x.faqs.flatMap((f) => [f.q, f.a])]) expect(part, String(re)).not.toMatch(re); expect(words(x.resume)).toBeGreaterThanOrEqual(120); expect(HOME[l].faqs.length).toBeGreaterThanOrEqual(6); expect(HOME[l].faqs.length).toBeLessThanOrEqual(8); for (const f of HOME[l].faqs) { if (l === 'zh') { const n = f.a.replace(/ /g, '').length; expect(n, `${f.q} (${n} car.)`).toBeGreaterThanOrEqual(120); expect(n).toBeLessThanOrEqual(280); } expect(words(f.a), f.q).toBeGreaterThanOrEqual(40); expect(words(f.a), f.q).toBeLessThanOrEqual(90); } } });
});

mkdirSync('.cache-raw', { recursive: true });
writeFileSync('.cache-raw/page-texts.json', JSON.stringify(Object.fromEntries(items.map((it) => [`${it.id}/${it.lang}`, { kind: it.lang, text: [it.intro, it.resume, text(it.body), ...it.faqs.flatMap((f) => [f.q, f.a])].join(' ') }]))));
