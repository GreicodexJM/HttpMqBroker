import { QueueMessage } from "../queue/QueueMessage";
export interface Worker {
    processMessage(message: QueueMessage): void;
    start(): void;
    stop(): void;
  }