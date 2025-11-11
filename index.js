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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

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
        await channel.send(
          `${roleMention} ⏳ Plus que **${diff} jour${diff > 1 ? "s" : ""}** avant l'opening du **${day} ${monthName}** de <@${user}> !\n${randomGif}`
        );
      } else if (diff === 0) {
        const randomGif = gifsJourJ[Math.floor(Math.random() * gifsJourJ.length)];
        await channel.send(
          `${roleMention} 🎉 C’est le grand jour ! Opening de <@${user}> aujourd’hui ! 🔥\n${randomGif}`
        );
      }
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!test") {
    await message.reply("✅ Bot opérationnel et connecté !");
  }

  if (message.content === "!simulate") {
    const channel = message.channel;
    const roleMention = `<@&${process.env.ROLE_ID}>`;
    await channel.send(`${roleMention} 🎁 Test d'opening réussi 🔥`);
  }
});


client.login(process.env.DISCORD_TOKEN);
