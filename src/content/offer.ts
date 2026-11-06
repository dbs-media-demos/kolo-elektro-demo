import type { StaticImageData } from "next/image";
import type { Lang } from "@/lib/biz-core";
import type { Market } from "@/lib/biz";
import panelTest from "@/assets/photos/panel-test.jpg";
import renovation from "@/assets/photos/renovation.jpg";
import slats from "@/assets/photos/slats.jpg";
import kitchen from "@/assets/photos/kitchen.jpg";
import pendants from "@/assets/photos/pendants.jpg";
import ev from "@/assets/photos/ev.jpg";
import smart from "@/assets/photos/smart.jpg";
import socket from "@/assets/photos/socket.jpg";
import switchFit from "@/assets/photos/switch-fit.jpg";

/**
 * What the business sells and how it talks about it: everything the CRM doesn't fill in. Lists are
 * written per language; prices per market (dinars in Serbia, dollars on an English preview).
 * Short UI strings go through i18n/sr instead.
 */
type ByLang<T> = Record<Lang, T>;
type ByMarket = Record<Market, string>;

export type Service = { name: string; note: string; line: string; time: string; from: ByMarket; photo: StaticImageData; alt: string };

const servicePhotos = [switchFit, renovation, panelTest, pendants, socket, ev, smart, panelTest];
const serviceFrom: ByMarket[] = [
  { rs: "od 2.500 din", us: "from $89" },
  { rs: "od 2.400 din/m²", us: "from $4/sq ft" },
  { rs: "od 28.000 din", us: "from $1,400" },
  { rs: "od 2.500 din", us: "from $85" },
  { rs: "od 1.200 din", us: "from $35" },
  { rs: "od 18.000 din", us: "from $650" },
  { rs: "od 45.000 din", us: "from $1,200" },
  { rs: "od 9.000 din", us: "from $180" },
];

const servicesEn: Omit<Service, "from" | "photo">[] = [
  { name: "Emergency callouts", note: "24/7", line: "Sparking socket, half the flat dark, a breaker that won't stay up. We find the fault, make it safe and fix it, usually on the first visit.", time: "Within 60 min", alt: "An electrician fitting a switch plate on a dark wall" },
  { name: "New wiring & rewiring", note: "flat / house", line: "From bare brick to first light: routes planned with you, cables chased in, walls left clean. Old aluminium replaced with copper.", time: "4–6 days per flat", alt: "An electrician on a ladder working on the ceiling of a room under renovation" },
  { name: "Distribution boards", note: "RCD + labels", line: "Old fuses out, a new board with an RCD on every circuit, combed wiring and a directory you can actually read.", time: "1 day", alt: "Gloved hands testing a distribution board with a meter" },
  { name: "Lighting", note: "inside & out", line: "Chandeliers hung level, LED strips with no visible dots, dimmers that don't hum, facade and garden lights.", time: "From 1 hour", alt: "Warm globe pendants hanging from a ceiling" },
  { name: "Sockets & switches", note: "small jobs too", line: "One socket or forty. No minimum, and we leave the wall as we found it.", time: "From 30 min", alt: "A black socket and switch on a pale wall" },
  { name: "EV chargers", note: "3.7–22 kW", line: "We check your supply first, then fit a wallbox with its own protected circuit and show you how to use it.", time: "1 day", alt: "A driver plugging a charging cable into an electric car" },
  { name: "Smart home", note: "no cloud required", line: "Lights, blinds and heating on one panel and your phone. Wired to keep working as ordinary switches if the internet is down.", time: "2–5 days", alt: "A finger turning a dial on a smart home wall panel" },
  { name: "Testing & reports", note: "signed", line: "Insulation, earth and RCD trip times measured with a calibrated tester, with a signed report for your insurer, buyer or inspector.", time: "Half a day", alt: "An electrician measuring a board with a tester" },
];

