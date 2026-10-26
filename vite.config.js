import { defineConfig } from 'vite';
import { renderOffers,renderHighlights,offerSchema,offers,money,pageTitle,description,terms } from './offers.js';
export default defineConfig({plugins:[{name:'content-data',transformIndexHtml(html){
 let page=html.replaceAll('__OFFERS__',renderOffers()).replaceAll('__HIGHLIGHTS__',renderHighlights()).replaceAll('__START_PRICE__',money(offers[0].price)).replaceAll('__PAGE_TITLE__',pageTitle).replaceAll('__DESCRIPTION__',description).replaceAll('__TERMS__',terms).replaceAll('__OFFER_SCHEMA__',JSON.stringify(offerSchema()));
 if(process.env.VERCEL_ENV==='preview'&&process.env.VERCEL_URL){page=page.replace('https://www.kapadiya.tech/images/light/share-card.webp',`https://${process.env.VERCEL_URL}/images/light/share-card.webp`).replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');}
 return page;
}}]});
