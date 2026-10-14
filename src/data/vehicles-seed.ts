// Semilla de inventario REAL -- exportación oficial de Coches.net PRO
// (fuente del propio negocio, Automóviles Lucero), importada 01/10/2026,
// refrescada 14/10/2026 con el export "hoy" (reemplaza por completo la lista
// anterior -- los vehículos que ya no aparecen en el export se entienden
// vendidos/retirados; no se inventan ni se conservan a mano).
// category viene directo del campo real "carroceria" del feed, no inventado --
// valores reales observados: ['4x4', 'Berlina', 'Familiar', 'Industriales',
// 'Monovolumen'].
//
// Para regenerar este archivo a partir de un nuevo export XML de Coches.net
// PRO: pegar el XML y pedir a Claude que repita el proceso de refresco de
// inventario (no existe de momento un script automatizado de import).

export type Vehicle = {
  id: string;
  ref_cochesnet: string | null;
  ref_wallapop: string | null;
  ref_dealcar?: string | null; // referencia interna de Dealcar (si el vehículo viene de ese feed, ver scripts/import-dealcar.mjs)
  category: "Monovolumen" | "Berlina" | "Industriales" | "4x4" | "Familiar" | "Coupé" | "Cabrio" | "Otro";
  make: string;
  model: string;
  version: string;
  year: number | null;
  year_note: string | null;
  km: number;
  fuel: string;
  power_cv: number;
  price_eur: number;
  stock_status: "available" | "reserved" | "sold" | "workshop" | "not_roadworthy" | "unknown";
  validation_status: "owner_confirmed" | "document_verified" | "observed_public" | "conflict" | "expired";
  known_defects: string | null;
  warranty_note: string | null;
  conflicts: string[];
  source: string;
  source_updated_at: string;
};

const SOURCE = "Coches.net PRO (exportación oficial del negocio, feed XML)";
const IMPORTED = "2026-10-14";

