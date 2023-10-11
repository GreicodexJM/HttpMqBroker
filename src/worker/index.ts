import { RetryPolicy } from "../policies/RetryPolicy";
import { ErrorHandler } from "../utils/ErrorHandler";
import { AsyncHttpRestWorker } from "./AsyncHttpRestWorker";
import { MQEmitter, tempQueue } from "../queue";
// Create a retry policy with an exponential backoff strategy
const exponentialRetryPolicy: RetryPolicy = {
    maxRetries: 3,
    backoffStrategy: {
        type: "exponential",
        initialDelay: 100,
        maxDelay: 1000,
    },
};

// Create an error handler that logs the error and stops processing the message
const consoleErrorHandler: ErrorHandler = {
    handle(error: any): void {
        console.error(error);
    },
};

// Create a worker with the custom retry policy and error handler
const worker = new AsyncHttpRestWorker(tempQueue as MQEmitter, exponentialRetryPolicy, consoleErrorHandler);

export { worker, AsyncHttpRestWorker, exponentialRetryPolicy, consoleErrorHandler };