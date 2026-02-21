
require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const Engine = require('./core/engine');
const config = require('./config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.config = config;
client.commands = new Collection();
client.engine = new Engine(client);

// Load handlers
require('./events/loader')(client);
require('./commands/loader')(client);

client.login(process.env.DISCORD_TOKEN);
