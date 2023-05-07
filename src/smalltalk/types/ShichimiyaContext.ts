import { Conversation } from './Conversation';
import { ShichimiyaFrontend } from './ShichimiyaFrontend';
import { ShichimiyaMessage } from './ShichimiyaMessage';

export interface ShichimiyaContext {
  message: ShichimiyaMessage;
  conversation: Conversation;
  frontend: ShichimiyaFrontend;
  command: string;
  args: string[];
}