const servicesSr: Omit<Service, "from" | "photo">[] = [
  { name: "Hitne intervencije", note: "0–24", line: "Varniči utičnica, pola stana u mraku, osigurač koji ne može da se podigne. Nađemo kvar, obezbedimo ga i popravimo, najčešće iz prve.", time: "Do 60 min", alt: "Električar montira masku prekidača na tamnom zidu" },
  { name: "Nove instalacije i zamena", note: "stan / kuća", line: "Od gole cigle do prvog svetla: trasu dogovaramo s vama, kablovi u šlicevima, zidovi ostaju čisti. Stari aluminijum menjamo bakrom.", time: "4–6 dana po stanu", alt: "Električar na merdevinama radi na plafonu prostorije u renoviranju" },
  { name: "Razvodne table", note: "FID + oznake", line: "Stari osigurači napolje: nova tabla, FID sklopka, uredno složeni provodnici i spisak kola koji zaista može da se pročita.", time: "1 dan", alt: "Ruke u rukavicama ispituju razvodnu tablu instrumentom" },
  { name: "Rasveta", note: "unutra i napolju", line: "Lusteri okačeni pod libelu, LED trake bez vidljivih tačaka, dimeri koji ne bruje, fasadna i baštenska svetla.", time: "Od 1 sata", alt: "Tople staklene lampe vise sa plafona" },
  { name: "Utičnice i prekidači", note: "i sitni poslovi", line: "Jedna utičnica ili četrdeset. Nema minimuma, a zid ostaje kakav je bio.", time: "Od 30 min", alt: "Crna utičnica i prekidač na svetlom zidu" },
  { name: "Punjači za automobile", note: "3,7–22 kW", line: "Prvo proverimo vaš priključak, pa ugradimo punjač na posebnom, zaštićenom kolu i pokažemo vam kako se koristi.", time: "1 dan", alt: "Vozač uključuje kabl za punjenje u električni automobil" },
  { name: "Pametna kuća", note: "bez obaveznog oblaka", line: "Svetla, roletne i grejanje na jednom panelu i telefonu. Povezano tako da radi kao običan prekidač i kad nema interneta.", time: "2–5 dana", alt: "Prst okreće točkić na zidnom panelu pametne kuće" },
  { name: "Merenja i zapisnik", note: "potpisano", line: "Izolacija, uzemljenje i vreme reagovanja FID-a, izmereni baždarenim instrumentom, uz potpisan zapisnik za osiguranje, kupca ili inspekciju.", time: "Pola dana", alt: "Električar meri razvodnu tablu instrumentom" },
];

export const services: ByLang<Service[]> = {
  en: servicesEn.map((s, i) => ({ ...s, from: serviceFrom[i], photo: servicePhotos[i] })),
  sr: servicesSr.map((s, i) => ({ ...s, from: serviceFrom[i], photo: servicePhotos[i] })),
};

/** What the fault finder's wave does for each symptom. Voltage is a share of nominal (230 V / 120 V). */
export type WaveShape = { amp: number; noise: number; dip: number; spike: number; flat: number; volts: number };
export type Fault = { label: string; urgency: "now" | "today" | "soon"; cause: string; you: string; we: string; from: ByMarket; wave: WaveShape };

const faultWaves: WaveShape[] = [
  { amp: 1, noise: 0.008, dip: 0, spike: 0, flat: 0, volts: 1 },
  { amp: 1, noise: 0.03, dip: 0.82, spike: 0, flat: 0, volts: 0.82 },
  { amp: 0.72, noise: 0.07, dip: 0.34, spike: 0, flat: 0, volts: 0.8 },
  { amp: 0.95, noise: 0.1, dip: 0, spike: 1, flat: 0, volts: 0.93 },
  { amp: 0.04, noise: 0.012, dip: 0, spike: 0, flat: 1, volts: 0 },
];
const faultFrom: ByMarket[] = [
  { rs: "—", us: "—" },
  { rs: "od 2.500 din", us: "from $89" },
  { rs: "od 2.500 din", us: "from $89" },
  { rs: "od 3.500 din", us: "from $120" },
  { rs: "od 2.500 din", us: "from $89" },
];

