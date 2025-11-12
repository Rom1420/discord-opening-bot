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
  [process.env.USER_WOMAIN_ID]: "76561198802724111",
  [process.env.USER_SACRIA_ID]: "76561198011111111",
};

export async function handleOpeningCommand(message, client, options = {}) {
  const userId = message.author.id;
  const steamId = "76561198000000000"; // ou tu peux le mapper
  const simulate = options.simulate || false;

  const openingChannel = await client.channels.fetch(process.env.OPENING_CHANNEL_ID);
  await message.channel.send(`🎬 Début de l’opening de <@${userId}>... 🔍`);

  let newDrops = [];

  if (simulate) {
    // --- Simulation de 3 items mockés ---
    newDrops = [
      {
        market_hash_name: "★ Karambit | Doppler (Factory New)",
        icon_url: "https://steamcommunity-a.akamaihd.net/economy/image/...",
        type: "★ Covert Knife, Factory New",
      },
      {
        market_hash_name: "AK-47 | Redline (Field-Tested)",
        icon_url: "https://steamcommunity-a.akamaihd.net/economy/image/...",
        type: "Classified Rifle, Field-Tested",
      },
      {
        market_hash_name: "Operation Case",
        icon_url: "https://steamcommunity-a.akamaihd.net/economy/image/...",
        type: "Consumer Grade Container",
      },
    ];
  } else {
    // --- Comportement normal ---
    const data = await getSteamInventory(steamId);
    if (!data.assets) {
      return message.reply("⚠️ Impossible de récupérer ton inventaire Steam.");
    }

    for (const item of data.descriptions) {
      const key = `${steamId}_${item.classid}`;
      if (!knownItems[key]) {
        knownItems[key] = true;
        newDrops.push(item);
      }
    }
  }

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

