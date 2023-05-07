import { Message as DiscordMessage } from 'discord.js';
import { ShichimiyaFrontend } from './ShichimiyaFrontend';

export class ShichimiyaMessage {
  public content: string;
  public frontend: ShichimiyaFrontend;
  public id: string;
  public reply: (content: string) => Promise<ShichimiyaMessage>;
  public reference?: { messageId: string };

  constructor({
    content,
    frontend,
    id,
    reply,
    reference,
  }: {
    content: string;
    frontend: ShichimiyaFrontend;
    id: string;
    reply: (content: string) => Promise<ShichimiyaMessage>;
    reference?: { messageId: string };
  }) {
    this.content = content;
    this.frontend = frontend;
    this.id = id;
    this.reply = reply;
    this.reference = reference;
  }

  static fromDiscordMessage(
    message: DiscordMessage<boolean>,
    frontend: ShichimiyaFrontend,
  ) {
    return new ShichimiyaMessage({
      content: message.content,
      frontend,
      id: message.id,
      reply: (content: string) =>
        message
          .reply(content)
          .then((m) => ShichimiyaMessage.fromDiscordMessage(m, frontend)),
      reference: message.reference?.messageId
        ? { messageId: message.reference.messageId }
        : undefined,
    });
  }
}
