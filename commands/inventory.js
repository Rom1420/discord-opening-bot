// commands/inventory.js
import { getSteamInventory } from "../services/steamApi.js";
import { formatItemEmbed } from "../services/itemFormatter.js";

/** Détection fiable de la rareté haut-niveau */
function getItemTier(item) {
  const type = item.type || "";
  const tags = item.tags || [];

  const tagRarity = tags.find(t => t.category === "Rarity")?.localized_tag_name || "";

  const isGold =
    type.includes("★") ||
    tagRarity.includes("Extraordinary");

  const isRed =
    type.includes("Covert") ||
    tagRarity.includes("Covert") ||
    tagRarity.includes("Ancient");

  const isPink =
    type.includes("Classified") ||
    tagRarity.includes("Classified") ||
    tagRarity.includes("Legendary");

  const isPurple =
    type.includes("Restricted") ||
    tagRarity.includes("Restricted") ||
    tagRarity.includes("Mythical");

  return { isGold, isRed, isPink, isPurple };
}

export async function handleInventory(message, client) {
  const playerMap = {
    [process.env.USER_WOMAIN_ID]: "76561198802724111",
    [process.env.USER_SACRIA_ID]: "76561198011111111",
  };

  const userId = message.author.id;
  const steamId = playerMap[userId];

  if (!steamId) {
    return message.reply("⚠️ Ton compte Discord n’est pas lié à un SteamID !");
  }

  await message.reply("🔍 Analyse de ton inventaire Steam…");

  let data;
  try {
    data = await getSteamInventory(steamId);
  } catch (err) {
    console.error("❌ ERREUR INVENTAIRE :", err);
    return message.reply("⚠️ Impossible d’accéder à ton inventaire Steam.");
  }

  if (!data?.assets || !data?.descriptions) {
    return message.reply("⚠️ Impossible de lire les données de ton inventaire.");
  }

  const descMap = new Map(data.descriptions.map(d => [d.classid, d]));
  const highTier = [];

  // Extract and classify inventory items
  for (const asset of data.assets) {
    const item = descMap.get(asset.classid);
    if (!item) continue;

    const tier = getItemTier(item);

    // Price check
    const priceRaw = await formatItemEmbed(item, null, { returnPriceOnly: true });
    const priceValue = parseFloat(priceRaw?.replace("€", "").replace(",", ".") || 0);
    const isExpensive = priceValue >= 25;

    if (tier.isGold || tier.isRed || tier.isPink || isExpensive) {
      highTier.push({
        item,
        tier,
        priceRaw: priceRaw || "N/A",
        priceValue,
      });
    }
  }

  if (!highTier.length) {
    return message.reply("😅 Aucun item important trouvé (Gold / Rouge / Rose / >25€)");
  }

  // Sort: Gold > Red > Pink > Price
  highTier.sort((a, b) => {
    if (a.tier.isGold) return -1;
    if (b.tier.isGold) return 1;
    if (a.tier.isRed) return -1;
    if (b.tier.isRed) return 1;
    if (a.tier.isPink) return -1;
    if (b.tier.isPink) return 1;
    return b.priceValue - a.priceValue;
  });

  await message.channel.send(
    `🎒 **Items importants trouvés : ${highTier.length}**`
  );

  // Send embeds
  for (const entry of highTier) {
    const { item, priceRaw, tier } = entry;

    const emoji = tier.isGold
      ? "✨"
      : tier.isRed
      ? "🟥"
      : tier.isPink
      ? "🌸"
      : "💰";

    const embed = await formatItemEmbed(item, emoji);

    await message.channel.send({
      content: `${emoji} **${item.market_hash_name}** — *Valeur estimée : ${priceRaw}*`,
      embeds: [embed],
    });
  }
}
