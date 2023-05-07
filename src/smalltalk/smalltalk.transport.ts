import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Observable } from 'rxjs';
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
        args.some((arg) => typeof arg !== 'string') ||
        typeof command !== 'string'
      ) {
        console.debug(`Invalid directive "${directive}"`);
        continue;
      }

      const handler = this.messageHandlers.get(command.toLowerCase());

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

      // If it's an observable, subscribe and pipe to the write() method
      if (reply instanceof Observable) {
        await new Promise((resolve) =>
          reply.subscribe({
            next: (value) => conversation.write(value),
            complete: () => conversation.completeWrite().then(resolve),
          }),
        );
        continue;
      }

      if (typeof reply === 'string') {
        await conversation.completeWrite(reply);
        continue;
      }

      console.debug('Invalid reply', reply);
    }
  }

  private getOrCreateConversation(message: ShichimiyaMessage) {
    const repliedToMessage = message.reference?.messageId;
    let conversation = this.conversations.find((conversation) =>
      conversation.messages.some((message) => message.id === repliedToMessage),
    );

    if (!conversation) {
      conversation = new Conversation(message.frontend);
      this.conversations.push(conversation);
    }

    return conversation;
  }
}
