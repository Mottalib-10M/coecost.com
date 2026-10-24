import type { Locale } from './routes';
const en = {
  updatedOn: 'Data read on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Prepared by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Questions people ask', relatedCalculators: 'Next calculation', sourcesTitle: 'Official sources for this page', writtenBy: 'Prepared by',
  asOf: 'Rules', lastUpdated: 'COE results read on',
  footerValidated: 'COE results from data.gov.sg after each exercise · tax rules read on LTA OneMotoring',
  oglText: 'Contains information from COE Bidding Results / Prices (Land Transport Authority) and Motor Vehicle Quota, Quota Premium And Prevailing Quota Premium, Monthly (Singapore Department of Statistics, source: Land Transport Authority), accessed on 24 October 2026 from data.gov.sg, made available under the terms of the', oglName: 'Singapore Open Data Licence version 1.0', oglHref: 'https://data.gov.sg/open-data-licence',
  footerBrowser: 'Every figure is computed in your browser · no sign-up, no phone number, no dealer',
  footerDisclaimer: 'Independent site published by Radif Partners. It is not the Land Transport Authority, has no link with LTA or any government agency, and is not endorsed by them. Estimates for guidance only; the amounts LTA bills you are the ones that count.',
  footerPopular: 'Most used',
  notFound: 'Nothing lives at this address. The home page shows the latest COE results and what a car costs once ARF, COE, road tax and the rebates are counted.',
  readMore: 'Read the full answer',
  moreOptions: 'More options', copyLink: 'Copy share link', copied: 'Link copied', print: 'Print', howComputed: 'How this is computed', openFull: 'Open the full calculator',
};
const zh: typeof en = {
  updatedOn: '数据读取于', editorialPolicy: '编辑方针', contactLabel: '联系', reviewedBy: '编写',
  skipToContent: '跳到正文', mainNav: '主导航', breadcrumbLabel: '页面路径', breadcrumbHome: '首页', menuOpen: '打开菜单',
  faqTitle: '常见问题', relatedCalculators: '接着算', sourcesTitle: '本页的官方来源', writtenBy: '编写',
  asOf: '规则', lastUpdated: '拥车证结果读取于',
  footerValidated: '拥车证结果于每轮竞标后取自 data.gov.sg · 税费规则依据陆路交通管理局 OneMotoring',
  oglText: '本站包含2026年10月24日取自 data.gov.sg 的“COE Bidding Results / Prices”（陆路交通管理局）及“Motor Vehicle Quota, Quota Premium And Prevailing Quota Premium, Monthly”（新加坡统计局，数据来源：陆路交通管理局）数据，依据以下许可证提供：', oglName: '新加坡开放数据许可证 1.0 版', oglHref: 'https://data.gov.sg/open-data-licence',
  footerBrowser: '所有数字都在您的浏览器中计算 · 无需注册、无需电话、不推销车行',
  footerDisclaimer: '本站由 Radif Partners 独立发布，并非陆路交通管理局，与该局或任何政府机构无关，也未获其认可。数字仅供参考，一切以陆路交通管理局实际收取的金额为准。',
  footerPopular: '常用页面',
  notFound: '此地址没有页面。首页列出最新拥车证结果，以及计入附加注册费、拥车证、路税和回扣后一辆车的真实成本。',
  readMore: '展开全文',
  moreOptions: '更多选项', copyLink: '复制分享链接', copied: '链接已复制', print: '打印', howComputed: '计算方法', openFull: '打开完整计算器',
};
export function t(lang: Locale) { return lang === 'zh' ? zh : en; }
