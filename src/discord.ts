import { Client, GatewayIntentBits, WebhookClient } from "discord.js";

const discordClient = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildWebhooks, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
}).once('ready', () => console.log('DiscordClient initialized'))

export default discordClient