import { defineConfig } from "vite";
import {
  booking,
  offers,
  renderOffers,
  offerSchema,
  pageTitle,
  description,
  terms,
} from "./offers.js";
export default defineConfig({
  build: {
    rollupOptions: { preserveEntrySignatures: "exports-only",
      input: {main:'index.html','flat-web':'flat-web.js'},
      output: { entryFileNames: entry => entry.name==='flat-web' ? 'flat-web.js' : 'assets/[name]-[hash].js', manualChunks: { spatial: ['three'] } },
    },
  },
  plugins: [
    {
      name: "content-data",
      transformIndexHtml(html) {
        return html
          .replaceAll("__PLOTS_CONTACT__", booking(offers.find(p => p.id === "architect")))
          .replaceAll("__APARTMENTS_CONTACT__", booking(offers.find(p => p.id === "apartments")))
          .replaceAll("__OFFERS__", renderOffers())
          .replaceAll("__PAGE_TITLE__", pageTitle)
          .replaceAll("__DESCRIPTION__", description)
          .replaceAll("__TERMS__", terms)
          .replaceAll("__OFFER_SCHEMA__", JSON.stringify(offerSchema()));
      },
    },
  ],
});

