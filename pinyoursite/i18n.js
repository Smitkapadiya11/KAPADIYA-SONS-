import "@fontsource/noto-sans-gujarati/gujarati-400.css";
import "@fontsource/noto-sans-gujarati/gujarati-600.css";
import "@fontsource/noto-sans-devanagari/devanagari-400.css";
import "@fontsource/noto-sans-devanagari/devanagari-600.css";

// Every visible string, as [English, ગુજરાતી, हिन्दी]. {n}-style tokens are filled by t().
const S = {
  "doc.title": ["PinYourSite by Kapadiya & Sons | 3D Plot Explorer", "PinYourSite – કાપડિયા એન્ડ સન્સ | 3D પ્લોટ એક્સપ્લોરર", "PinYourSite – कपाड़िया एंड संस | 3D प्लॉट एक्सप्लोरर"],
  "brand.by": ["BY KAPADIYA & SONS", "કાપડિયા એન્ડ સન્સ દ્વારા", "कपाड़िया एंड संस द्वारा"],
  "demo": ["Demo project", "ડેમો પ્રોજેક્ટ", "डेमो प्रोजेक्ट"],
  "lang.label": ["Language", "ભાષા", "भाषा"],
  "skip": ["Skip to project tools", "પ્રોજેક્ટ ટૂલ્સ પર જાઓ", "प्रोजेक्ट टूल्स पर जाएँ"],
  "loading": ["Building your neighbourhood in 3D…", "તમારો વિસ્તાર 3D માં તૈયાર થઈ રહ્યો છે…", "आपका इलाका 3D में तैयार हो रहा है…"],
  "loading.fail": ["3D could not start on this device. Showing the plan.", "આ ડિવાઇસ પર 3D શરૂ ન થયું. પ્લાન બતાવી રહ્યા છીએ.", "इस डिवाइस पर 3D शुरू नहीं हुआ। प्लान दिखा रहे हैं।"],
  "hint": ["Drag to orbit · Pinch or scroll to zoom · Tap any plot", "ફેરવવા ખેંચો · ઝૂમ માટે પિંચ કરો · કોઈપણ પ્લોટ પર ટેપ કરો", "घुमाने के लिए खींचें · ज़ूम के लिए पिंच करें · किसी भी प्लॉट पर टैप करें"],
  "world.label": ["Interactive 3D masterplan. Drag to orbit, pinch to zoom, select a plot for details.", "ઇન્ટરેક્ટિવ 3D માસ્ટરપ્લાન. ફેરવવા ખેંચો, ઝૂમ માટે પિંચ કરો, વિગતો માટે પ્લોટ પસંદ કરો.", "इंटरैक्टिव 3D मास्टरप्लान। घुमाने के लिए खींचें, ज़ूम के लिए पिंच करें, विवरण के लिए प्लॉट चुनें।"],
  "status.available": ["Available", "ઉપલબ્ધ", "उपलब्ध"],
  "status.hold": ["Builder", "બિલ્ડર", "बिल्डर"],
  "status.sold": ["Sold", "વેચાયેલ", "बिक चुका"],
  "filter.label": ["Show plots by status", "સ્થિતિ પ્રમાણે પ્લોટ બતાવો", "स्थिति के अनुसार प्लॉट दिखाएँ"],
  "tool.search": ["Search", "શોધો", "खोजें"],
  "tool.details": ["Details", "વિગતો", "विवरण"],
  "tool.gallery": ["Gallery", "ગેલેરી", "गैलरी"],
  "tool.nearby": ["Nearby", "નજીકમાં", "आसपास"],
  "tool.gps": ["GPS", "નકશો", "नक्शा"],
  "tool.brochure": ["Brochure", "બ્રોશર", "ब्रोशर"],
  "tools.label": ["Project tools", "પ્રોજેક્ટ ટૂલ્સ", "प्रोजेक्ट टूल्स"],
  "mode.day": ["Day", "દિવસ", "दिन"],
  "mode.dusk": ["Dusk", "સાંજ", "शाम"],
  "mode.label": ["Lighting", "પ્રકાશ", "रोशनी"],
  "homes": ["Homes", "ઘરો", "घर"],
  "homes.label": ["Show proposed homes on plots", "પ્લોટ પર સૂચિત ઘરો બતાવો", "प्लॉट पर प्रस्तावित घर दिखाएँ"],
  "sample": ["Sample villa", "નમૂનાનો વિલા", "सैंपल विला"],
  "reset": ["Reset view", "વ્યૂ રીસેટ કરો", "व्यू रीसेट करें"],
  "share": ["Share", "શેર કરો", "शेयर करें"],
  "share.project": ["Share project", "પ્રોજેક્ટ શેર કરો", "प्रोजेक्ट शेयर करें"],
  "share.copy": ["Copy this link", "આ લિંક કૉપિ કરો", "यह लिंक कॉपी करें"],
  "copied": ["Link copied.", "લિંક કૉપિ થઈ ગઈ.", "लिंक कॉपी हो गया।"],
  "share.text": ["Explore this plot in 3D", "આ પ્લોટ 3D માં જુઓ", "इस प्लॉट को 3D में देखें"],
  "close": ["Close", "બંધ કરો", "बंद करें"],
  "plot": ["Plot", "પ્લોટ", "प्लॉट"],
  "plot.n": ["Plot {n}", "પ્લોટ {n}", "प्लॉट {n}"],
  "area": ["Total area", "કુલ ક્ષેત્રફળ", "कुल क्षेत्रफल"],
  "var": ["Var", "વાર", "वार"],
  "dims": ["Dimensions", "માપ", "माप"],
  "frontage": ["Road frontage", "રસ્તાની સામે", "सड़क की ओर"],
  "road.internal": ["23 ft internal road", "23 ફૂટ આંતરિક રસ્તો", "23 फुट आंतरिक सड़क"],
  "road.west": ["18 m proposed road", "18 મીટર સૂચિત રસ્તો", "18 मीटर प्रस्तावित सड़क"],
  "road.east": ["60 m D.P. road", "60 મીટર ડી.પી. રસ્તો", "60 मीटर डी.पी. सड़क"],
  "design": ["Home design", "ઘરની ડિઝાઇન", "घर का डिज़ाइन"],
  "design.a": ["Teak Screen House", "ટીક સ્ક્રીન હાઉસ", "टीक स्क्रीन हाउस"],
  "design.b": ["Stone & Shadow", "સ્ટોન એન્ડ શેડો", "स्टोन एंड शैडो"],
  "design.c": ["Skylight House", "સ્કાયલાઇટ હાઉસ", "स्काईलाइट हाउस"],
  "design.d": ["Terrace Villa", "ટેરેસ વિલા", "टैरेस विला"],
  "design.a.sub": ["G+1 · cantilevered teak-screen suite", "G+1 · બહાર નીકળતો ટીક-સ્ક્રીન સ્યૂટ", "G+1 · बाहर निकला टीक-स्क्रीन सुइट"],
  "design.b.sub": ["G+1 · stone base, corner glass, roof studio", "G+1 · પથ્થરનો બેઝ, કોર્નર ગ્લાસ, રૂફ સ્ટુડિયો", "G+1 · पत्थर का बेस, कॉर्नर ग्लास, रूफ स्टूडियो"],
  "design.c.sub": ["G+1 · sloping roof, double-height glass", "G+1 · ઢળતી છત, ડબલ-હાઇટ ગ્લાસ", "G+1 · ढलवाँ छत, डबल-हाइट ग्लास"],
  "design.d.sub": ["G+2 · stepped garden terraces", "G+2 · પગથિયાંવાળા ગાર્ડન ટેરેસ", "G+2 · सीढ़ीदार गार्डन टैरेस"],
  "design.note": ["Illustrative design shown on this plot. Build your own plan.", "આ પ્લોટ પર દર્શાવેલ ડિઝાઇન માત્ર ઉદાહરણ છે. તમારો પોતાનો પ્લાન બનાવો.", "इस प्लॉट पर दिखाया डिज़ाइन केवल उदाहरण है। अपना प्लान खुद बनाएँ।"],
  "orbit": ["Orbit 360°", "360° ફેરવો", "360° घुमाएँ"],
  "orbit.stop": ["Stop orbit", "ફેરવવાનું બંધ કરો", "घुमाना बंद करें"],
  "villa.open": ["Walk through sample villa ↗", "નમૂનાનો વિલા અંદરથી જુઓ ↗", "सैंपल विला अंदर से देखें ↗"],
  "plot.prev": ["Previous plot", "પાછલો પ્લોટ", "पिछला प्लॉट"],
  "plot.next": ["Next plot", "આગળનો પ્લોટ", "अगला प्लॉट"],
  "plot.details": ["View details ↗", "વિગતો જુઓ ↗", "विवरण देखें ↗"],
  "plot.fine": ["Illustrative dimensions calculated from the demo plan. Not a site survey or live availability.", "ડેમો પ્લાનથી ગણેલા અંદાજિત માપ. આ સાઇટ સર્વે કે લાઇવ ઉપલબ્ધતા નથી.", "डेमो प्लान से गणना किए गए अनुमानित माप। यह साइट सर्वे या लाइव उपलब्धता नहीं है।"],
  "enquiry.title": ["Interested? Connect now", "રસ છે? હમણાં સંપર્ક કરો", "रुचि है? अभी संपर्क करें"],
  "enquiry.name": ["Your name", "તમારું નામ", "आपका नाम"],
  "enquiry.phone": ["Phone number", "ફોન નંબર", "फ़ोन नंबर"],
  "enquiry.code": ["Country calling code", "દેશનો કોલિંગ કોડ", "देश का कॉलिंग कोड"],
  "enquiry.send": ["Continue on WhatsApp ↗", "WhatsApp પર આગળ વધો ↗", "WhatsApp पर आगे बढ़ें ↗"],
  "enquiry.fine": ["Review and send your enquiry in WhatsApp. Demonstration only; no plot reservation or lead storage.", "તમારી પૂછપરછ WhatsApp માં તપાસીને મોકલો. માત્ર ડેમો; કોઈ પ્લોટ બુકિંગ કે ડેટા સંગ્રહ નથી.", "अपनी पूछताछ WhatsApp में देखकर भेजें। केवल डेमो; कोई प्लॉट बुकिंग या डेटा संग्रह नहीं।"],
  "search.title": ["Plot search", "પ્લોટ શોધ", "प्लॉट खोज"],
  "search.placeholder": ["Type plot number (e.g. 25)…", "પ્લોટ નંબર લખો (દા.ત. 25)…", "प्लॉट नंबर लिखें (जैसे 25)…"],
  "search.label": ["Search plot number", "પ્લોટ નંબર શોધો", "प्लॉट नंबर खोजें"],
  "search.size": ["Filter by size", "માપ પ્રમાણે ફિલ્ટર", "आकार के अनुसार फ़िल्टर"],
  "search.all": ["All plots", "બધા પ્લોટ", "सभी प्लॉट"],
  "search.none": ["No matching plots. Try another number or size.", "કોઈ પ્લોટ મળ્યો નહીં. બીજો નંબર કે માપ અજમાવો.", "कोई प्लॉट नहीं मिला। दूसरा नंबर या आकार आज़माएँ।"],
  "details.title": ["Project overview", "પ્રોજેક્ટની ઝાંખી", "प्रोजेक्ट का अवलोकन"],
  "details.tag": ["PINYOURSITE BY KAPADIYA & SONS · DEMONSTRATION", "PINYOURSITE – કાપડિયા એન્ડ સન્સ · ડેમો", "PINYOURSITE – कपाड़िया एंड संस · डेमो"],
  "details.about": ["About the project", "પ્રોજેક્ટ વિશે", "प्रोजेक्ट के बारे में"],
  "details.aboutText": ["A complete neighbourhood, ready to explore. This demonstration brings plot information, project visuals and location context into one interactive 3D experience.", "એક સંપૂર્ણ વિસ્તાર, જોવા માટે તૈયાર. આ ડેમો પ્લોટની માહિતી, પ્રોજેક્ટના દ્રશ્યો અને લોકેશનને એક ઇન્ટરેક્ટિવ 3D અનુભવમાં લાવે છે.", "एक पूरा इलाका, देखने के लिए तैयार। यह डेमो प्लॉट की जानकारी, प्रोजेक्ट के दृश्य और लोकेशन को एक इंटरैक्टिव 3D अनुभव में लाता है।"],
  "details.location": ["Site location", "સાઇટ લોકેશન", "साइट लोकेशन"],
  "details.place": ["Vankala / Jahangirpura, Surat, Gujarat", "વાંકલા / જહાંગીરપુરા, સુરત, ગુજરાત", "वांकला / जहांगीरपुरा, सूरत, गुजरात"],
  "details.ref": ["Reference location for this demonstration.", "આ ડેમો માટેનું સંદર્ભ લોકેશન.", "इस डेमो के लिए संदर्भ लोकेशन।"],
  "details.totalArea": ["Total plot area", "કુલ પ્લોટ ક્ષેત્રફળ", "कुल प्लॉट क्षेत्रफल"],
  "details.sqyd": ["Square yards", "ચોરસ વાર", "वर्ग गज"],
  "details.totalPlots": ["Total plots", "કુલ પ્લોટ", "कुल प्लॉट"],
  "details.demoPlots": ["Demonstration plots", "ડેમો પ્લોટ", "डेमो प्लॉट"],
  "details.amenities": ["Amenities", "સુવિધાઓ", "सुविधाएँ"],
  "details.by": ["Project experience by", "પ્રોજેક્ટ અનુભવ", "प्रोजेक्ट अनुभव"],
  "details.byText": ["Kapadiya & Sons · PinYourSite Plots · Complete 3D informational web view and project details.", "કાપડિયા એન્ડ સન્સ · PinYourSite પ્લોટ્સ · સંપૂર્ણ 3D વેબ વ્યૂ અને પ્રોજેક્ટ વિગતો.", "कपाड़िया एंड संस · PinYourSite प्लॉट्स · संपूर्ण 3D वेब व्यू और प्रोजेक्ट विवरण।"],
  "details.pricing": ["Contact for pricing and more ↗", "કિંમત અને વધુ માટે સંપર્ક કરો ↗", "कीमत और अधिक के लिए संपर्क करें ↗"],
  "amenity.0": ["Landscaped garden", "લેન્ડસ્કેપ ગાર્ડન", "लैंडस्केप गार्डन"],
  "amenity.1": ["Children’s play area", "બાળકોનો રમતવિસ્તાર", "बच्चों का खेल क्षेत्र"],
  "amenity.2": ["Gazebo seating", "ગઝેબો બેઠક", "गज़ेबो बैठक"],
  "amenity.3": ["Box cricket", "બોક્સ ક્રિકેટ", "बॉक्स क्रिकेट"],
  "amenity.4": ["Jogging track", "જોગિંગ ટ્રેક", "जॉगिंग ट्रैक"],
  "amenity.5": ["Entrance gate", "પ્રવેશદ્વાર", "प्रवेश द्वार"],
  "amenity.6": ["Security cabin", "સિક્યોરિટી કેબિન", "सिक्योरिटी केबिन"],
  "amenity.7": ["Street lighting", "સ્ટ્રીટ લાઇટ", "स्ट्रीट लाइट"],
  "amenity.8": ["Internal roads", "આંતરિક રસ્તા", "आंतरिक सड़कें"],
  "amenity.9": ["Drainage", "ડ્રેનેજ", "ड्रेनेज"],
  "amenity.10": ["Underground power", "ભૂગર્ભ વીજળી", "भूमिगत बिजली"],
  "amenity.11": ["CCTV", "CCTV", "CCTV"],
  "nearby.title": ["Nearby landmarks", "નજીકના સ્થળો", "आसपास के स्थान"],
  "nearby.intro": ["Reference project landmarks and illustrative travel times. Open a place for current routes.", "સંદર્ભ પ્રોજેક્ટના સ્થળો અને અંદાજિત મુસાફરી સમય. હાલના રૂટ માટે સ્થળ ખોલો.", "संदर्भ प्रोजेक्ट के स्थान और अनुमानित यात्रा समय। मौजूदा रूट के लिए स्थान खोलें।"],
  "mins": ["{n} mins", "{n} મિનિટ", "{n} मिनट"],
  "cat.Highway": ["Highway", "હાઇવે", "हाईवे"],
  "cat.Other": ["Locality", "વિસ્તાર", "इलाका"],
  "cat.Mall / Market": ["Mall / market", "મોલ / બજાર", "मॉल / बाज़ार"],
  "cat.Airport": ["Airport", "એરપોર્ટ", "एयरपोर्ट"],
  "place.0": ["Vankala Canal Road", "વાંકલા કેનાલ રોડ", "वांकला कैनाल रोड"],
  "place.1": ["Sonsak Village Center", "સોનસક ગામ કેન્દ્ર", "सोनसक गाँव केंद्र"],
  "place.2": ["Ambheta Branch Post Office", "અંભેટા બ્રાન્ચ પોસ્ટ ઑફિસ", "अंभेटा ब्रांच पोस्ट ऑफिस"],
  "place.3": ["Kim–Olpad Road", "કીમ–ઓલપાડ રોડ", "कीम–ओलपाड रोड"],
  "place.4": ["Olpad City Center / Market", "ઓલપાડ સિટી સેન્ટર / બજાર", "ओलपाड सिटी सेंटर / बाज़ार"],
  "place.5": ["International Airport Road", "ઇન્ટરનેશનલ એરપોર્ટ રોડ", "इंटरनेशनल एयरपोर्ट रोड"],
  "gallery.title": ["Project gallery", "પ્રોજેક્ટ ગેલેરી", "प्रोजेक्ट गैलरी"],
  "gallery.fine": ["Reference project visualisations. Demonstration imagery, not completed Kapadiya developments.", "સંદર્ભ પ્રોજેક્ટના દ્રશ્યો. ડેમો તસવીરો, કાપડિયાના પૂર્ણ થયેલા પ્રોજેક્ટ નથી.", "संदर्भ प्रोजेक्ट के दृश्य। डेमो तस्वीरें, कपाड़िया के पूरे हुए प्रोजेक्ट नहीं।"],
  "gallery.view": ["View {n}", "{n} જુઓ", "{n} देखें"],
  "gallery.alt": ["{n} — reference project visual", "{n} — સંદર્ભ પ્રોજેક્ટ દ્રશ્ય", "{n} — संदर्भ प्रोजेक्ट दृश्य"],
  "g.0": ["The complete neighbourhood", "સંપૂર્ણ વિસ્તાર", "पूरा इलाका"],
  "g.1": ["An aerial perspective", "આકાશી દ્રશ્ય", "हवाई दृश्य"],
  "g.2": ["The arrival", "આગમન", "आगमन"],
  "g.3": ["Poolside living", "પૂલ કિનારે જીવન", "पूल किनारे जीवन"],
  "g.4": ["The streetscape", "શેરીનું દ્રશ્ય", "सड़क का दृश्य"],
  "g.5": ["Garden moments", "બગીચાની પળો", "बगीचे के पल"],
  "g.6": ["A place to pause", "થોભવાની જગ્યા", "ठहरने की जगह"],
  "g.7": ["Inside the neighbourhood", "વિસ્તારની અંદર", "इलाके के अंदर"],
  "g.8": ["Contemporary living", "આધુનિક જીવનશૈલી", "आधुनिक जीवनशैली"],
  "g.9": ["At your doorstep", "તમારા ઘરઆંગણે", "आपके दरवाज़े पर"],
  "g.10": ["Homes with character", "વિશિષ્ટ ઘરો", "खास पहचान वाले घर"],
  "g.11": ["The evening view", "સાંજનું દ્રશ્ય", "शाम का दृश्य"],
  "g.12": ["A welcoming entrance", "આવકારદાયક પ્રવેશ", "स्वागत करता प्रवेश"],
  "g.13": ["A connected community", "જોડાયેલો સમુદાય", "जुड़ा हुआ समुदाय"],
  "brochure.title": ["Project catalogue", "પ્રોજેક્ટ કેટલોગ", "प्रोजेक्ट कैटलॉग"],
  "brochure.tag": ["Your project. Every detail. By Kapadiya & Sons.", "તમારો પ્રોજેક્ટ. દરેક વિગત. કાપડિયા એન્ડ સન્સ દ્વારા.", "आपका प्रोजेक्ट। हर विवरण। कपाड़िया एंड संस द्वारा।"],
  "brochure.kind": ["DEMONSTRATION CATALOGUE · PDF", "ડેમો કેટલોગ · PDF", "डेमो कैटलॉग · PDF"],
  "brochure.download": ["Download brochure", "બ્રોશર ડાઉનલોડ કરો", "ब्रोशर डाउनलोड करें"],
  "brochure.text": ["Explore the viewer, its features and Architect’s Cut.", "વ્યૂઅર, તેની સુવિધાઓ અને આર્કિટેક્ટ્સ કટ જુઓ.", "व्यूअर, उसकी सुविधाएँ और आर्किटेक्ट्स कट देखें।"],
  "brochure.enquire": ["Enquire on WhatsApp ↗", "WhatsApp પર પૂછો ↗", "WhatsApp पर पूछें ↗"],
  "gps.title": ["Satellite project location", "સેટેલાઇટ પ્રોજેક્ટ લોકેશન", "सैटेलाइट प्रोजेक्ट लोकेशन"],
  "gps.sub": ["DEMONSTRATION LOCATION", "ડેમો લોકેશન", "डेमो लोकेशन"],
  "gps.close": ["Close satellite map", "સેટેલાઇટ નકશો બંધ કરો", "सैटेलाइट नक्शा बंद करें"],
  "gps.home": ["Recenter project", "પ્રોજેક્ટ પર પાછા જાઓ", "प्रोजेक्ट पर वापस जाएँ"],
  "gps.in": ["Zoom map in", "નકશો મોટો કરો", "नक्शा बड़ा करें"],
  "gps.out": ["Zoom map out", "નકશો નાનો કરો", "नक्शा छोटा करें"],
  "gps.overlay": ["Toggle project overlay", "પ્રોજેક્ટ ઓવરલે ચાલુ/બંધ", "प्रोजेक्ट ओवरले चालू/बंद"],
  "gps.directions": ["Get directions", "દિશા મેળવો", "रास्ता पाएँ"],
  "gps.explore": ["Explore the project in 3D ↗", "પ્રોજેક્ટ 3D માં જુઓ ↗", "प्रोजेक्ट 3D में देखें ↗"],
  "gps.error": ["Satellite tiles could not load.", "સેટેલાઇટ ટાઇલ્સ લોડ ન થઈ.", "सैटेलाइट टाइल्स लोड नहीं हुईं।"],
  "gps.google": ["Open Google Maps ↗", "Google Maps ખોલો ↗", "Google Maps खोलें ↗"],
  "lightbox.label": ["Project gallery image", "પ્રોજેક્ટ ગેલેરી તસવીર", "प्रोजेक्ट गैलरी तस्वीर"],
  "lightbox.zoom": ["Zoom image", "તસવીર મોટી કરો", "तस्वीर बड़ी करें"],
  "lightbox.download": ["Download image", "તસવીર ડાઉનલોડ કરો", "तस्वीर डाउनलोड करें"],
  "lightbox.full": ["Full screen", "ફુલ સ્ક્રીન", "फ़ुल स्क्रीन"],
  "lightbox.close": ["Close image", "તસવીર બંધ કરો", "तस्वीर बंद करें"],
  "lightbox.prev": ["Previous image", "પાછલી તસવીર", "पिछली तस्वीर"],
  "lightbox.next": ["Next image", "આગળની તસવીર", "अगली तस्वीर"],
  "fullscreen.fail": ["Fullscreen is unavailable in this browser.", "આ બ્રાઉઝરમાં ફુલ સ્ક્રીન ઉપલબ્ધ નથી.", "इस ब्राउज़र में फ़ुल स्क्रीन उपलब्ध नहीं है।"],
  "powered": ["POWERED BY KAPADIYA & SONS", "કાપડિયા એન્ડ સન્સ દ્વારા સંચાલિત", "कपाड़िया एंड संस द्वारा संचालित"],
  "villa.kicker": ["PINYOURSITE / DESIGN STUDY 01", "PINYOURSITE / ડિઝાઇન સ્ટડી 01", "PINYOURSITE / डिज़ाइन स्टडी 01"],
  "villa.title": ["The Surat Courtyard Villa", "સુરત કોર્ટયાર્ડ વિલા", "सूरत कोर्टयार्ड विला"],
  "villa.sub": ["Teak, sandstone and Ajrakh · Surat design study", "ટીક, સેન્ડસ્ટોન અને અજરખ · સુરત ડિઝાઇન સ્ટડી", "टीक, सैंडस्टोन और अजरख · सूरत डिज़ाइन स्टडी"],
  "villa.facts": ["Demo room · approx. 6.84 × 6.85 m", "ડેમો રૂમ · આશરે 6.84 × 6.85 મી", "डेमो कमरा · लगभग 6.84 × 6.85 मी"],
  "villa.measure": ["Demo dimensions", "ડેમો માપ", "डेमो माप"],
  "villa.back": ["Return to the 3D plan", "3D પ્લાન પર પાછા જાઓ", "3D प्लान पर वापस जाएँ"],
  "villa.views": ["House camera views", "ઘરના કેમેરા વ્યૂ", "घर के कैमरा व्यू"],
  "villa.rooms": ["Interior rooms", "અંદરના રૂમ", "अंदर के कमरे"],
  "villa.street": ["Street", "શેરી", "सड़क"],
  "villa.balcony": ["Balcony", "બાલ્કની", "बालकनी"],
  "villa.aerial": ["Aerial", "ઉપરથી", "ऊपर से"],
  "villa.inside": ["Go inside ↗", "અંદર જાઓ ↗", "अंदर जाएँ ↗"],
  "villa.outside": ["Outside ↗", "બહાર ↗", "बाहर ↗"],
  "villa.living": ["Living", "લિવિંગ", "लिविंग"],
  "villa.kitchen": ["Kitchen", "રસોડું", "रसोई"],
  "villa.bedroom": ["Bedroom", "બેડરૂમ", "बेडरूम"],
  "villa.bath": ["Bath", "બાથ", "बाथ"],
  "villa.hint": ["Drag to orbit · Pinch or scroll to zoom", "ફેરવવા ખેંચો · ઝૂમ માટે પિંચ કરો", "घुमाने के लिए खींचें · ज़ूम के लिए पिंच करें"],
  "villa.hintInside": ["Drag to look around · Choose a room to move", "આસપાસ જોવા ખેંચો · જવા માટે રૂમ પસંદ કરો", "चारों ओर देखने के लिए खींचें · जाने के लिए कमरा चुनें"],
  "villa.opening": ["Opening the 3D exterior…", "3D બાહ્ય દ્રશ્ય ખુલી રહ્યું છે…", "3D बाहरी दृश्य खुल रहा है…"],
  "villa.fallback": ["3D is unavailable here. Showing the gallery reference.", "અહીં 3D ઉપલબ્ધ નથી. ગેલેરી સંદર્ભ બતાવી રહ્યા છીએ.", "यहाँ 3D उपलब्ध नहीं है। गैलरी संदर्भ दिखा रहे हैं।"],
  "villa.roomOpening": ["Opening {n}…", "{n} ખુલી રહ્યું છે…", "{n} खुल रहा है…"],
  "villa.roomFail": ["This room could not load. Select it again to retry.", "આ રૂમ લોડ ન થયો. ફરી પ્રયાસ કરવા ફરી પસંદ કરો.", "यह कमरा लोड नहीं हुआ। दोबारा कोशिश के लिए फिर चुनें।"],
  "room.living": ["Living room", "લિવિંગ રૂમ", "लिविंग रूम"],
  "room.kitchen": ["Kitchen & dining", "રસોડું અને ડાઇનિંગ", "रसोई और डाइनिंग"],
  "room.bedroom": ["Primary bedroom", "મુખ્ય બેડરૂમ", "मुख्य बेडरूम"],
  "room.bath": ["Bath suite", "બાથ સ્યૂટ", "बाथ सुइट"],
  "m.Balcony": ["Balcony", "બાલ્કની", "बालकनी"],
  "m.Eaves": ["Eaves", "છજું", "छज्जा"],
  "m.Sofa": ["Sofa", "સોફા", "सोफ़ा"],
  "m.Rug": ["Rug", "ગાલીચો", "गलीचा"],
  "m.Island": ["Island", "આઇલેન્ડ", "आइलैंड"],
  "m.Counter": ["Counter", "કાઉન્ટર", "काउंटर"],
  "m.Bed": ["Bed", "પલંગ", "पलंग"],
  "m.Headboard": ["Headboard", "હેડબોર્ડ", "हेडबोर्ड"],
  "m.Vanity": ["Vanity", "વૅનિટી", "वैनिटी"],
  "m.Bath": ["Bath", "બાથટબ", "बाथटब"],
  "m.Room span": ["Room span", "રૂમની પહોળાઈ", "कमरे की चौड़ाई"],
  "m.Ceiling": ["Ceiling", "છતની ઊંચાઈ", "छत की ऊँचाई"],
  "m.unit": ["m", "મી", "मी"],
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
