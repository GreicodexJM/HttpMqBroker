"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleErrorHandler = exports.exponentialRetryPolicy = exports.AsyncHttpRestWorker = exports.worker = void 0;
const AsyncHttpRestWorker_1 = require("./AsyncHttpRestWorker");
Object.defineProperty(exports, "AsyncHttpRestWorker", { enumerable: true, get: function () { return AsyncHttpRestWorker_1.AsyncHttpRestWorker; } });
const queue_1 = require("../queue");
// Create a retry policy with an exponential backoff strategy
const exponentialRetryPolicy = {
    maxRetries: 3,
    backoffStrategy: {
        type: "exponential",
        initialDelay: 100,
        maxDelay: 1000,
    },
};
exports.exponentialRetryPolicy = exponentialRetryPolicy;
// Create an error handler that logs the error and stops processing the message
const consoleErrorHandler = {
    handle(error) {
        console.error(error);
    },
};
exports.consoleErrorHandler = consoleErrorHandler;
// Create a worker with the custom retry policy and error handler
const worker = new AsyncHttpRestWorker_1.AsyncHttpRestWorker(queue_1.tempQueue, exponentialRetryPolicy, consoleErrorHandler);
exports.worker = worker;
