// scripts/push_fake_drop.js
import fs from "fs";
import path from "path";

const MOCK_PATH = path.join(process.cwd(), "data", "mock_inventory.json");
if (!fs.existsSync(MOCK_PATH)) {
  fs.writeFileSync(MOCK_PATH, JSON.stringify({ assets: [], descriptions: [] }, null, 2));
}

const db = JSON.parse(fs.readFileSync(MOCK_PATH, "utf8"));
const tier = process.argv[2] || "blue"; // rareté passée en argument

// --- Pools d’items réels CS2 selon rareté ---
const POOLS = {
  blue: [
    { name: "P250 | Boreal Forest (Field-Tested)", type: "Mil-Spec Grade Pistol, Field-Tested" },
    { name: "Galil AR | Tuxedo (Field-Tested)", type: "Mil-Spec Grade Rifle, Field-Tested" },
    { name: "MP7 | Armor Core (Well-Worn)", type: "Mil-Spec Grade SMG, Well-Worn" },
  ],
  purple: [
    { name: "AWP | Worm God (Factory New)", type: "Restricted Sniper Rifle, Factory New" },
    { name: "AK-47 | Ice Coaled (Field-Tested)", type: "Restricted Rifle, Field-Tested" },
  ],
  pink: [
    { name: "AK-47 | Searing Rage (Field-Tested)", type: "Classified Rifle, Field-Tested" },
    { name: "M4A4 | Desolate Space (Minimal Wear)", type: "Classified Rifle, Minimal Wear" },
  ],
  red: [
    { name: "AK-47 | Bloodsport (Field-Tested)", type: "Covert Rifle, Field-Tested" },
    { name: "AWP | Oni Taiji (Minimal Wear)", type: "Covert Sniper Rifle, Minimal Wear" },
  ],
  gold: [
    { name: "★ Karambit | Lore (Field-Tested)", type: "★ Covert Knife, Field-Tested" },
    { name: "★ Moto Gloves | Blood Pressure (Minimal Wear)", type: "★ Extraordinary Gloves, Minimal Wear" },
  ],
};

// Vérification
if (!POOLS[tier]) {
  console.error("❌ Rareté inconnue ! Utilise :", Object.keys(POOLS).join(", "));
  process.exit(1);
}

// Sélection aléatoire
const pool = POOLS[tier];
const chosen = pool[Math.floor(Math.random() * pool.length)];

// Génération IDs Steam
const classid = (Date.now() + Math.floor(Math.random() * 1000)).toString();
const assetid = (Date.now() + Math.floor(Math.random() * 9000)).toString();

// Description Steam-like
const desc = {
  classid,
  market_hash_name: chosen.name,
  type: chosen.type,
  icon_url: "IzMF03FakeItemImageURL1234", // n'importe, ça s'affiche dans l'embed
};

// Asset Steam-like
const asset = {
  appid: 730,
  classid,
  instanceid: "188530139",
  assetid,
};

// Ajout dans la DB
db.descriptions.push(desc);
db.assets.push(asset);

// Sauvegarde
fs.writeFileSync(MOCK_PATH, JSON.stringify(db, null, 2));

console.log(`🎯 Fake drop ajouté → [${tier.toUpperCase()}] ${chosen.name}`);
