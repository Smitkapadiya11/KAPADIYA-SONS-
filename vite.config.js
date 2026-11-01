import { defineConfig } from "vite";
import {
  renderOffers,
  offerSchema,
  pageTitle,
  description,
  terms,
} from "./offers.js";
export default defineConfig({
  build: {
    rollupOptions: {
      output: { manualChunks: { spatial: ['three'] } },
    },
  },
  plugins: [
    {
      name: "content-data",
      transformIndexHtml(html) {
        return html
          .replaceAll("__OFFERS__", renderOffers())
          .replaceAll("__PAGE_TITLE__", pageTitle)
          .replaceAll("__DESCRIPTION__", description)
          .replaceAll("__TERMS__", terms)
          .replaceAll("__OFFER_SCHEMA__", JSON.stringify(offerSchema()));
      },
    },
  ],
});
