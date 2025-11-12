import fs from "fs";
import path from "path";

const MOCK_PATH = path.join(process.cwd(), "data", "mock_inventory.json");

if (!fs.existsSync(MOCK_PATH)) {
    fs.writeFileSync(MOCK_PATH, JSON.stringify({ assets: [], descriptions: [] }, null, 2));
}

const db = JSON.parse(fs.readFileSync(MOCK_PATH, "utf8"));
const tier = process.argv[2] || "blue";

// --- Pools avec vrai format Steam ---
const POOLS = {
  blue: [
    {
      name: "P250 | Boreal Forest",
      exterior: "Field-Tested",
      rarity: "Mil-Spec Grade",
      icon: "IzMF03....",
      color: "4b69ff"
    },
    {
      name: "MP7 | Armor Core",
      exterior: "Well-Worn",
      rarity: "Mil-Spec Grade",
      icon: "IzMF03....",
      color: "4b69ff"
    }
  ],
  purple: [
    {
      name: "AWP | Worm God",
      exterior: "Factory New",
      rarity: "Restricted",
      icon: "IzMF03....",
      color: "8847ff"
    },
    {
      name: "AK-47 | Ice Coaled",
      exterior: "Field-Tested",
      rarity: "Restricted",
      icon: "IzMF03....",
      color: "8847ff"
    }
  ],
  pink: [
    {
      name: "AK-47 | Searing Rage",
      exterior: "Field-Tested",
      rarity: "Classified",
      icon: "IzMF03....",
      color: "d32ce6"
    },
    {
      name: "M4A4 | Desolate Space",
      exterior: "Minimal Wear",
      rarity: "Classified",
      icon: "IzMF03....",
      color: "d32ce6"
    }
  ],
  red: [
    {
      name: "AK-47 | Bloodsport",
      exterior: "Field-Tested",
      rarity: "Covert",
      icon: "IzMF03....",
      color: "eb4b4b"
    },
    {
      name: "AWP | Oni Taiji",
      exterior: "Minimal Wear",
      rarity: "Covert",
      icon: "IzMF03....",
      color: "eb4b4b"
    }
  ],
  gold: [
    {
      name: "★ Karambit | Lore",
      exterior: "Field-Tested",
      rarity: "★ Covert Knife",
      icon: "IzMF03....",
      color: "ffd700"
    },
    {
      name: "★ Moto Gloves | Blood Pressure",
      exterior: "Minimal Wear",
      rarity: "★ Extraordinary Gloves",
      icon: "IzMF03....",
      color: "ffd700"
    }
  ]
};

if (!POOLS[tier]) {
  console.error("❌ Rareté inconnue. Choisis :", Object.keys(POOLS).join(", "));
  process.exit(1);
}

const chosen = POOLS[tier][Math.floor(Math.random() * POOLS[tier].length)];

// IDs reproductibles Steam-like
const classid = (Date.now() + Math.floor(Math.random() * 500)).toString();
const assetid = (Date.now() + Math.floor(Math.random() * 9000)).toString();

// Description complète Steam
const desc = {
  appid: 730,
  classid,
  instanceid: "188530139",
  currency: 0,
  background_color: "",
  icon_url: chosen.icon,
  descriptions: [
    { type: "html", value: `Exterior: ${chosen.exterior}`, name: "exterior_wear" }
  ],
  tradable: 1,
  actions: [
    {
      link: "steam://rungame/730/76561202255233023/+csgo_econ_action_preview",
      name: "Inspect in Game..."
    }
  ],
  name: chosen.name,
  name_color: "D2D2D2",
  type: `${chosen.rarity}`,
  market_name: `${chosen.name} (${chosen.exterior})`,
  market_hash_name: `${chosen.name} (${chosen.exterior})`,
  commodity: 0,
  marketable: 1,
  tags: [
    {
      category: "Rarity",
      localized_category_name: "Quality",
      localized_tag_name: chosen.rarity,
      color: chosen.color
    },
    {
      category: "Exterior",
      localized_category_name: "Exterior",
      localized_tag_name: chosen.exterior
    }
  ]
};

// Asset Steam
const asset = {
  appid: 730,
  classid,
  instanceid: "188530139",
  assetid
};

// Ajouter à la DB mock
db.descriptions.push(desc);
db.assets.push(asset);

fs.writeFileSync(MOCK_PATH, JSON.stringify(db, null, 2));

console.log(`🎯 Fake drop ajouté → [${tier.toUpperCase()}] ${desc.market_hash_name}`);
