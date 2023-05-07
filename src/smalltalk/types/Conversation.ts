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

  public async write(answer: string, lastChunk = false) {
    // Split messages into chunks of x characters or less, where x is the max
    // length of the specified frontend
    const chunks = [];
    let chunk = '';
    for (const char of answer) {
      if (
        chunk.length + char.length >
        this.currentFrontend.maxMessageLength - '\n\nalso'.length
      ) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += char;
    }
    if (chunk.length) chunks.push(chunk);

    for (let i = 0; i < chunks.length; i++) {
      const lastChunkChunk = i === chunks.length - 1;
      await this.writeRaw(chunks[i], lastChunkChunk && lastChunk);
    }
  }

  public async writeRaw(chunk: string, last = false) {
    const replyMessage = this.messages[this.messages.length - 1];

    const msg = await replyMessage.reply(chunk + (!last ? '\n\nalso' : ''));
    return msg;
  }
}
