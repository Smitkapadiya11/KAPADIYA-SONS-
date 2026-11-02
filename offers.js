export const offers = [
  {
    id: "lions-cut",
    category: "ugc",
    name: "Lion’s Cut",
    price: 19999,
    featured: true,
    label: "UGC AI AD FILMS",
    items: ["4 high-level UGC ad films", "20 campaign images"],
    note: "For brands ready to make an entrance.",
  },
  {
    id: "architect",
    category: "property",
    name: "PinYourSite Plots",
    price: 50000,
    featured: true,
    label: "PINYOURSITE",
    items: [
      "Complete 3D informational web view",
      "All your client’s required project information",
    ],
    note: "Turn a property into an experience.",
  },
  {
    id: "apartments",
    category: "property",
    name: "PinYourSite Apartments",
    price: 50000,
    label: "APARTMENT EXPERIENCE",
    items: ["Interactive wings, floors and apartment plans", "Availability, gallery, location, brochure and unit enquiries"],
    note: "Guide a buyer from the elevation to an individual home.",
  },
  {
    id: "avatar-demo",
    category: "avatar",
    name: "Diamond’s Cut",
    price: null,
    label: "UGC AVATAR DEMO",
    items: [
      "Explore an AI avatar demo",
      "Discuss your face, voice and content direction",
    ],
    note: "Demo pricing confirmed on enquiry.",
  },
  {
    id: "cats-cut",
    category: "avatar",
    name: "Cat’s Cut",
    price: 25999,
    label: "REAL HUMAN CLONE",
    items: [
      "30 videos in 30 days",
      "Up to 30 seconds per video",
      "Your approved human clone",
    ],
    note: "Your face. Your voice. A month of content.",
  },
  {
    id: "monster",
    category: "ugc",
    name: "Monster Cut",
    price: 49999,
    label: "UGC AI AD FILMS",
    items: ["16 ultra-realistic videos", "Up to 40 seconds per video"],
    note: "Lifelike creative, built for a bigger campaign.",
  },
  {
    id: "fox",
    category: "systems",
    name: "Fox’s Cut",
    price: 29999,
    label: "AI SOFTWARE · APPS · WEBSITES",
    items: [
      "Complete working product in 20 days",
      "Lifetime hosting included for websites",
    ],
    note: "A clear scope. A working launch.",
  },
  {
    id: "arijit",
    category: "music",
    name: "Arijit’s Cut",
    price: 50999,
    label: "AI MUSIC VIDEOS",
    items: [
      "3 complete music videos",
      "2 minutes each · ultra-realistic direction",
    ],
    note: "Give your sound a world of its own.",
  },
  {
    id: "director",
    category: "film",
    name: "Director’s Cut",
    price: 251999,
    label: "AI SHORT FILMS",
    items: ["2 ultra-realistic short films", "5 minutes each"],
    note: "Bigger stories. Beautifully imagined.",
  },
];
export const money = (n) =>
  n === null
    ? "Let’s talk"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);
export const terms =
  "Prices are in INR. Confirm taxes, revisions, payment terms and delivery scope before booking. The 20-day build schedule begins after scope and required inputs are agreed. Lifetime hosting applies to websites; domain and third-party charges are confirmed separately. No payment is collected here.";
export const pageTitle =
  "KAPADIYA & SONS — Creative intelligence. Real momentum.";
export const description =
  "UGC AI ad films, human-clone avatar videos, PinYourSite property experiences, AI websites, apps, music videos and short films. Built by Kapadiya & Sons.";
export const booking = (p) =>
  "https://wa.me/917575807403?text=" +
  encodeURIComponent(
    "Hi Smit! I’m interested in " +
      p.name +
      (p.price === null ? " (avatar demo)" : " at " + money(p.price)) +
      ". " +
      p.items.join(". ") +
      ". My business: ___. Please share the next steps.",
  );
export const servicePricing = (category) =>
  offers
    .filter((p) => p.category === category)
    .map(
      (p) => p.name + ": " + money(p.price) + ". " + p.items.join(". ") + ".",
    )
    .join(" ");
export const offerSchema = () => ({
  "@context": "https://schema.org",
  "@graph": offers
    .filter((p) => p.price !== null)
    .map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price,
      priceCurrency: "INR",
      url: "https://www.kapadiya.tech/#offer-" + p.id,
      description: p.items.join(". "),
      seller: { "@type": "Organization", name: "KAPADIYA & SONS" },
    })),
});
export const renderOffers = () =>
  offers
    .map(
      (p) =>
        '<article class="plan ' +
        (p.featured ? "featured" : "") +
        '" id="offer-' +
        p.id +
        '" data-category="' +
        p.category +
        '"><div class="plan-top"><span class="eyebrow">' +
        p.label +
        '</span><span aria-hidden="true">' +
        (p.featured ? "✳" : "↗") +
        "</span></div><h3>" +
        p.name +
        "</h3><p>" +
        p.note +
        '</p><div class="plan-price">' +
        money(p.price) +
        "<small>" +
        (p.price === null ? "DEMO ENQUIRY" : "INR / PACKAGE") +
        "</small></div><ul>" +
        p.items.map((i) => "<li>" + i + "</li>").join("") +
        '</ul><a class="button ' +
        (p.featured ? "lime" : "outline") +
        '" href="' +
        booking(p) +
        '" target="_blank" rel="noopener noreferrer">' +
        (p.price === null ? "Request a demo" : "Discuss this cut") +
        ' <span aria-hidden="true">↗</span></a></article>',
    )
    .join("");
