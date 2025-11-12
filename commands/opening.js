// commands/opening.js
import fs from "fs";
import fetch from "node-fetch";
import { EmbedBuilder } from "discord.js";
import { getSteamInventory } from "../services/steamApi.js";
import { formatItemEmbed } from "../services/itemFormatter.js";

const KNOWN_ITEMS_FILE = "./data/knownItems.json";
let knownItems = fs.existsSync(KNOWN_ITEMS_FILE) ? JSON.parse(fs.readFileSync(KNOWN_ITEMS_FILE)) : {};

// ⚙️ Associe chaque utilisateur Discord à un SteamID
const playerMap = {
  [process.env.USER_WOMAIN_ID]: "76561198000000000",
  [process.env.USER_SACRIA_ID]: "76561198011111111",
};

export async function handleOpeningCommand(message, client) {
  const userId = message.author.id;
  const steamId = playerMap[userId];

  if (!steamId) {
    return message.reply("❌ Ton SteamID n’est pas encore lié à ton compte Discord !");
  }

  const openingChannel = await client.channels.fetch(process.env.OPENING_CHANNEL_ID);
  await message.channel.send(`🎬 Début de l’opening de <@${userId}>... 🔍`);

  const data = await getSteamInventory(steamId);
  if (!data.assets) {
    return message.reply("⚠️ Impossible de récupérer ton inventaire Steam.");
  }

  const newDrops = [];
  for (const item of data.descriptions) {
    const key = `${steamId}_${item.classid}`;
    if (!knownItems[key]) {
      knownItems[key] = true;
      newDrops.push(item);
    }
  }

  fs.writeFileSync(KNOWN_ITEMS_FILE, JSON.stringify(knownItems, null, 2));

  if (!newDrops.length) {
    return message.reply("Aucun nouvel item détecté depuis ton dernier opening !");
  }

  await message.channel.send(`💎 ${newDrops.length} nouvel${newDrops.length > 1 ? "s" : ""} item${newDrops.length > 1 ? "s" : ""} détecté !`);

  for (const item of newDrops) {
    const embed = await formatItemEmbed(item);
    await openingChannel.send({ embeds: [embed] });
  }

  await message.channel.send(`✅ Résumé envoyé dans <#${process.env.OPENING_CHANNEL_ID}>`);
}
