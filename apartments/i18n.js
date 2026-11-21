import "@fontsource/noto-sans-gujarati/gujarati-400.css";
import "@fontsource/noto-sans-gujarati/gujarati-600.css";
import "@fontsource/noto-sans-devanagari/devanagari-400.css";
import "@fontsource/noto-sans-devanagari/devanagari-600.css";

// Every visible string, as [English, ગુજરાતી, हिन्दी]. {n}-style tokens are filled by t().
const S = {
  "doc.title": ["PinYourSite Apartments | 3D Residence Explorer", "PinYourSite એપાર્ટમેન્ટ્સ | 3D રેસિડેન્સ એક્સપ્લોરર", "PinYourSite अपार्टमेंट्स | 3D रेज़िडेंस एक्सप्लोरर"],
  "brand.sub": ["APARTMENTS · KAPADIYA & SONS", "એપાર્ટમેન્ટ્સ · કાપડિયા એન્ડ સન્સ", "अपार्टमेंट्स · कपाड़िया एंड संस"],
  "demo": ["Demo project", "ડેમો પ્રોજેક્ટ", "डेमो प्रोजेक्ट"],
  "lang.label": ["Language", "ભાષા", "भाषा"],
  "loading": ["Raising three towers in 3D…", "ત્રણ ટાવર 3D માં તૈયાર થઈ રહ્યા છે…", "तीन टावर 3D में तैयार हो रहे हैं…"],
  "loading.fail": ["3D could not start on this device. Showing the elevation.", "આ ડિવાઇસ પર 3D શરૂ ન થયું. એલિવેશન બતાવી રહ્યા છીએ.", "इस डिवाइस पर 3D शुरू नहीं हुआ। एलिवेशन दिखा रहे हैं।"],
  "hint.overview": ["Drag to orbit · Pinch to zoom · Tap a tower", "ફેરવવા ખેંચો · ઝૂમ માટે પિંચ કરો · ટાવર પર ટેપ કરો", "घुमाने के लिए खींचें · ज़ूम के लिए पिंच करें · टावर पर टैप करें"],
  "hint.wing": ["Tap any window to open that flat, or pick a floor", "ફ્લેટ ખોલવા કોઈપણ બારી પર ટેપ કરો, અથવા માળ પસંદ કરો", "फ़्लैट खोलने के लिए किसी भी खिड़की पर टैप करें, या मंज़िल चुनें"],
  "hint.balcony": ["Drag to look around from this balcony", "આ બાલ્કનીથી આસપાસ જોવા ખેંચો", "इस बालकनी से चारों ओर देखने के लिए खींचें"],
  "world.label": ["Interactive 3D view of three residential towers. Choose a wing, a floor and an apartment.", "ત્રણ રહેણાંક ટાવરનો ઇન્ટરેક્ટિવ 3D વ્યૂ. વિંગ, માળ અને એપાર્ટમેન્ટ પસંદ કરો.", "तीन आवासीय टावरों का इंटरैक्टिव 3D व्यू। विंग, मंज़िल और अपार्टमेंट चुनें।"],
  "wings.label": ["Tower navigation", "ટાવર નેવિગેશન", "टावर नेविगेशन"],
  "wings.all": ["All wings", "બધી વિંગ", "सभी विंग"],
  "wing": ["Wing {n}", "વિંગ {n}", "विंग {n}"],
  "wing.available": ["{n} available", "{n} ઉપલબ્ધ", "{n} उपलब्ध"],
  "floors": ["Floors", "માળ", "मंज़िलें"],
  "floors.label": ["Floor navigation", "માળ નેવિગેશન", "मंज़िल नेविगेशन"],
  "floor": ["Floor {n}", "માળ {n}", "मंज़िल {n}"],
  "status.available": ["Available", "ઉપલબ્ધ", "उपलब्ध"],
  "status.hold": ["On hold", "હોલ્ડ પર", "होल्ड पर"],
  "status.builder_hold": ["Builder hold", "બિલ્ડર હોલ્ડ", "बिल्डर होल्ड"],
  "status.sold": ["Sold", "વેચાયેલ", "बिक चुका"],
  "legend": ["Availability", "ઉપલબ્ધતા", "उपलब्धता"],
  "legend.label": ["Colour every window by availability", "દરેક બારીને ઉપલબ્ધતા મુજબ રંગો", "हर खिड़की को उपलब्धता के अनुसार रंगें"],
  "mode.label": ["Lighting", "પ્રકાશ", "रोशनी"],
  "mode.day": ["Day", "દિવસ", "दिन"],
  "mode.dusk": ["Night", "રાત", "रात"],
  "sample": ["Sample flat", "નમૂનાનો ફ્લેટ", "सैंपल फ़्लैट"],
  "reset": ["Reset view", "વ્યૂ રીસેટ કરો", "व्यू रीसेट करें"],
  "share": ["Share", "શેર કરો", "शेयर करें"],
  "share.project": ["Share this view", "આ વ્યૂ શેર કરો", "यह व्यू शेयर करें"],
  "share.copy": ["Copy this link", "આ લિંક કૉપિ કરો", "यह लिंक कॉपी करें"],
  "copied": ["Link copied. Share this view with your client.", "લિંક કૉપિ થઈ. આ વ્યૂ તમારા ગ્રાહક સાથે શેર કરો.", "लिंक कॉपी हो गया। यह व्यू अपने ग्राहक के साथ शेयर करें।"],
  "close": ["Close", "બંધ કરો", "बंद करें"],
  "type.3 BHK Luxury": ["3 BHK Luxury", "3 BHK લક્ઝરી", "3 BHK लग्ज़री"],
  "type.2 BHK Premium": ["2 BHK Premium", "2 BHK પ્રીમિયમ", "2 BHK प्रीमियम"],
  "facing.East": ["East facing", "પૂર્વમુખી", "पूर्वमुखी"],
  "facing.West": ["West facing", "પશ્ચિમમુખી", "पश्चिममुखी"],
  "facing.North": ["North facing", "ઉત્તરમુખી", "उत्तरमुखी"],
  "facing.South": ["South facing", "દક્ષિણમુખી", "दक्षिणमुखी"],
  "carpet": ["Carpet area", "કાર્પેટ એરિયા", "कारपेट एरिया"],
  "sqft": ["sq ft", "ચો. ફૂટ", "वर्ग फुट"],
  "beds": ["Bedrooms", "બેડરૂમ", "बेडरूम"],
  "baths": ["Baths", "બાથરૂમ", "बाथरूम"],
  "parking": ["Parking", "પાર્કિંગ", "पार्किंग"],
  "facing": ["Facing", "દિશા", "दिशा"],
  "unit.flat": ["Flat", "ફ્લેટ", "फ़्लैट"],
  "unit.tour": ["Enter 3D sample flat ↗", "3D નમૂનાનો ફ્લેટ જુઓ ↗", "3D सैंपल फ़्लैट देखें ↗"],
  "unit.balcony": ["Balcony view", "બાલ્કની વ્યૂ", "बालकनी व्यू"],
  "unit.balconyExit": ["Back to floor plan", "માળના પ્લાન પર પાછા", "मंज़िल के प्लान पर वापस"],
  "unit.enquire": ["Enquire on WhatsApp ↗", "WhatsApp પર પૂછો ↗", "WhatsApp पर पूछें ↗"],
  "unit.prev": ["Previous flat", "પાછલો ફ્લેટ", "पिछला फ़्लैट"],
  "unit.next": ["Next flat", "આગળનો ફ્લેટ", "अगला फ़्लैट"],
  "unit.sampleNote": ["Furnished sample interior: 2 BHK B-102. Layouts differ by wing.", "ફર્નિશ્ડ નમૂનાનું ઇન્ટિરિયર: 2 BHK B-102. વિંગ પ્રમાણે લેઆઉટ અલગ છે.", "फ़र्निश्ड सैंपल इंटीरियर: 2 BHK B-102। विंग के अनुसार लेआउट अलग है।"],
  "unit.fine": ["Demonstration inventory. Not live availability.", "ડેમો ઇન્વેન્ટરી. લાઇવ ઉપલબ્ધતા નથી.", "डेमो इन्वेंटरी। लाइव उपलब्धता नहीं।"],
  "tools.label": ["Project tools", "પ્રોજેક્ટ ટૂલ્સ", "प्रोजेक्ट टूल्स"],
  "tool.search": ["Search", "શોધો", "खोजें"],
  "tool.details": ["Details", "વિગતો", "विवरण"],
  "tool.gallery": ["Gallery", "ગેલેરી", "गैलरी"],
  "tool.nearby": ["Nearby", "નજીકમાં", "आसपास"],
  "tool.gps": ["GPS", "નકશો", "नक्शा"],
  "tool.brochure": ["Brochure", "બ્રોશર", "ब्रोशर"],
  "search.title": ["Find an apartment", "એપાર્ટમેન્ટ શોધો", "अपार्टमेंट खोजें"],
  "search.placeholder": ["Wing or flat number (e.g. B-102)", "વિંગ અથવા ફ્લેટ નંબર (દા.ત. B-102)", "विंग या फ़्लैट नंबर (जैसे B-102)"],
  "search.none": ["No matching apartments.", "કોઈ એપાર્ટમેન્ટ મળ્યો નહીં.", "कोई अपार्टमेंट नहीं मिला।"],
  "search.onlyAvailable": ["Only available", "માત્ર ઉપલબ્ધ", "केवल उपलब्ध"],
  "details.title": ["Project overview", "પ્રોજેક્ટની ઝાંખી", "प्रोजेक्ट का अवलोकन"],
  "details.about": ["About project", "પ્રોજેક્ટ વિશે", "प्रोजेक्ट के बारे में"],
  "details.aboutText": ["A residential community in Olpad, Surat. Explore three high-rise wings around landscaped gardens, a clubhouse and swimming pool.", "ઓલપાડ, સુરતમાં એક રહેણાંક સમુદાય. લેન્ડસ્કેપ બગીચા, ક્લબહાઉસ અને સ્વિમિંગ પૂલની આસપાસ ત્રણ હાઇ-રાઇઝ વિંગ જુઓ.", "ओलपाड, सूरत में एक आवासीय समुदाय। लैंडस्केप बगीचों, क्लबहाउस और स्विमिंग पूल के आसपास तीन हाई-राइज़ विंग देखें।"],
  "details.location": ["Site location", "સાઇટ લોકેશન", "साइट लोकेशन"],
  "details.place": ["Olpad, Surat, Gujarat", "ઓલપાડ, સુરત, ગુજરાત", "ओलपाड, सूरत, गुजरात"],
  "details.area": ["Total area", "કુલ ક્ષેત્રફળ", "कुल क्षेत्रफल"],
  "details.areaValue": ["237,473 sq ft", "2,37,473 ચો. ફૂટ", "2,37,473 वर्ग फुट"],
  "details.units": ["Total units", "કુલ યુનિટ", "कुल यूनिट"],
  "details.unitsValue": ["264 apartments", "264 એપાર્ટમેન્ટ", "264 अपार्टमेंट"],
  "details.amenities": ["Premium amenities", "પ્રીમિયમ સુવિધાઓ", "प्रीमियम सुविधाएँ"],
  "details.links": ["Official links", "સત્તાવાર લિંક્સ", "आधिकारिक लिंक"],
  "details.connect": ["Interested? Connect now", "રસ છે? હમણાં સંપર્ક કરો", "रुचि है? अभी संपर्क करें"],
  "amenity.0": ["Swimming pool", "સ્વિમિંગ પૂલ", "स्विमिंग पूल"],
  "amenity.1": ["Central clubhouse", "સેન્ટ્રલ ક્લબહાઉસ", "सेंट्रल क्लबहाउस"],
  "amenity.2": ["Tennis court", "ટેનિસ કોર્ટ", "टेनिस कोर्ट"],
  "amenity.3": ["Grand entrance gate", "ભવ્ય પ્રવેશદ્વાર", "भव्य प्रवेश द्वार"],
  "amenity.4": ["Wide RCC roads", "પહોળા RCC રસ્તા", "चौड़ी RCC सड़कें"],
  "amenity.5": ["Facade & landscape lighting", "ફસાડ અને લેન્ડસ્કેપ લાઇટિંગ", "फ़साड और लैंडस्केप लाइटिंग"],
  "amenity.6": ["Lush green gardens", "હરિયાળા બગીચા", "हरे-भरे बगीचे"],
  "amenity.7": ["Jogging track", "જોગિંગ ટ્રેક", "जॉगिंग ट्रैक"],
  "amenity.8": ["Rooftop spaces", "રૂફટોપ જગ્યાઓ", "रूफ़टॉप जगहें"],
  "amenity.9": ["Drop-off zones", "ડ્રોપ-ઑફ ઝોન", "ड्रॉप-ऑफ़ ज़ोन"],
  "nearby.title": ["Nearby locations", "નજીકના સ્થળો", "आसपास के स्थान"],
  "mins": ["{n} mins", "{n} મિનિટ", "{n} मिनट"],
  "km": ["{n} km", "{n} કિમી", "{n} किमी"],
  "cat.School": ["School", "શાળા", "स्कूल"],
  "cat.Hospital": ["Hospital", "હોસ્પિટલ", "अस्पताल"],
  "cat.Highway": ["Highway", "હાઇવે", "हाईवे"],
  "cat.Metro/Railway": ["Metro / railway", "મેટ્રો / રેલવે", "मेट्रो / रेलवे"],
  "cat.Airport": ["Airport", "એરપોર્ટ", "एयरपोर्ट"],
  "cat.Mall/Market": ["Mall / market", "મોલ / બજાર", "मॉल / बाज़ार"],
  "cat.Other": ["Landmark", "સીમાચિહ્ન", "प्रमुख स्थान"],
  "place.Olpad Primary & High School": ["Olpad Primary & High School", "ઓલપાડ પ્રાથમિક અને હાઇસ્કૂલ", "ओलपाड प्राथमिक और हाई स्कूल"],
  "place.Olpad Community Health Centre (CHC)": ["Olpad Community Health Centre (CHC)", "ઓલપાડ સામુદાયિક આરોગ્ય કેન્દ્ર (CHC)", "ओलपाड सामुदायिक स्वास्थ्य केंद्र (CHC)"],
  "place.Sanjivani Multispeciality Hospital": ["Sanjivani Multispeciality Hospital", "સંજીવની મલ્ટિસ્પેશિયાલિટી હોસ્પિટલ", "संजीवनी मल्टीस्पेशियलिटी अस्पताल"],
  "place.Surat Outer Ring Road": ["Surat Outer Ring Road", "સુરત આઉટર રિંગ રોડ", "सूरत आउटर रिंग रोड"],
  "place.Sayan Railway Station": ["Sayan Railway Station", "સાયણ રેલવે સ્ટેશન", "सायण रेलवे स्टेशन"],
  "place.Surat International Airport": ["Surat International Airport", "સુરત આંતરરાષ્ટ્રીય એરપોર્ટ", "सूरत अंतरराष्ट्रीय एयरपोर्ट"],
  "place.Olpad Main Market": ["Olpad Main Market", "ઓલપાડ મુખ્ય બજાર", "ओलपाड मुख्य बाज़ार"],
  "place.BAPS Swaminarayan Mandir": ["BAPS Swaminarayan Mandir", "BAPS સ્વામિનારાયણ મંદિર", "BAPS स्वामिनारायण मंदिर"],
  "place.Shree Ramkrishna Vidyalaya": ["Shree Ramkrishna Vidyalaya", "શ્રી રામકૃષ્ણ વિદ્યાલય", "श्री रामकृष्ण विद्यालय"],
  "gallery.title": ["Project gallery", "પ્રોજેક્ટ ગેલેરી", "प्रोजेक्ट गैलरी"],
  "gallery.prev": ["← Previous", "← પાછળ", "← पिछला"],
  "gallery.next": ["Next →", "આગળ →", "अगला →"],
  "gallery.alt": ["Project architectural view", "પ્રોજેક્ટનું સ્થાપત્ય દ્રશ્ય", "प्रोजेक्ट का वास्तु दृश्य"],
  "gallery.show": ["Show view {n}", "દ્રશ્ય {n} બતાવો", "दृश्य {n} दिखाएँ"],
  "gps.title": ["Satellite location", "સેટેલાઇટ લોકેશન", "सैटेलाइट लोकेशन"],
  "gps.map": ["Satellite map of PinYourSite Apartments", "PinYourSite એપાર્ટમેન્ટ્સનો સેટેલાઇટ નકશો", "PinYourSite अपार्टमेंट्स का सैटेलाइट नक्शा"],
  "gps.controls": ["Map controls", "નકશા નિયંત્રણો", "नक्शा नियंत्रण"],
  "gps.reset": ["Reset map view", "નકશો રીસેટ કરો", "नक्शा रीसेट करें"],
  "gps.center": ["Centre on project", "પ્રોજેક્ટ પર કેન્દ્રિત કરો", "प्रोजेक्ट पर केंद्रित करें"],
  "gps.north": ["Face north", "ઉત્તર તરફ ફેરવો", "उत्तर की ओर करें"],
  "gps.in": ["Zoom in", "મોટું કરો", "बड़ा करें"],
  "gps.out": ["Zoom out", "નાનું કરો", "छोटा करें"],
  "gps.directions": ["Directions", "દિશા", "रास्ता"],
  "gps.back": ["Back to 3D", "3D પર પાછા", "3D पर वापस"],
  "gps.tiles": ["Some satellite imagery is unavailable.", "કેટલીક સેટેલાઇટ તસવીરો ઉપલબ્ધ નથી.", "कुछ सैटेलाइट तस्वीरें उपलब्ध नहीं हैं।"],
  "flat.kicker": ["PINYOURSITE / SAMPLE RESIDENCE", "PINYOURSITE / નમૂનાનું ઘર", "PINYOURSITE / सैंपल घर"],
  "flat.title": ["The Vesu Flat", "વેસુ ફ્લેટ", "वेसु फ़्लैट"],
  "flat.sub": ["B-102 · Wing B · First floor · 2 BHK", "B-102 · વિંગ B · પહેલો માળ · 2 BHK", "B-102 · विंग B · पहली मंज़िल · 2 BHK"],
  "flat.close": ["Return to the towers", "ટાવર પર પાછા જાઓ", "टावर पर वापस जाएँ"],
  "flat.views": ["Flat viewpoints", "ફ્લેટના વ્યૂ", "फ़्लैट के व्यू"],
  "flat.overhead": ["Overhead", "ઉપરથી", "ऊपर से"],
  "flat.living": ["Living", "લિવિંગ", "लिविंग"],
  "flat.bedrooms": ["Bedrooms", "બેડરૂમ", "बेडरूम"],
  "flat.kitchen": ["Kitchen", "રસોડું", "रसोई"],
  "flat.loading": ["Loading furnished model…", "ફર્નિશ્ડ મોડલ લોડ થઈ રહ્યું છે…", "फ़र्निश्ड मॉडल लोड हो रहा है…"],
  "flat.hint": ["Drag to orbit · Pinch or scroll to zoom", "ફેરવવા ખેંચો · ઝૂમ માટે પિંચ કરો", "घुमाने के लिए खींचें · ज़ूम के लिए पिंच करें"],
  "flat.fallback": ["Rendered overhead view · 3D could not load", "રેન્ડર કરેલ ઉપરનો વ્યૂ · 3D લોડ ન થયું", "रेंडर किया ऊपरी व्यू · 3D लोड नहीं हुआ"],
  "flat.alt": ["Blender rendering of the furnished sample apartment", "ફર્નિશ્ડ નમૂનાના એપાર્ટમેન્ટનું Blender રેન્ડરિંગ", "फ़र्निश्ड सैंपल अपार्टमेंट का Blender रेंडरिंग"],
  "powered": ["POWERED BY KAPADIYA & SONS", "કાપડિયા એન્ડ સન્સ દ્વારા સંચાલિત", "कपाड़िया एंड संस द्वारा संचालित"],
  "skip": ["Skip to project tools", "પ્રોજેક્ટ ટૂલ્સ પર જાઓ", "प्रोजेक्ट टूल्स पर जाएँ"],
};

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "gu", label: "ગુ", name: "ગુજરાતી" },
  { code: "hi", label: "हि", name: "हिन्दी" },
];
const index = { en: 0, gu: 1, hi: 2 };
const KEY = "pinyoursite-lang";
const listeners = new Set();

