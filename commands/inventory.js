// commands/inventory.js
import { getSteamInventory } from "../services/steamApi.js";
import { formatItemEmbed } from "../services/itemFormatter.js";

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
  const items = [];

  for (const asset of data.assets) {
    const item = descMap.get(asset.classid);
    if (!item) continue;

    // On filtre uniquement les bons items
    const isGold = item.type.includes("★");
    const isRed = item.type.includes("Covert");
    const isPink = item.type.includes("Classified");

    if (isGold || isRed || isPink) {
      items.push(item);
    }
  }

  if (!items.length) {
    return message.reply("😅 Aucun item Gold / Rouge / Rose dans ton inventaire !");
  }

  await message.channel.send(
    `🎒 **Meilleurs items trouvés dans ton inventaire : ${items.length}**`
  );

  // Envoie des embeds un par un
  for (const item of items) {
    const rarity = item.type.split(",").pop().trim();

    const emoji =
      rarity.includes("Covert") ? "🟥" :
      rarity.includes("Classified") ? "🌸" :
      "💖";

    const embed = await formatItemEmbed(item, emoji);

    await message.channel.send({
      content: `${emoji} **${item.market_hash_name}**`,
      embeds: [embed],
    });
  }
}