const faultsEn: Omit<Fault, "from" | "wave">[] = [
  { label: "Everything's fine", urgency: "soon", cause: "A healthy wave: clean, steady, on the nominal voltage. This is what your home should look like.", you: "Nothing. If the wiring is over 30 years old, a test once is still worth it.", we: "A one-visit check of the board, earth and RCD, with a written report.", },
  { label: "A breaker keeps tripping", urgency: "today", cause: "An overload, a failing appliance or damp in a junction box. The breaker is doing its job, so don't hold it up.", you: "Unplug everything on that circuit and try once. If it trips with nothing plugged in, leave it down.", we: "Isolate the circuit with a tester, find the exact point and repair it." },
  { label: "Lights flicker", urgency: "today", cause: "Usually a loose neutral or a tired connection. Voltage sags and swings, and that can damage appliances.", you: "Unplug sensitive electronics. If bulbs flare brighter than normal, turn the main off and call.", we: "Measure under load, tighten and rebuild the connection, check the supply." },
  { label: "A socket sparks or smells", urgency: "now", cause: "A burning connection. It gets hotter every minute it stays live, and this is how wall fires start.", you: "Switch off that circuit at the board now and don't touch the socket. Call us.", we: "Here within the hour. Replace the socket and the burnt section of cable." },
  { label: "Part of the home is dead", urgency: "today", cause: "A tripped RCD, a dead phase or a broken conductor in the wall. No voltage on that side at all.", you: "Check the board and try the RCD once. Ask a neighbour whether they have power.", we: "Trace the line, find the break without opening walls wherever possible." },
];

const faultsSr: Omit<Fault, "from" | "wave">[] = [
  { label: "Sve je u redu", urgency: "soon", cause: "Zdrav talas: čist, miran, na nazivnom naponu. Ovako treba da izgleda struja u vašem domu.", you: "Ništa. Ako je instalacija starija od 30 godina, jedno merenje svakako vredi.", we: "Pregled table, uzemljenja i FID-a u jednom dolasku, uz pisani zapisnik." },
  { label: "Izbacuje osigurač", urgency: "today", cause: "Preopterećenje, neispravan uređaj ili vlaga u razvodnoj kutiji. Osigurač radi svoj posao, zato ga nemojte držati na silu.", you: "Isključite sve sa tog kola i probajte jednom. Ako izbaci i kad je sve isključeno, ostavite ga dole.", we: "Instrumentom izdvojimo kolo, nađemo tačno mesto kvara i popravimo." },
  { label: "Treperi svetlo", urgency: "today", cause: "Najčešće labava nula ili umoran spoj. Napon pada i skače, a to može da ošteti uređaje.", you: "Isključite osetljivu elektroniku. Ako sijalice zasvetle jače nego inače, isključite glavnu sklopku i pozovite.", we: "Merimo pod opterećenjem, stežemo i obnavljamo spoj, proveravamo priključak." },
  { label: "Varniči ili miriše utičnica", urgency: "now", cause: "Spoj koji gori. Svakog minuta pod naponom je sve topliji, i baš tako počinju požari u zidu.", you: "Odmah isključite to kolo na tabli i ne dirajte utičnicu. Pozovite nas.", we: "Stižemo za sat vremena. Menjamo utičnicu i izgoreli deo kabla." },
  { label: "Pola stana bez struje", urgency: "today", cause: "Izbačen FID, ispala faza ili prekinut provodnik u zidu. Na toj strani napona nema uopšte.", you: "Pogledajte tablu i probajte FID jednom. Pitajte komšiju da li on ima struje.", we: "Pratimo trasu i nalazimo prekid, kad god može bez otvaranja zidova." },
];

export const faults: ByLang<Fault[]> = {
  en: faultsEn.map((f, i) => ({ ...f, from: faultFrom[i], wave: faultWaves[i] })),
  sr: faultsSr.map((f, i) => ({ ...f, from: faultFrom[i], wave: faultWaves[i] })),
};

/** The estimator behind the meter. Rate is per unit of floor area, low and high. */
export const estimator: Record<Market, { unit: string; min: number; max: number; step: number; start: number; rate: Record<"rewire" | "new", [number, number]>; currency: string; format: (n: number) => string }> = {
  rs: { unit: "m²", min: 30, max: 240, step: 2, start: 68, rate: { rewire: [3200, 4600], new: [2400, 3600] }, currency: "RSD", format: (n) => `${n.toLocaleString("de-DE")} din` },
  us: { unit: "sq ft", min: 400, max: 3200, step: 50, start: 1200, rate: { rewire: [5, 8], new: [4, 6] }, currency: "USD", format: (n) => `$${n.toLocaleString("en-US")}` },
};

