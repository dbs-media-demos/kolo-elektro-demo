/**
 * Serbian (Latin), the site's first language. Keys are the English text exactly as passed to t()
 * (lib/i18n); lists with prices (services, faults, reviews, FAQ) have their own Serbian versions in
 * content/offer.ts. Find gaps with window.__untranslated().
 */
export const sr: Record<string, string> = {
  // ── Chrome ──
  "Skip to content": "Preskoči na sadržaj",
  home: "početna",
  Main: "Glavni meni",
  Language: "Jezik",
  "Open menu": "Otvori meni",
  "Close menu": "Zatvori meni",
  Services: "Usluge",
  Faults: "Kvarovi",
  Prices: "Cene",
  Work: "Radovi",
  Reviews: "Utisci",
  Contact: "Kontakt",
  Call: "Pozovite",
  "Get a quote": "Zatražite ponudu",
  "On this page": "Na ovoj stranici",
  Where: "Gde smo",
  "Design & development:": "Dizajn i izrada:",
  "Faults, rewiring, panels and lighting. We say when, we say how much, and then we do exactly that.":
    "Kvarovi, instalacije, table i rasveta. Kažemo kada, kažemo koliko, i onda uradimo baš to.",

  // ── Hero ──
  "A distribution board with neat rows of breakers on a dark wall, under one warm pendant lamp": "Razvodna tabla sa urednim redovima osigurača na tamnom zidu, pod jednom toplom visećom lampom",
  Electrician: "Električar",
  "The electrician": "Električar",
  "who shows up when promised.": "koji dođe kad kaže.",
  "Emergency callouts 24/7": "Hitne intervencije 0–24",
  "Faults, rewiring, panels, lighting and EV chargers across {area}. Callouts 24/7, and the price before we start.":
    "Kvarovi, nove instalacije, table, rasveta i punjači za automobile — {area}. Hitno 0–24, a cenu znate pre početka rada.",
  "Get a free quote": "Besplatna ponuda",
  "{count} Google reviews": "{count} Google recenzija",
  "Main switch: on": "Glavna sklopka: uključena",
  "Main switch: off": "Glavna sklopka: isključena",

  // ── Plan ──
  "New wiring": "Nova instalacija",
  "Day 1": "Dan 1",
  "Day 2": "Dan 2",
  "Day 3": "Dan 3",
  "Day 4": "Dan 4",
  "We walk it with you.": "Prođemo stan zajedno.",
  "Every socket and lamp goes on the plan before a single chase is cut, so nothing gets decided on a ladder.": "Svaka utičnica i lampa ide na plan pre prvog šlica, da se ništa ne odlučuje na merdevinama.",
  "Copper in the walls.": "Bakar u zidovima.",
  "Brown, blue and green-yellow. Straight runs, right angles, nothing that will surprise whoever drills here in twenty years.": "Braon, plava i zeleno-žuta. Prave trase, pravi uglovi, ništa što će iznenaditi onog ko ovde bude bušio za dvadeset godina.",
  "A board worth opening.": "Tabla koju vredi otvoriti.",
  "One protected circuit per room. Combed, labelled and written down in a directory you can read.": "Zaštićeno kolo za svaku prostoriju. Uredno složeno, označeno i upisano u spisak koji može da se pročita.",
  "First light.": "Prvo svetlo.",
  "Circuit by circuit, measured under load. The flat comes on and you get the report in your hand.": "Kolo po kolo, izmereno pod opterećenjem. Stan se pali, a zapisnik vam je u ruci.",
  Day: "Dan",
  Copper: "Bakar",
  Circuits: "Kola",
  "Floor plan of a flat: walls, wiring, the board, and every room lit": "Plan stana: zidovi, kablovi, tabla i svaka prostorija osvetljena",
  "Living room": "Dnevna",
  Kitchen: "Kuhinja",
  Bathroom: "Kupatilo",
  Bedroom: "Spavaća",
  Study: "Soba",

  // ── Services ──
  "Eight circuits.": "Osam kola.",
  "One number to call.": "Jedan broj za sve.",
  "From one loose socket to a whole building's board. The same people, the same standard of work.": "Od jedne labave utičnice do table cele zgrade. Isti ljudi, isti standard rada.",
  "press a breaker to see what's on it": "pritisnite osigurač da vidite šta je na njemu",
  Price: "Cena",
  Time: "Vreme",
  "Ask about this": "Pitajte za ovo",

  // ── Faults ──
  "What is your home doing right now?": "Šta vam kuća radi upravo sada?",
  "Pick a symptom": "Izaberite šta se dešava",
  "Call now": "Zovite odmah",
  Today: "Danas",
  "No rush": "Nije hitno",
  Nominal: "Nazivni",
  "What you can do": "Šta možete sami",
  "What we do": "Šta mi radimo",

  // ── Prices ──
  "The number on the quote": "Cifra iz ponude",
  "is the number on the invoice.": "je cifra na računu.",
  "New wiring, estimate": "Nova instalacija, procena",
  "From {price}": "Od {price}",
  "Floor area": "Površina",
  "Kind of job": "Vrsta posla",
  "Replacing old wiring": "Zamena stare instalacije",
  "New build": "Novogradnja",
  "Smart home": "Pametna kuća",
  "Includes materials and labour. A rough guide; after one visit you get a fixed number in writing.": "Sa materijalom i radom. Okvirna procena; posle jednog dolaska dobijate fiksnu cifru u pisanom obliku.",
  "Fixed prices for the everyday jobs": "Fiksne cene za svakodnevne poslove",
  "Every price includes tax. You hear the callout fee on the phone, before we set off.": "Sve cene su sa PDV-om. Cenu izlaska čujete telefonom, pre nego što krenemo.",

  // ── Process ──
  "How it goes": "Kako ide",
  "Five steps,": "Pet koraka,",
  "and no surprises in any of them.": "i nijedno iznenađenje.",

  // ── Work ──
  "Judge us by the first night": "Procenite nas po prvoj noći",
  "the lights come on.": "kad se svetla upale.",
  "Turn the lights off": "Ugasi svetlo",
  "Turn the lights on": "Upali svetlo",

  // ── Report ──
  Proof: "Dokaz",
  "Measured,": "Izmereno,",
  "not guessed.": "ne nagađano.",
  "Before we leave, every circuit goes through a calibrated tester. You get the numbers on paper, signed, for your insurer, your buyer or your own peace of mind.": "Pre nego što odemo, svako kolo prolazi kroz baždaren instrument. Brojke dobijate na papiru, potpisane, za osiguranje, kupca ili sopstveni mir.",
  "Licensed electricians, no subcontractors": "Licencirani električari, bez podizvođača",
  "Three years of guarantee on the work": "Tri godine garancije na radove",
  "A test report with every job": "Zapisnik o merenju uz svaki posao",
  "Test report": "Zapisnik o ispitivanju",
  Signed: "Potpis",
  Passed: "Ispravno",

  // ── Reviews ──
  "Word gets around": "Glas se brzo",
  "the building.": "pročuje po zgradi.",
  "Sample reviews for this concept": "Primeri utisaka za ovaj koncept",

  // ── FAQ ──
  Questions: "Pitanja",
  "What people ask": "Šta ljudi pitaju",
  "before they call.": "pre nego što pozovu.",

  // ── Area ──
  "Where we work": "Gde radimo",
  "{area} and around.": "{area} i okolina.",
  "All of Novi Sad, both banks.": "Ceo Novi Sad, obe obale.",
  "average arrival in {place}": "prosečan dolazak: {place}",
  "Service area map of Novi Sad": "Mapa područja rada u Novom Sadu",
  DANUBE: "DUNAV",
  "Map: {place}": "Mapa: {place}",

  // ── Contact ──
  "Close the circuit.": "Zatvorite kolo.",
  "Tell us what's going on and we'll call back within 30 minutes, with a time and a price. If it's sparking or smells of burning, don't type: call.": "Recite šta se dešava i javljamo se za 30 minuta, sa terminom i cenom. Ako varniči ili miriše na izgorelo, nemojte da kucate: pozovite.",
  "What do you need?": "Šta vam treba?",
  "Your name": "Vaše ime",
  Phone: "Telefon",
  "What's happening? (optional)": "Šta se dešava? (nije obavezno)",
  "Send the request": "Pošaljite zahtev",
  "Please tell us your name.": "Molimo vas, napišite ime.",
  "We need a number we can call you back on.": "Treba nam broj na koji možemo da vas pozovemo.",
  "The light's on.": "Svetlo gori.",
  "Thanks. We'll call you within 30 minutes. (This is a concept site, so nothing was actually sent.)": "Hvala. Javljamo se za 30 minuta. (Ovo je koncept sajt, pa ništa nije zaista poslato.)",
};
