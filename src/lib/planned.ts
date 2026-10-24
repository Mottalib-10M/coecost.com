/** Toutes les pages prévues (id = nom du fichier de src/content/guides). Les tests de contenu acceptent un lien
 *  vers ces ids pendant la rédaction ; le test « toutes les pages existent » échoue tant qu'il manque un fichier. */
export const PLANNED_GUIDES = [
  // COE : résultats, enchères, catégories, PQP
  'coe-results', 'coe-bidding', 'coe-cat-a', 'coe-cat-b', 'motorcycle-coe', 'pqp',
  // Acheter : ARF, OMV, VES, prêt
  'arf', 'omv', 'ves', 'car-loan',
  // Posséder : road tax, coût annuel
  'road-tax', 'road-tax-renewal', 'ev-road-tax', 'cost-of-owning',
  // Fin de vie : renouveler, rebates, casse
  'coe-renewal', 'coe-rebate', 'parf-rebate', 'scrap-car',
];
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, 'home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies']);