function initial() {
  const asked = new URLSearchParams(location.search).get("lang");
  if (asked in index) return asked;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved in index) return saved;
  } catch {}
  return "en";
}
export let lang = initial();

export function t(key, vars) {
  const row = S[key];
  let s = row ? row[index[lang]] || row[0] : key;
  if (vars) for (const k in vars) s = s.replaceAll("{" + k + "}", vars[k]);
  return s;
}
export const has = (key) => key in S;

// data-i18n="key" sets text; data-i18n-attr="aria-label:key;placeholder:key" sets attributes.
export function translate(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll("[data-i18n-attr]").forEach((el) =>
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      el.setAttribute(attr.trim(), t(key.trim()));
    }),
  );
}

export function setLang(code) {
  if (!(code in index) || code === lang) return;
  lang = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {}
  apply();
  listeners.forEach((fn) => fn(code));
}
export const onLang = (fn) => listeners.add(fn);

function apply() {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.title = t("doc.title");
  translate();
  document.querySelectorAll("[data-lang-option]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.langOption === lang)),
  );
}

// One segmented switch, used in the header of every view.
export function mountSwitch(el) {
  el.setAttribute("role", "group");
  el.dataset.i18nAttr = "aria-label:lang.label";
  el.innerHTML = LANGS.map(
    (l) =>
      `<button type="button" data-lang-option="${l.code}" lang="${l.code}" aria-label="${l.name}" title="${l.name}">${l.label}</button>`,
  ).join("");
  el.onclick = (e) => {
    const b = e.target.closest("[data-lang-option]");
    if (b) setLang(b.dataset.langOption);
  };
  apply();
}