export const vehiclesSeed: Vehicle[] = [
  {
    id: "lucero-cn20638303", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Mercedes-Benz", model: "Clase R", version: "R 320 CDI 4MATIC",
    year: 2006, year_note: null, km: 516000, fuel: "Diesel", power_cv: 224, price_eur: 9490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20643841", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "BMW", model: "Serie 3", version: "330d xDrive",
    year: 2010, year_note: null, km: 290000, fuel: "Diesel", power_cv: 245, price_eur: 8890,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20677977", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Renault", model: "Scenic", version: "Zen Energy dCi 81kW 110CV",
    year: 2018, year_note: null, km: 259000, fuel: "Diesel", power_cv: 110, price_eur: 7990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20687617", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Peugeot", model: "Expert", version: "Furgon BlueHDi 100 SS 6v Long",
    year: 2023, year_note: null, km: 200000, fuel: "Diesel", power_cv: 102, price_eur: 9990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20687650", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Peugeot", model: "Expert", version: "Furgon Pro 1.5 BlueHDi 100 Long",
    year: 2022, year_note: null, km: 220000, fuel: "Diesel", power_cv: 102, price_eur: 9990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20687707", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Seat", model: "Altea XL", version: "1.6 TDI 105cv SS EEcomotive ITech",
    year: 2014, year_note: null, km: 248000, fuel: "Diesel", power_cv: 105, price_eur: 4490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20688275", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Volkswagen", model: "Tiguan", version: "2.0 TDI 4M 140cv DSG RLine",
    year: 2010, year_note: null, km: 350000, fuel: "Diesel", power_cv: 140, price_eur: 6490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20691714", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Mercedes-Benz", model: "Clase A", version: "A 150",
    year: 2009, year_note: null, km: 310000, fuel: "Gasolina", power_cv: 95, price_eur: 2990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20692684", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Mitsubishi", model: "Outlander", version: "2.0 DID Kaiteki",
    year: 2007, year_note: null, km: 294000, fuel: "Diesel", power_cv: 140, price_eur: 3990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: null, conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20743464", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Peugeot", model: "5008", version: "Allure 1.6 BlueHDi 120 EAT6",
    year: 2016, year_note: null, km: 280000, fuel: "Diesel", power_cv: 120, price_eur: 4990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20743497", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Volkswagen", model: "Polo", version: "1.4 85cv Advance",
    year: 2012, year_note: null, km: 210000, fuel: "Gasolina", power_cv: 85, price_eur: 4990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20743579", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Mercedes-Benz", model: "Viano", version: "3.0 CDI Trend Larga",
    year: 2012, year_note: null, km: 600000, fuel: "Diesel", power_cv: 224, price_eur: 10900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20782521", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Toyota", model: "Aygo", version: "1.4D Blue",
    year: 2009, year_note: null, km: 290000, fuel: "Diesel", power_cv: 54, price_eur: 2490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20782640", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Volkswagen", model: "Golf", version: "VI 2.0 TDI 170cv GTD",
    year: 2009, year_note: null, km: 340000, fuel: "Diesel", power_cv: 170, price_eur: 4990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20782940", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Volkswagen", model: "Transporter", version: "Caja Plataf DC Largo 2.0 TDI BMT 114CV",
    year: 2014, year_note: null, km: 428000, fuel: "Diesel", power_cv: 114, price_eur: 7990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "6 meses", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20785249", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Fiat", model: "Doblo", version: "Panorama Dynamic 1.6 Multijet 90cv",
    year: 2012, year_note: null, km: 270000, fuel: "Diesel", power_cv: 90, price_eur: 1990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: null, conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20798607", ref_cochesnet: null, ref_wallapop: null,
    category: "Familiar",
    make: "Peugeot", model: "308", version: "SW Allure BlueHDI 130 SS EAT8",
    year: 2023, year_note: null, km: 200000, fuel: "Diesel", power_cv: 130, price_eur: 8990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20805948", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Audi", model: "Q5", version: "2.0 TDI 170cv quattro DPF",
    year: 2009, year_note: null, km: 320000, fuel: "Diesel", power_cv: 170, price_eur: 7490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20805996", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Audi", model: "Q3", version: "2.0 TDI 177cv quattro S tronic Advance",
    year: 2012, year_note: null, km: 290000, fuel: "Diesel", power_cv: 177, price_eur: 8490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20837864", ref_cochesnet: null, ref_wallapop: null,
    category: "Familiar",
    make: "Volkswagen", model: "Passat", version: "Variant Executive 2.0 TDI 90kW 122CV D",
    year: 2022, year_note: null, km: 190000, fuel: "Diesel", power_cv: 122, price_eur: 11490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838012", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Fiat", model: "Talento", version: "M1 1.2 SX Corto 1.6 EcoJet 107kW 145CV",
    year: 2017, year_note: null, km: 230000, fuel: "Diesel", power_cv: 145, price_eur: 13990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838052", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Peugeot", model: "Boxer", version: "335 L3 BHDI 103kW 140CV SS 6 Vel. MAN",
    year: 2022, year_note: null, km: 190000, fuel: "Diesel", power_cv: 140, price_eur: 25900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838078", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Audi", model: "A7", version: "Sportback 50 TDI 210kW quattro triptron.",
    year: 2019, year_note: null, km: 200000, fuel: "Diesel", power_cv: 286, price_eur: 26900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838099", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Audi", model: "SQ7", version: "4.0 TDI quattro tiptronic",
    year: 2017, year_note: null, km: 130000, fuel: "Diesel", power_cv: 435, price_eur: 39900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838141", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Porsche", model: "Cayenne", version: "4.1 S Diesel Tiptronic",
    year: 2013, year_note: null, km: 270000, fuel: "Diesel", power_cv: 382, price_eur: 22900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838180", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Maserati", model: "Ghibli", version: "S Q4 3.0 V6 BT 410cv AWD",
    year: 2016, year_note: null, km: 177000, fuel: "Gasolina", power_cv: 410, price_eur: 27990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20838343", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Mercedes-Benz", model: "Clase B", version: "B 200 d Urban",
    year: 2016, year_note: null, km: 270000, fuel: "Diesel", power_cv: 136, price_eur: 8990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20866933", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Nissan", model: "QASHQAI2", version: "1.5 dCi TEKNA SPORT 4x2 17",
    year: 2010, year_note: null, km: 200000, fuel: "Diesel", power_cv: 106, price_eur: 5490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20895358", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "MINI", model: "MINI", version: "Cooper",
    year: 2012, year_note: null, km: 200000, fuel: "Gasolina", power_cv: 122, price_eur: 4990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20895414", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Ford", model: "Grand Tourneo Connect", version: "1.5 TDCi 88kW 120CV Titanium",
    year: 2018, year_note: null, km: 270000, fuel: "Diesel", power_cv: 120, price_eur: 9490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20926660", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Opel", model: "Astra", version: "1.6 CDTi SS 100kW 136CV Selective Pro",
    year: 2018, year_note: null, km: 232000, fuel: "Diesel", power_cv: 136, price_eur: 6900,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20926827", ref_cochesnet: null, ref_wallapop: null,
    category: "4x4",
    make: "Toyota", model: "Rav4", version: "2.5l hybrid 2WD Executive",
    year: 2018, year_note: null, km: 234000, fuel: "Otros", power_cv: 197, price_eur: 14990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20926900", ref_cochesnet: null, ref_wallapop: null,
    category: "Monovolumen",
    make: "Citroen", model: "Grand C4 Picasso", version: "BlueHDi 110KW 150CV Shine",
    year: 2016, year_note: null, km: 265000, fuel: "Diesel", power_cv: 150, price_eur: 6990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20926917", ref_cochesnet: null, ref_wallapop: null,
    category: "Berlina",
    make: "Seat", model: "Ibiza", version: "1.4 TDI 80cv Hit",
    year: 2008, year_note: null, km: 200000, fuel: "Diesel", power_cv: 80, price_eur: 2490,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
  {
    id: "lucero-cn20951834", ref_cochesnet: null, ref_wallapop: null,
    category: "Industriales",
    make: "Mercedes-Benz", model: "Citan", version: "108 CDI Furgon Largo",
    year: 2019, year_note: null, km: 248000, fuel: "Diesel", power_cv: 80, price_eur: 6990,
    stock_status: "available", validation_status: "owner_confirmed",
    known_defects: null, warranty_note: "12 meses (1 año)", conflicts: [],
    source: SOURCE, source_updated_at: IMPORTED,
  },
];
