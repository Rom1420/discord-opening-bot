import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// --- Keep alive pour Koyeb ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!\n");
});
server.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Keep-alive server started");
});

// --- Chargement des variables ---
dotenv.config();

// --- Gestion du chemin local (pour assets/gicler.jpeg) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localImagePath = path.join(__dirname, "assets/gicler.jpeg");

// --- Client Discord ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// --- Données ---
const openings = [
  { day: 8, user: process.env.USER_WOMAIN_ID },
  { day: 15, user: process.env.USER_SACRIA_ID },
  { day: 23, user: process.env.USER_WOMAIN_ID },
  { day: 30, user: process.env.USER_SACRIA_ID },
];

// GIFs d’attente
const gifs = [
  "https://media4.giphy.com/media/2YHdXovMSv1NtO6V4n/giphy.gif",
  "https://media2.giphy.com/media/MEtP6XftcuDoA/giphy.gif",
  "https://media2.giphy.com/media/jc2PkKKr3clTBekMzn/giphy.gif",
];

// GIFs jour J 🎉
const gifsJourJ = [
  "https://media.giphy.com/media/3og0IDo7DN9PG58jzG/giphy.gif",
  "https://media.giphy.com/media/lOiJqCjiEOcmc/giphy.gif",
  "https://media.giphy.com/media/qml7DrbfkXPCU/giphy.gif",
];

// --- Quand le bot est prêt ---
client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  const now = new Date();
  console.log("🕒 Heure actuelle du serveur :", now.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }));

  // 🔴 Cron désactivé pour debug
  // cron.schedule("0 11 * * *", async () => {
  //   await sendDailyMessage();
  // });

  // 🧪 Envoi automatique toutes les 30s (debug)
  setInterval(async () => {
    console.log("🧪 Envoi test automatique (toutes les 30s)");
    await sendDailyMessage(true);
  }, 30_000);
});

// --- Fonction d’envoi ---
async function sendDailyMessage(isDebug = false) {
  const today = new Date();
  const currentDay = today.getDate();
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  for (const { day, user } of openings) {
    const diff = day - currentDay;
    const monthName = today.toLocaleString("fr-FR", { month: "long" });

    if (diff > 0) {
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      const embed = new EmbedBuilder()
        .setColor(0xf7c600)
        .setTitle("📦 Prochain opening")
        .setDescription(`⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${day} ${monthName}** de <@${user}> !`)
        .setImage(randomGif);

      await channel.send({ embeds: [embed] });
    } 
    else if (diff === 0) {
      const randomGif = gifsJourJ[Math.floor(Math.random() * gifsJourJ.length)];
      const embed = new EmbedBuilder()
        .setColor(0x41e7af)
        .setTitle("🎉 Opening du jour !")
        .setDescription(`🔥 C’est le grand jour pour <@${user}> !`)
        .setImage(randomGif);

      await channel.send({ embeds: [embed], files: [localImagePath] });
    }
  }
}

// --- Commandes texte ---
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!test") {
    await message.reply("✅ Bot opérationnel et connecté !");
  }

  if (message.content === "!simulate") {
    const channel = message.channel;
    const today = new Date();
    const currentDay = today.getDate();
    const nextOpening = openings.find(o => o.day > currentDay) || openings[0];
    const diff = nextOpening.day - currentDay;
    const monthName = today.toLocaleString("fr-FR", { month: "long" });
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setColor(0xf7c600)
      .setTitle("🧾 Prévisualisation de l'opening à venir")
      .setDescription(
        diff > 0
          ? `⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${nextOpening.day} ${monthName}** de <@${nextOpening.user}> 💼`
          : `🔥 Simulation d'opening du jour pour <@${nextOpening.user}> !`
      )
      .setImage(randomGif);

    await channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);