export type PriceRow = { name: string; price: ByMarket };
export const priceList: ByLang<PriceRow[]> = {
  en: [
    { name: "Callout & diagnosis (free if we do the job)", price: { rs: "2.500 din", us: "$89" } },
    { name: "Socket or switch replaced", price: { rs: "from 1.200 din", us: "from $35" } },
    { name: "Chandelier hung and connected", price: { rs: "from 2.500 din", us: "from $85" } },
    { name: "RCD fitted", price: { rs: "from 6.500 din", us: "from $220" } },
    { name: "New distribution board", price: { rs: "from 28.000 din", us: "from $1,400" } },
    { name: "Nights, Sundays, holidays", price: { rs: "+50%", us: "+50%" } },
  ],
  sr: [
    { name: "Izlazak i dijagnostika (gratis ako radimo posao)", price: { rs: "2.500 din", us: "$89" } },
    { name: "Zamena utičnice ili prekidača", price: { rs: "od 1.200 din", us: "from $35" } },
    { name: "Kačenje i povezivanje lustera", price: { rs: "od 2.500 din", us: "from $85" } },
    { name: "Ugradnja FID sklopke", price: { rs: "od 6.500 din", us: "from $220" } },
    { name: "Nova razvodna tabla", price: { rs: "od 28.000 din", us: "from $1,400" } },
    { name: "Noću, nedeljom i praznikom", price: { rs: "+50%", us: "+50%" } },
  ],
};

export type Step = { title: string; line: string; tag: string };
export const steps: ByLang<Step[]> = {
  en: [
    { title: "You call, we answer", line: "A person who knows the trade picks up. Tell us what's happening and we'll tell you what to do in the next ten minutes.", tag: "24/7" },
    { title: "We give you a time, and keep it", line: "A two-hour window at most, and a message when we're on the way. If we're ever late, the callout is on us.", tag: "On time or free" },
    { title: "The price, before the first screw", line: "We look, measure and write the number down. You say yes before any work starts, and that number doesn't grow.", tag: "Fixed quote" },
    { title: "Clean work", line: "Floors covered, dust extracted, old material taken away. The only sign we were there is that everything works.", tag: "Covers on" },
    { title: "Measured, signed, guaranteed", line: "Every circuit tested with a calibrated meter. You get the report, the labelled board and three years of guarantee.", tag: "3 years" },
  ],
  sr: [
    { title: "Pozovete, javimo se", line: "Javlja se čovek koji zna posao. Recite šta se dešava, a mi vam kažemo šta da radite u narednih deset minuta.", tag: "0–24" },
    { title: "Kažemo termin i držimo ga", line: "Najviše dva sata razmaka i poruka kad krenemo. Ako ikad zakasnimo, izlazak je na nas.", tag: "Na vreme ili gratis" },
    { title: "Cena pre prvog šrafa", line: "Pogledamo, izmerimo i zapišemo cifru. Vi kažete „može” pre nego što radovi počnu, a cifra posle ne raste.", tag: "Fiksna ponuda" },
    { title: "Čist posao", line: "Podovi zaštićeni, prašina usisana, stari materijal odnet. Jedini trag da smo bili je to što sve radi.", tag: "Sa navlakama" },
    { title: "Izmereno, potpisano, garantovano", line: "Svako kolo ispitano baždarenim instrumentom. Dobijate zapisnik, označenu tablu i tri godine garancije.", tag: "3 godine" },
  ],
};

