import { ShichimiyaFrontend } from './ShichimiyaFrontend';
import { ShichimiyaMessage } from './ShichimiyaMessage';

export class Conversation {
  public messages: ShichimiyaMessage[] = [];
  public inflightDirectives: string[] = []; // Gets reset when all directives are done executing
  public currentFrontend: ShichimiyaFrontend;

  constructor(frontend: ShichimiyaFrontend) {
    this.currentFrontend = frontend;
  }

  public addMessage(message: ShichimiyaMessage) {
    if (this.isWaitingForReply()) this.inflightDirectives.pop(); // Remove 'Also' directive

    this.messages.push(message);

    const directives = message.content
      .split(/\n\n/g)
      .map((directive) => directive.trim())
      .filter(Boolean);

    this.inflightDirectives.push(...directives);
  }

  public isWaitingForReply() {
    // If the last directive is "Also", then we're waiting for a reply
    return (
      this.inflightDirectives[
        this.inflightDirectives.length - 1
      ]?.toLowerCase?.() === 'also'
    );
  }

  /**
   * This method is to be called when data it received from a directive.
   * The data given will be chunked and sent instantly. This will also
   * append a `wait` directive at the end, to signal that more data is
   * coming. If you know that this will be the last data to be sent, use
   * `completeWrite` instead.
   */
  public async write(value: string) {
    await this.sendChunkedMessage(value + '\n\nWait...');
  }

  /**
   * This method is triggered when a directive is done executing.
   * Last value can be specified, if not specified, will reply
   * with literal `Done`.
   */
  public async completeWrite(value?: string) {
    if (value) await this.sendChunkedMessage(value);
    else await this.sendChunkedMessage('Done!');
  }

  private async sendChunkedMessage(message: string) {
    const maxChunkLength = this.currentFrontend.maxMessageLength - 8; // Leave some room for the "Also" directive
    let messageReference = this.messages[this.messages.length - 1];

    for (let i = 0; i < message.length; i += maxChunkLength) {
      const isLastChunk = i + maxChunkLength >= message.length;

      let chunk = message.slice(
        i,
        isLastChunk ? message.length : i + maxChunkLength,
      );

      if (!isLastChunk) chunk += '\n\nAlso';

      messageReference = await messageReference.reply(chunk);
      this.messages.push(messageReference);
    }
  }
}
