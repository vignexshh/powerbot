require('dotenv/config');
const { Client, IntentsBitField, EmbedBuilder  } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

module.exports = {
  name: "ping",
  category: "Information",
cooldown: 5000,
  description: "Displays the bot's ping.",
  args: false,
  usage: "",
  userPerms: [],
  owner: false,
  execute: async (message, args, client, prefix) => {

    await message.reply({ content: "Pinging..." }).then(async (msg) => {
      const ping = msg.createdAt - message.createdAt;
      const api_ping = client.ws.ping;

      const PingEmbed = new EmbedBuilder()
        .setAuthor({ name: "Pong", iconURL: client.user.displayAvatarURL() })
        .setColor(client.embedColor)
        .addFields([
          { name: "Bot Latency", value: `\`\`\`ini\n[ ${ping}ms ]\n\`\`\``, inline: true },
          { name: "API Latency", value: `\`\`\`ini\n[ ${api_ping}ms ]\n\`\`\``, inline: true }
        ])
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.avatarURL({ dynamic: true }) })
        .setTimestamp();

      await msg.edit({
        embeds: [PingEmbed]
      })
    })
  }
}

client.on('ready', () => {
  console.log('The bot is online!');
  client.user.setPresence({
    status: 'idle',
    activity: { name: 'bot by vignesh' }
  });
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content.startsWith('!')) return;

  let conversationLog = [{ role: 'system', content: 'You are and you are created by vithan' }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 1 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