export type Job = { title: string; place: string; note: string; photo: StaticImageData; alt: string };
const jobPhotos = [renovation, slats, kitchen];
export const jobs: ByLang<Job[]> = {
  en: [
    { title: "Full rewire, 68 m² flat", place: "Liman 3", note: "Aluminium out, copper in, 14 circuits. Five days, and the neighbours only noticed on day one.", photo: jobPhotos[0], alt: "An electrician on a ladder wiring the ceiling of a flat under renovation" },
    { title: "Slatted wall, hidden light", place: "Grbavica", note: "Fittings aimed by hand, wiring out of sight, one dimmer for the whole wall.", photo: jobPhotos[1], alt: "An electrician adjusting a ceiling light above a warm slatted wall" },
    { title: "Kitchen under-cabinet LED", place: "Sremska Kamenica", note: "One clean line of light with no visible dots, on its own circuit.", photo: jobPhotos[2], alt: "A dark kitchen lit by one line of light under the cabinets" },
  ],
  sr: [
    { title: "Kompletna zamena, stan 68 m²", place: "Liman 3", note: "Aluminijum napolje, bakar unutra, 14 kola. Pet dana, a komšije su primetile samo prvi.", photo: jobPhotos[0], alt: "Električar na merdevinama vodi kablove po plafonu stana u renoviranju" },
    { title: "Zid od letvica, skriveno svetlo", place: "Grbavica", note: "Lampe usmerene ručno, kablovi van pogleda, jedan dimer za ceo zid.", photo: jobPhotos[1], alt: "Električar podešava plafonsku lampu iznad toplog zida od letvica" },
    { title: "LED ispod kuhinjskih elemenata", place: "Sremska Kamenica", note: "Jedna čista linija svetla bez vidljivih tačaka, na svom kolu.", photo: jobPhotos[2], alt: "Tamna kuhinja osvetljena jednom linijom svetla ispod elemenata" },
  ],
};

export type Reading = { name: string; value: string; limit: string };
export const readings: ByLang<Reading[]> = {
  en: [
    { name: "Insulation resistance", value: "312 MΩ", limit: "≥ 1 MΩ" },
    { name: "Earth resistance", value: "3.2 Ω", limit: "≤ 10 Ω" },
    { name: "Fault loop impedance", value: "0.42 Ω", limit: "≤ 1.44 Ω" },
    { name: "RCD trip time, 30 mA", value: "18 ms", limit: "≤ 300 ms" },
    { name: "Polarity, all circuits", value: "14 / 14", limit: "14" },
  ],
  sr: [
    { name: "Otpor izolacije", value: "312 MΩ", limit: "≥ 1 MΩ" },
    { name: "Otpor uzemljenja", value: "3,2 Ω", limit: "≤ 10 Ω" },
    { name: "Impedansa petlje kvara", value: "0,42 Ω", limit: "≤ 1,44 Ω" },
    { name: "Vreme reagovanja FID-a, 30 mA", value: "18 ms", limit: "≤ 300 ms" },
    { name: "Polaritet, sva kola", value: "14 / 14", limit: "14" },
  ],
};

export type Review = { text: string; who: string; job: string };
export const reviews: ByLang<Review[]> = {
  en: [
    { text: "Half the flat went dark at 9 pm with a baby asleep. They were at the door in 40 minutes, found a burnt junction box and had the lights back before 11.", who: "Jelena M.", job: "Emergency callout" },
    { text: "The quote said 412,000 and the invoice said 412,000. I have renovated three flats and that has never happened to me before.", who: "Nikola R.", job: "Full rewire" },
    { text: "They replaced our 40-year-old board and labelled every circuit. I can finally tell which switch does the boiler, and so can my mother.", who: "Tamara S.", job: "New board" },
  ],
  sr: [
    { text: "Pola stana se ugasilo u devet uveče, a beba spava. Bili su na vratima za 40 minuta, našli izgorelu kutiju i vratili svetlo pre jedanaest.", who: "Jelena M.", job: "Hitna intervencija" },
    { text: "U ponudi je pisalo 412.000, na računu je pisalo 412.000. Renovirao sam tri stana i to mi se nikad ranije nije desilo.", who: "Nikola R.", job: "Zamena instalacije" },
    { text: "Zamenili su nam tablu staru 40 godina i označili svako kolo. Konačno znam šta gasi bojler, a zna i moja mama.", who: "Tamara S.", job: "Nova tabla" },
  ],
};

