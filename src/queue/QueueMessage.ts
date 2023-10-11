import { RetryPolicy } from "../policies/RetryPolicy";
import { ErrorHandler } from "../utils/ErrorHandler";
import { Message } from "mqemitter";
export interface QueueMessage extends Message {
    topic: string;
    url: string;
    method: string;
    headers?: { [key: string]: string };
    body?: any;
    retryCount?: number;
    retryPolicy?: RetryPolicy;
    errorHandler?: ErrorHandler;
  }
  