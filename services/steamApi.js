import fs from "fs";
import path from "path";

const MOCK_PATH = path.join(process.cwd(), "data", "mock_inventory.json");

export async function getSteamInventory(steamId) {
  if (process.env.MOCK === "1") {
    console.log("🧪 [MOCK] Returning mock inventory");
    if (!fs.existsSync(MOCK_PATH)) {
      // crée un mock de base si inexistant
      const base = {
        assets: [],
        descriptions: []
      };
      fs.writeFileSync(MOCK_PATH, JSON.stringify(base, null, 2));
    }
    return JSON.parse(fs.readFileSync(MOCK_PATH, "utf8"));
  }

  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Steam error body:", text.slice(0, 500));
    throw new Error(`HTTP ${res.status}`);
  }
  return await res.json();
}

export async function getMarketPrice(market_hash_name) {
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${encodeURIComponent(market_hash_name)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ [SteamMarket] HTTP ${res.status} pour ${market_hash_name}`);
      return {};
    }
    return await res.json();
  } catch (err) {
    console.error(`🚨 [ERREUR] getMarketPrice pour ${market_hash_name}:`, err);
    return {};
  }
}