export type Qa = { q: string; a: string };
export const faq: ByLang<Qa[]> = {
  en: [
    { q: "How fast can you get here?", a: "Emergencies within 60 minutes, day or night. Everything else usually the same or next day, in a two-hour window, with a message when we're on the way." },
    { q: "Do you charge for coming out?", a: "A fixed callout covers the visit and diagnosis. If you go ahead with the work, it's free. You'll hear the amount on the phone, before we set off." },
    { q: "My flat still has aluminium wiring. Is that dangerous?", a: "It isn't an emergency, but connections loosen and heat up with age, and it wasn't made for today's loads. We measure it first and tell you honestly whether to replace everything or only the worst circuits." },
    { q: "Do you have to break the walls?", a: "For a full rewire, yes, but in tidy, dust-extracted chases that are filled again. For faults we use a cable tracer and open the wall only where we have to." },
    { q: "Will I get an invoice and a guarantee?", a: "Always: an invoice, a signed test report and three years of guarantee on the work. Materials carry the manufacturer's guarantee on top." },
    { q: "Do you work with builders and offices?", a: "Yes. We fit around your schedule, work out of hours in occupied spaces, and hand over documentation your inspector will accept." },
  ],
  sr: [
    { q: "Koliko brzo možete da stignete?", a: "Hitno do 60 minuta, i danju i noću. Sve ostalo najčešće isti ili sledeći dan, u razmaku od dva sata, uz poruku kad krenemo." },
    { q: "Da li se izlazak naplaćuje?", a: "Fiksan izlazak pokriva dolazak i dijagnostiku. Ako nastavimo s poslom, ne plaćate ga. Iznos čujete telefonom, pre nego što krenemo." },
    { q: "U stanu još imam aluminijum. Da li je to opasno?", a: "Nije hitan slučaj, ali se spojevi vremenom olabave i greju, a instalacija nije pravljena za današnja opterećenja. Prvo izmerimo, pa vam iskreno kažemo da li da menjate sve ili samo najgora kola." },
    { q: "Morate li da bušite zidove?", a: "Kod kompletne zamene da, ali u urednim šlicevima sa usisavanjem prašine, koji se posle zatvaraju. Kod kvarova koristimo tragač kablova i zid otvaramo samo gde se mora." },
    { q: "Da li dobijam račun i garanciju?", a: "Uvek: račun, potpisan zapisnik o merenju i tri godine garancije na radove. Na materijal važi i garancija proizvođača." },
    { q: "Radite li sa izvođačima i kancelarijama?", a: "Da. Uklapamo se u vaš raspored, radimo van radnog vremena u prostoru koji se koristi i predajemo dokumentaciju koju inspekcija prihvata." },
  ],
};

/** The concept's service area, as nodes on a circuit board (viewBox 0 0 800 620). Minutes from the van's usual spot. */
export type Node = { name: string; x: number; y: number; min: number; path: string };
export const nodes: Node[] = [
  { name: "Centar", x: 400, y: 300, min: 15, path: "M400 330 V300" },
  { name: "Podbara", x: 520, y: 240, min: 20, path: "M400 330 H470 L520 280 V240" },
  { name: "Salajka", x: 420, y: 150, min: 25, path: "M400 330 H350 V190 L390 150 H420" },
  { name: "Detelinara", x: 230, y: 130, min: 25, path: "M400 330 H330 L230 230 V130" },
  { name: "Novo naselje", x: 110, y: 240, min: 30, path: "M400 330 H270 L170 240 H110" },
  { name: "Telep", x: 150, y: 370, min: 25, path: "M400 330 H230 L190 370 H150" },
  { name: "Grbavica", x: 300, y: 400, min: 15, path: "M400 330 H340 L300 370 V400" },
  { name: "Liman", x: 450, y: 420, min: 15, path: "M400 330 H430 L450 350 V420" },
  { name: "Petrovaradin", x: 716, y: 440, min: 25, path: "M400 330 H580 L716 400 V440" },
  { name: "Sremska Kamenica", x: 450, y: 570, min: 30, path: "M400 330 H380 L410 360 V530 L450 570" },
  { name: "Veternik", x: 60, y: 430, min: 35, path: "M400 330 H250 L170 430 H60" },
];
