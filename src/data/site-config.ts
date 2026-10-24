/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://coecost.com";
export const SITE_NAMES: Record<string, string> = {"en": "COE Cost", "zh": "新加坡拥车成本"};
export const LANG_TAGS: Record<string, string> = {"en": "en-SG", "zh": "zh-SG"};
export const OG_LOCALES: Record<string, string> = {"en": "en_SG", "zh": "zh_SG"};
export const LOCALE_TAG = 'en-SG';
export const CURRENCY = 'SGD';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-24';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"en": "Independent publisher of car cost calculators for Singapore · COE, ARF, PARF, road tax", "zh": "新加坡购车与拥车成本计算器的独立发布方 · 拥车证、附加注册费、PARF 回扣、路税"};
export const AUTHOR_DESC: Record<string, string> = {"en": "Radif Partners rebuilds the full price of a car in Singapore from the rules the Land Transport Authority publishes: tiered ARF on the OMV, VES and EEAI adjustments, the COE premium of each bidding exercise, road tax by engine capacity or motor power, and the PARF and COE rebates you get back when the car is deregistered. COE results are read from data.gov.sg after every exercise. The site sells no car, loan or insurance, links to no dealer and asks for no e-mail or phone number.", "zh": "Radif Partners 依据陆路交通管理局公布的规则，计算一辆车在新加坡的完整成本：按公开市场价值分级征收的附加注册费、车辆排放计划与电动车早期采用奖励、每轮竞标的拥车证价格、按排量或电机功率计算的路税，以及注销时可取回的 PARF 与拥车证回扣。拥车证结果在每轮竞标后从 data.gov.sg 读取。本站不卖车、不卖贷款或保险，不链接任何车行，也不索取电邮或电话。"};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"en": ["Certificate of Entitlement (COE) bidding results", "Prevailing Quota Premium and COE renewal", "Additional Registration Fee tiers on Open Market Value", "PARF and COE rebates at deregistration", "Singapore road tax for petrol, hybrid and electric cars", "Vehicular Emissions Scheme and EV Early Adoption Incentive", "Car depreciation in Singapore"], "zh": ["拥车证竞标结果", "拥车证续期与预定市场价格（PQP）", "附加注册费分级", "注销时的 PARF 与拥车证回扣", "新加坡路税", "车辆排放计划与电动车奖励", "新加坡汽车折旧"]};
export const CONTACT_EMAIL = "contact@coecost.com";
export const THEME_COLOR = '#B3122E';
export const LOGO_SYMBOL = 'COE';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = 'G-Z4KVKWVFDH';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z2woyzdr5c';
export const INDEXNOW_KEY = '33ca1558663a59958193c2e10ab13d81';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // vide : comme sur les autres sites du portefeuille
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "VAT",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
