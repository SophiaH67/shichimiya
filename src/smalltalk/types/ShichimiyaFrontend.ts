import { ShichimiyaMessage } from './ShichimiyaMessage';

export abstract class ShichimiyaFrontend {
  abstract maxMessageLength: number;

  constructor(public handleMessage: (message: ShichimiyaMessage) => void) {}

  public abstract listen(): Promise<void>;
  public abstract close(): Promise<void>;
}
