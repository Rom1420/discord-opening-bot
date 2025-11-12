// services/itemFormatter.js
import { EmbedBuilder } from "discord.js";
import { getMarketPrice } from "./steamApi.js";
import { getInspectLink } from "../scripts/inspectUtils.js";

export async function formatItemEmbed(item, rarityEmoji, options = {}) {
  const priceData = await getMarketPrice(item.market_hash_name);
  const price = priceData.lowest_price || "N/A";

  if (options.returnPriceOnly) {
    return price;
  }

  const rarity = item.type.split(",").pop().trim();
  const color = rarity.includes("Covert") ? 0xff1744 :
                rarity.includes("Classified") ? 0xab47bc :
                rarity.includes("Restricted") ? 0x3f51b5 :
                0x9e9e9e;

  const csfloatUrl = `https://csfloat.com/search?market_hash_name=${encodeURIComponent(item.market_hash_name)}`;
  const steamUrl = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.market_hash_name)}`;

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${rarityEmoji} ${item.market_hash_name}`)
    .setThumbnail(`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url_large || item.icon_url}`)
    .addFields(
      { name: "💰 Prix", value: price, inline: true },
      { name: "🎯 Rareté", value: rarity, inline: true },
      { name: "🔗 Liens", value: `[CSFloat](${csfloatUrl}) | [Steam Market](${steamUrl})` }
    );
}

