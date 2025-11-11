import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import cron from "node-cron";
import dotenv from "dotenv";
import http from "http";

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

const gifs = [
  "https://media.tenor.com/1Bz1b1e2GQAAAAAC/gambling-time.gif",
  "https://media.tenor.com/xKZ8m2Gz1-IAAAAC/loot-box-opening.gif",
  "https://media.tenor.com/Cl5ZK7wD53wAAAAC/case-opening-csgo.gif",
  "https://media.tenor.com/kZPiRj0piQEAAAAC/vegas-slots.gif"
];

const gifsJourJ = [
  "https://media.tenor.com/7SuT8m3R4uoAAAAC/its-time-to-shine-roman.gif",
  "https://media.tenor.com/Fh45JQKM5wYAAAAC/kaaris-or-noir.gif",
  "https://media.tenor.com/JlW7NYXdpSoAAAAC/trump-wins.gif"
];

// --- Quand le bot est prêt ---
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // Envoi automatique à 10h chaque jour
  cron.schedule("0 10 * * *", async () => {
    const today = new Date();
    const currentDay = today.getDate();
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const roleMention = `<@&${process.env.ROLE_ID}>`;

    for (const { day, user } of openings) {
      const diff = day - currentDay;
      const monthName = today.toLocaleString("fr-FR", { month: "long" });

      if (diff > 0) {
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
          .setColor(0xf7c600)
          .setTitle(`📦 Prochain opening`)
          .setDescription(`⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${day} ${monthName}** de <@${user}> !`)
          .setImage(randomGif);

        await channel.send({ content: roleMention, embeds: [embed] });

      } else if (diff === 0) {
        const randomGif = gifsJourJ[Math.floor(Math.random() * gifsJourJ.length)];

        const embed = new EmbedBuilder()
          .setColor(0x41e7af)
          .setTitle(`🎉 Opening du jour !`)
          .setDescription(`🔥 C’est le grand jour pour <@${user}> !`)
          .setImage(randomGif);

        await channel.send({ content: roleMention, embeds: [embed] });
      }
    }
  });
});

// --- Commandes texte ---
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!test") {
    await message.reply("✅ Bot opérationnel et connecté !");
  }

  if (message.content === "!simulate") {
    const channel = message.channel;
    const roleMention = `<@&${process.env.ROLE_ID}>`;
    const today = new Date();
    const currentDay = today.getDate();
    const nextOpening = openings.find(o => o.day > currentDay) || openings[0];
    const diff = nextOpening.day - currentDay;
    const monthName = today.toLocaleString("fr-FR", { month: "long" });
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setColor(0xf7c600)
      .setTitle(`🧾 Prévisualisation de l'opening à venir`)
      .setDescription(
        diff > 0
          ? `⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${nextOpening.day} ${monthName}** de <@${nextOpening.user}> 💼`
          : `🔥 Simulation d'opening du jour pour <@${nextOpening.user}> !`
      )
      .setImage(randomGif);

    await channel.send({ content: roleMention, embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
