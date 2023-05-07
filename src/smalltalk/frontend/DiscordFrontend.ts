import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ShichimiyaFrontend } from '../types/ShichimiyaFrontend';
import { ShichimiyaMessage } from '../types/ShichimiyaMessage';

export class DiscordFrontend extends ShichimiyaFrontend {
  public maxMessageLength = 2000;
  private client: Client;

  async listen() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
      ],
      partials: [Partials.Channel],
    });

    this.client.on('messageCreate', (message) => {
      if (message.author.id === this.client.user?.id) return;

      this.handleMessage(ShichimiyaMessage.fromDiscordMessage(message, this));
    });
    this.client.on('ready', () => console.log('Discord frontend ready'));

    await this.client.login(process.env.DISCORD_TOKEN);
  }

  async close() {
    this.client.destroy();
  }
}
