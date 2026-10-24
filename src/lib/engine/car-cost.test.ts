import { describe, it, expect } from 'vitest';
import {
  grossArf, arfRegime, parfRegime, parfRate, parfRebate, unusedCoeMonths, coeRebate,
  roadTaxAnnual, roadTaxSurcharge, renewalCost, upfront, netArf, eeai, ownership, renewOrScrap, ageYears,
} from './car-cost';

// Cas de contrôle : lignes de la liste LTA « Car Cost Update » (M032, août 2026), relevée le 2026-10-24.
describe('ARF par tranches (barème depuis février 2023)', () => {
  it('Audi A3 Sedan 1.5 TFSI : OMV 24 058 → ARF 25 682', () => expect(grossArf(24058)).toBe(25682));
  it('Audi A6 Sedan : OMV 40 646 → ARF 49 228', () => expect(grossArf(40646)).toBe(49228));
  it('Audi Q6 e-tron : OMV 54 252 → ARF 75 079', () => expect(grossArf(54252)).toBe(75079));
  it('Avatr 11 : OMV 63 539 → ARF 94 848', () => expect(grossArf(63539)).toBe(94848));
  it('tranche haute : OMV 100 000 → 20 000 + 28 000 + 38 000 + 50 000 + 64 000', () => expect(grossArf(100000)).toBe(200000));
  it('ancien barème : OMV 100 000 → 20 000 + 42 000 + 54 000 + 44 000', () => expect(grossArf(100000, 'pre2023')).toBe(160000));
  it('OMV nulle → 0', () => expect(grossArf(0)).toBe(0));
});

describe('régimes selon l’exercice COE', () => {
  it('1er exercice de février 2023 = ancien ARF', () => expect(arfRegime({ year: 2023, month: 2, round: 1 })).toBe('pre2023'));
  it('2e exercice de février 2023 = nouvel ARF', () => expect(arfRegime({ year: 2023, month: 2, round: 2 })).toBe('from2023'));
  it('PARF : 1er exercice de février 2026 = plafond 60 000', () => expect(parfRegime({ year: 2026, month: 2, round: 1 })).toBe('y2023to2026'));
  it('PARF : 2e exercice de février 2026 = nouveau barème', () => expect(parfRegime({ year: 2026, month: 2, round: 2 })).toBe('from2026'));
  it('PARF : 2022 = ancien barème sans plafond', () => expect(parfRegime({ year: 2022, month: 6, round: 1 })).toBe('pre2023'));
});

describe('PARF rebate', () => {
  it('bornes d’âge', () => {
    expect(parfRate(5, 'from2026')).toBe(0.3);
    expect(parfRate(5.01, 'from2026')).toBe(0.25);
    expect(parfRate(10, 'from2026')).toBe(0.05);
    expect(parfRate(10.01, 'from2026')).toBe(0);
    expect(parfRate(3, 'pre2023')).toBe(0.75);
  });
  // Exemple LTA (annexe A du communiqué du 12/02/2026) : ARF 200 000, radiée entre 5 et 6 ans.
  it('exemple LTA, nouveau barème : 25 % × 200 000 = 50 000 → plafond 30 000', () => expect(parfRebate(200000, 5.5, 'from2026')).toBe(30000));
  it('exemple LTA, barème précédent : 70 % × 200 000 = 140 000 → plafond 60 000', () => expect(parfRebate(200000, 5.5, 'y2023to2026')).toBe(60000));
  it('sans plafond avant 2023', () => expect(parfRebate(200000, 5.5, 'pre2023')).toBe(140000));
  it('au-delà de 10 ans : rien', () => expect(parfRebate(50000, 11, 'pre2023')).toBe(0));
});

describe('COE rebate', () => {
  // Exemple de la page OneMotoring « PARF & COE Rebate ».
  it('mois non utilisés : radiation 2 janv. 2013, expiration 5 juin 2015 → 29,1', () => expect(unusedCoeMonths('2013-01-02', '2015-06-05')).toBeCloseTo(29.1, 5));
  it('rebate : 16 897 × 29,1 / 120 = 4 097', () => expect(coeRebate(16897, 29.1)).toBe(4097));
  it('COE expiré → 0 mois', () => expect(unusedCoeMonths('2026-10-24', '2026-10-01')).toBe(0));
});

