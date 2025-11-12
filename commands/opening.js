import fs from "fs";
import { getSteamInventory } from "../services/steamApi.js";
import { formatItemEmbed } from "../services/itemFormatter.js";

const KNOWN_ITEMS_FILE = "./data/knownItems.json";
let knownItems = fs.existsSync(KNOWN_ITEMS_FILE)
  ? JSON.parse(fs.readFileSync(KNOWN_ITEMS_FILE))
  : {};

const bigWinGifs = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnY0a2ZjZGMwZmFkNHRqYjIxZXpoa3BsNGVsdnZsdnIxaWN0eThtbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Vu5UbNpjpqfMq2UFg0/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cG5pYnlmc3QyMXhjNnZ2NzV4Z3l5NXBiZmhxNmswc3Z3OHE4ZDE0aiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/Oa79Q1oHLXIti/giphy.gif"
];


const activeOpenings = {};

const sessionItems = {};

// --- Emojis par rareté ---
const rarityEmojis = {
  Covert: "🟥",
  Classified: "🌸",
  Restricted: "💜",
  "Mil-Spec": "🔵",
  Industrial: "🔷",
  Consumer: "⚪",
  default: "❔",
};

// --- START ---
export async function handleOpeningStart(message, client) {
    const playerMap = {
        [process.env.USER_WOMAIN_ID]: "76561198802724111",
        [process.env.USER_SACRIA_ID]: "76561198011111111",
    };

  const userId = message.author.id;
  const steamId = playerMap[userId];
  console.log(`🚀 Démarrage de l’opening pour ${userId} (SteamID: ${steamId})`);

  const delay = 30000; // 30s entre chaque vérif
  const openingChannel = await client.channels.fetch(process.env.OPENING_CHANNEL_ID);

  if (!steamId) return message.reply("⚠️ Ton compte Discord n’est pas encore lié à un SteamID !");
  if (activeOpenings[userId]) return message.reply("⚙️ Un opening est déjà en cours pour toi !");

  await message.channel.send(`🎬 Début de l’opening de <@${userId}>... 🔍`);
  activeOpenings[userId] = null;

  // On initialise la session
sessionItems[userId] = {};
knownItems = {}; // reset cache interne mais SANS envoyer quoi que ce soit

// On prend un snapshot initial de l'inventaire
const data = await getSteamInventory(steamId);
if (data?.assets && data?.descriptions) {
    const descMap = new Map(data.descriptions.map(d => [d.classid, d]));
    for (const a of data.assets) {
        const item = descMap.get(a.classid);
        if (!item) continue;
        const key = `${steamId}_${a.assetid}`;
        knownItems[key] = item;   // snapshot initial
    }
    fs.writeFileSync(KNOWN_ITEMS_FILE, JSON.stringify(knownItems, null, 2));
}

message.channel.send("📸 Inventaire enregistré. En attente de drops...");


  const checkInventory = async () => {
    try {
      const data = await getSteamInventory(steamId);
      if (!data?.assets || !data?.descriptions) return;

      const descriptionMap = new Map(data.descriptions.map(d => [d.classid, d]));
      const newDrops = [];

      for (const asset of data.assets) {
        const item = descriptionMap.get(asset.classid);
        if (!item) continue;

        const key = `${steamId}_${asset.assetid}`;

        if (!knownItems[key]) {
            knownItems[key] = item;

            if (!sessionItems[userId]) sessionItems[userId] = {};
            sessionItems[userId][key] = item;

            newDrops.push(item);
        }   
    }


      if (newDrops.length) {
        fs.writeFileSync(KNOWN_ITEMS_FILE, JSON.stringify(knownItems, null, 2));

        await message.channel.send(
          `💎 ${newDrops.length} nouvel${newDrops.length > 1 ? "s" : ""} item${newDrops.length > 1 ? "s" : ""} détecté !`
        );

        for (const item of newDrops) {
            const rarity = item.type.split(",").pop().trim();
            const emoji =
                Object.keys(rarityEmojis).find((key) => rarity.includes(key)) || "default";

            // --- Récup du prix optimisé ---
            const priceInfo = await formatItemEmbed(item, rarityEmojis[emoji], { returnPriceOnly: true });
            const priceValue = parseFloat(priceInfo?.replace("€","")?.replace(",",".") || 0);

            // --- Conditions BIG WIN ---
            const isGold   = item.type.includes("★");
            const isRed    = item.type.includes("Covert");
            const isExpensive = priceValue >= 25;

            // Embed normal (ROUGE / ROSE / etc)
            const embed = await formatItemEmbed(item, rarityEmojis[emoji], {});


            if (isGold || isRed || isExpensive) {
                const gif = bigWinGifs[Math.floor(Math.random() * bigWinGifs.length)];

                await openingChannel.send({
                    content: `🎉 **BIG WIN !** ${emoji} **${item.market_hash_name}**\n💵 Valeur estimée : **${priceInfo}**`,
                    files: [gif],
                    embeds: [embed],
                });
            } else {
                await openingChannel.send({
                    content: `${emoji} **${item.market_hash_name}**`,
                    embeds: [embed],
                });
            }

            }

      }
    } catch (err) {
      console.error("❌ [checkInventory] Erreur :", err.message);
    }
  };

  // Lancer immédiatement une première vérification
  await checkInventory();

  // Puis continuer toutes les X secondes
  activeOpenings[userId] = setInterval(checkInventory, delay);
  console.log(`🔁 Surveillance Steam active pour ${userId}`);
}


// --- END ---
export async function handleOpeningEnd(message, client) {
  const openingChannel = await client.channels.fetch(process.env.OPENING_CHANNEL_ID);
  const playerMap = {
        [process.env.USER_WOMAIN_ID]: "76561198802724111",
        [process.env.USER_SACRIA_ID]: "76561198011111111",
    };

  const userId = message.author.id;
  const steamId = playerMap[userId];

  if (!steamId) {
    return message.reply("⚠️ Ton compte Discord n’est pas encore lié à un SteamID !");
  }

  if (!fs.existsSync(KNOWN_ITEMS_FILE)) {
    return message.reply("⚠️ Aucun opening actif trouvé !");
  }

  const items = sessionItems[userId];
    if (!items || Object.keys(items).length === 0) {
        return message.reply("😅 Aucuns items drop pendant cet opening !");
    }


  // --- Filtre des items rares ---
  const rareItems = Object.values(items).filter(item =>
    item.type.includes("Covert") ||
    item.type.includes("Classified") ||
    item.type.includes("Restricted")
);

  if (!rareItems.length) {
    await message.reply("🧩 Aucun item rare trouvé pendant cet opening !");
  } else {
    await message.reply(`🏆 Résumé des meilleurs items : ${rareItems.length} trouvés !`);
    for (const item of rareItems) {
      const embed = await formatItemEmbed(item);
      await openingChannel.send({ embeds: [embed] });
    }
  }

  // --- Arrêt de la boucle ---
    if (activeOpenings[userId]) {
    clearInterval(activeOpenings[userId]);
    delete sessionItems[userId];
    console.log(`🛑 Surveillance arrêtée pour ${userId}`);
    }


  // --- Reset ---
  fs.writeFileSync(KNOWN_ITEMS_FILE, "{}");
  knownItems = {};
  await message.channel.send("🧹 Fin de l’opening, mémoire nettoyée !");
}
