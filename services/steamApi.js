// services/steamApi.js
import fetch from "node-fetch";

export async function getSteamInventory(steamId) {
  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english`;
  const res = await fetch(url);
  return await res.json();
}

export async function getMarketPrice(market_hash_name) {
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${encodeURIComponent(market_hash_name)}`;
  const res = await fetch(url);
  return await res.json();
}