describe('road tax', () => {
  it('1 598 cc : 2 × (250 + 0,375 × 598) × 0,782 = 741,73', () => expect(roadTaxAnnual({ fuel: 'petrol', cc: 1598 }).total).toBeCloseTo(741.73, 2));
  it('600 cc : 2 × 200 × 0,782 = 312,80', () => expect(roadTaxAnnual({ fuel: 'petrol', cc: 600 }).total).toBeCloseTo(312.8, 2));
  it('1 998 cc : 2 × (475 + 0,75 × 398) × 0,782', () => expect(roadTaxAnnual({ fuel: 'petrol', cc: 1998 }).total).toBeCloseTo(2 * (475 + 0.75 * 398) * 0.782, 2));
  it('électrique 100 kW : road tax + AFC 700', () => {
    const r = roadTaxAnnual({ fuel: 'ev', kw: 100 });
    expect(r.afc).toBe(700);
    expect(r.total).toBeCloseTo(2 * (250 + 3.75 * 70) * 0.782 + 700, 2);
  });
  it('hybride : le plus élevé des deux calculs', () => {
    const cc = roadTaxAnnual({ fuel: 'petrol', cc: 1497 }).base;
    expect(roadTaxAnnual({ fuel: 'hybrid', cc: 1497, kw: 50 }).base).toBe(Math.max(cc, roadTaxAnnual({ fuel: 'ev', kw: 50 }).base));
  });
  it('majoration d’âge', () => {
    expect(roadTaxSurcharge(10)).toBe(0);
    expect(roadTaxSurcharge(10.5)).toBe(0.1);
    expect(roadTaxSurcharge(14.2)).toBe(0.5);
    expect(roadTaxAnnual({ fuel: 'petrol', cc: 1598, age: 12.5 }).surcharge).toBeCloseTo(741.73 * 0.3, 1);
  });
});

describe('VES, EEAI et coût de base (liste LTA M032)', () => {
  it('EEAI 2026 plafonné à 7 500', () => expect(eeai(75079, 2026, 'ev')).toBe(7500));
  it('EEAI supprimé en 2027', () => expect(eeai(75079, 2027, 'ev')).toBe(0));
  it('VES C1 2026 : +7 500', () => expect(netArf(25682, 'C1', 2026, 'petrol').net).toBe(33182));
  it('PARF calculé sans la surcharge VES (LTA)', () => expect(netArf(25682, 'C1', 2026, 'petrol').parfBase).toBe(25682));
  it('PARF calculé après le rebate VES', () => expect(netArf(30000, 'A', 2026, 'petrol').parfBase).toBe(7500));
  it('Audi A3 : coût de base sans COE 64 999,86', () => {
    const u = upfront({ omv: 24058, coePremium: 123890, band: 'C1', regYear: 2026, fuel: 'hybrid', coe: { year: 2026, month: 8, round: 1 } });
    expect(u.basicWithoutCoe).toBeCloseTo(64999.86, 2);
    expect(u.basicWithCoe).toBeCloseTo(188889.86, 2);
  });
  it('Audi Q6 e-tron : VES A −22 500, EEAI −7 500, coût de base 116 390,62', () => {
    const u = upfront({ omv: 54252, coePremium: 129910, band: 'A', regYear: 2026, fuel: 'ev', coe: { year: 2026, month: 8, round: 1 } });
    expect(u.ves).toBe(-22500);
    expect(u.eeai).toBe(7500);
    expect(u.basicWithoutCoe).toBeCloseTo(116390.62, 2);
  });
  it('plancher de 5 000 $ pour une thermique à fort rebate', () => expect(netArf(6000, 'A', 2026, 'hybrid').net).toBe(5000));
  it('plancher à 0 pour une électrique', () => expect(netArf(6000, 'A', 2026, 'ev').net).toBe(0));
});

describe('renouvellement et possession', () => {
  it('5 ans = 50 % du PQP arrondi au dollar supérieur', () => expect(renewalCost(129883, 5)).toBe(64942));
  it('10 ans = PQP', () => expect(renewalCost(129883, 10)).toBe(129883));
  it('renouveler à 10 ans fait perdre le PARF', () => {
    const r = renewOrScrap({ pqp: 129883, netArfPaid: 40000, parf: 'y2023to2026', years: 10 });
    expect(r.parfLost).toBe(20000);
    expect(r.effective).toBe(149883);
  });
  it('possession 10 ans : dépréciation = prix − PARF', () => {
    const o = ownership({ price: 200000, coePaid: 130000, netArfPaid: 40000, parf: 'from2026', yearsKept: 10, roadTaxPerYear: 742 });
    expect(o.parf).toBe(2000);
    expect(o.coeRebate).toBe(0);
    expect(o.depreciation).toBe(198000);
    expect(o.perYear).toBeCloseTo(20542, 0);
  });
  it('âge décimal', () => expect(ageYears('2020-01-01', '2025-01-01')).toBe(5));
});
