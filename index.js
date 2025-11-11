import { Client, GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import dotenv from "dotenv";
import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!\n");
});
server.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Keep-alive server started");
});

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // 👈 pour lire les messages
  ],
});

// 📅 jours d'opening
const openings = [
  { day: 8, user: process.env.USER_WOMAIN_ID },
  { day: 15, user: process.env.USER_SACRIA_ID },
  { day: 23, user: process.env.USER_WOMAIN_ID },
  { day: 30, user: process.env.USER_SACRIA_ID },
];

// GIFs normaux 🔥
const gifs = [
  "https://media.tenor.com/1Bz1b1e2GQAAAAAC/gambling-time.gif",
  "https://media.tenor.com/xKZ8m2Gz1-IAAAAC/loot-box-opening.gif",
  "https://media.tenor.com/Cl5ZK7wD53wAAAAC/case-opening-csgo.gif",
  "https://media.tenor.com/kZPiRj0piQEAAAAC/vegas-slots.gif"
];

// GIFs spéciaux pour le jour J 🎉
const gifsJourJ = [
  "https://media.tenor.com/7SuT8m3R4uoAAAAC/its-time-to-shine-roman.gif",
  "https://media.tenor.com/Fh45JQKM5wYAAAAC/kaaris-or-noir.gif",
  "https://media.tenor.com/JlW7NYXdpSoAAAAC/trump-wins.gif"
];

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // exécution tous les jours à 10h
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
        await channel.send({
          content: `${roleMention} ⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${day} ${monthName}** de <@${user}> !`,
          embeds: [
            {
              image: { url: randomGif }
            }
          ]
        });
      } else if (diff === 0) {
        const randomGif = gifsJourJ[Math.floor(Math.random() * gifsJourJ.length)];
        await channel.send({
          content: `${roleMention} 🎉 C’est le grand jour ! Opening de <@${user}> aujourd’hui ! 🔥`,
          embeds: [
            {
              image: { url: randomGif }
            }
          ]
        });
      }
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Test de connexion
  if (message.content === "!test") {
    await message.reply("✅ Bot opérationnel et connecté !");
  }

  // Simulation d'opening
  if (message.content === "!simulate") {
    const channel = message.channel;
    const roleMention = `<@&${process.env.ROLE_ID}>`;

    const today = new Date();
    const currentDay = today.getDate();
    const nextOpening = openings.find(o => o.day > currentDay) || openings[0];
    const diff = nextOpening.day - currentDay;
    const monthName = today.toLocaleString("fr-FR", { month: "long" });
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const content =
      diff > 0
        ? `${roleMention} 🧾 **Prévisualisation de l'opening à venir !**\n` +
          `⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${nextOpening.day} ${monthName}** de <@${nextOpening.user}> 💼`
        : `${roleMention} 🎉 **Simulation d'opening !**\n🔥 Opening de <@${nextOpening.user}> aujourd’hui !`;

    await channel.send({
      content,
      embeds: [
        {
          image: { url: randomGif }
        }
      ]
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
