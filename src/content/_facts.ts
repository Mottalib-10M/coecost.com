/**
 * Exemples chiffrés partagés par les pages (accueil et guides), calculés par le moteur à partir des données :
 * aucun montant n'est tapé à la main. Fichier préfixé « _ » : non chargé comme page par src/lib/pages.ts.
 */
import { upfront, parfRebate, coeRebate, roadTaxAnnual, grossArf, renewalCost, type Exercise } from '../lib/engine/car-cost';
import { LATEST, PREVIOUS, premium, change, stats, record, yearly, PQP_NEXT, PQP_OFFICIAL, bidRatio, type Cat } from '../lib/data';

export const LATEST_EX: Exercise = { year: Number(LATEST.month.slice(0, 4)), month: Number(LATEST.month.slice(5, 7)), round: LATEST.round };
export const REG_YEAR = 2026;

/** Voiture de catégorie A type : OMV 30 000, essence 1 496 cc, bande VES B. */
export const CAR_A = (() => {
  const omv = 30000, coe = premium(LATEST, 'A');
  const u = upfront({ omv, coePremium: coe, band: 'B', regYear: REG_YEAR, fuel: 'petrol', coe: LATEST_EX });
  const rt = roadTaxAnnual({ fuel: 'petrol', cc: 1496 }).total;
  const parf10 = parfRebate(u.parfBase, 10, 'from2026'), parf5 = parfRebate(u.parfBase, 5, 'from2026');
  const coeBack5 = coeRebate(coe, 60);
  const perYear10 = (u.basicWithCoe - parf10 + rt * 10) / 10;
  const perYear5 = (u.basicWithCoe - parf5 - coeBack5 + rt * 5) / 5;
  return { omv, cc: 1496, coe, u, rt, parf10, parf5, coeBack5, perYear10, perYear5, coeShare: coe / u.basicWithCoe };
})();
/** Voiture de catégorie B type : OMV 60 000, essence 1 998 cc, bande VES C1. */
export const CAR_B = (() => {
  const omv = 60000, coe = premium(LATEST, 'B');
  const u = upfront({ omv, coePremium: coe, band: 'C1', regYear: REG_YEAR, fuel: 'petrol', coe: LATEST_EX });
  const rt = roadTaxAnnual({ fuel: 'petrol', cc: 1998 }).total;
  return { omv, cc: 1998, coe, u, rt };
})();
export const ARF_AT = (omv: number) => grossArf(omv, 'from2023');
export { LATEST, PREVIOUS, premium, change, stats, record, yearly, PQP_NEXT, PQP_OFFICIAL, bidRatio, renewalCost };
export type { Cat };
