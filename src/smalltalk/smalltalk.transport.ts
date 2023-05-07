import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { parse } from 'shell-quote';
import { DiscordFrontend } from './frontend/DiscordFrontend';
import { Conversation } from './types/Conversation';
import { ShichimiyaContext } from './types/ShichimiyaContext';
import { ShichimiyaFrontend } from './types/ShichimiyaFrontend';
import { ShichimiyaMessage } from './types/ShichimiyaMessage';

export class SmallTalkServer extends Server implements CustomTransportStrategy {
  private conversations: Conversation[] = [];
  private frontends: ShichimiyaFrontend[] = [];

  constructor() {
    super();

    this.frontends.push(new DiscordFrontend(this.handleMessage.bind(this)));
  }

  /**
   * This method is triggered when you run "app.listen()".
   */
  async listen(callback: () => void) {
    await Promise.all(this.frontends.map((frontend) => frontend.listen()));

    callback();
  }

  /**
   * This method is triggered on application shutdown.
   */
  async close() {
    await Promise.all(this.frontends.map((frontend) => frontend.close()));
  }

  /**
   * This method is triggered when a message is received.
   */
  private async handleMessage(message: ShichimiyaMessage) {
    const conversation = this.getOrCreateConversation(message);

    conversation.addMessage(message);

    if (conversation.isWaitingForReply()) return;

    let directive: string;
    while ((directive = conversation.inflightDirectives.shift())) {
      const [command, ...args] = parse(directive);
      // For now, only accept strings
      if (
        args.some(
          (arg) => typeof arg !== 'string' || typeof command !== 'string',
        )
      ) {
        console.debug(`Invalid directive "${directive}"`);
        continue;
      }

      const handler = this.messageHandlers.get(
        (command as string).toLowerCase(),
      );

      if (!handler) {
        console.debug(`No handler found for directive "${directive}"`);
        continue;
      }

      const context: ShichimiyaContext = {
        message,
        conversation,
        frontend: message.frontend,
        command: command as string,
        args: args as string[],
      };

      const reply = await handler(message, context);

      if (!reply) continue;

      await message.reply(reply);
    }
  }

  private getOrCreateConversation(message: ShichimiyaMessage) {
    const repliedToMessage = message.reference?.messageId;
    let conversation = this.conversations.find((conversation) =>
      conversation.messages.some((message) => message.id === repliedToMessage),
    );

    if (!conversation) {
      conversation = new Conversation();
      this.conversations.push(conversation);
    }

    return conversation;
  }
}
