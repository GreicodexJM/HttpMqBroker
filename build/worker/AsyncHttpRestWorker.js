"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncHttpRestWorker = exports.HTTP_REQUESTOR = void 0;
const axios_1 = __importDefault(require("axios"));
exports.HTTP_REQUESTOR = 'http-requestor';
class AsyncHttpRestWorker {
    constructor(broker, retryPolicy, errorHandler) {
        this.topic = exports.HTTP_REQUESTOR;
        this.broker = broker;
        this.retryPolicy = retryPolicy ?? { maxRetries: 3 };
        this.errorHandler = errorHandler ?? ({ handle: (error) => console.error(error) });
        this.isRunning = false;
    }
    start() {
        this.isRunning = true;
        this.broker.on(this.topic, this.processMessage);
    }
    stop() {
        this.isRunning = false;
        this.broker.removeListener(this.topic, this.processMessage);
    }
    async processMessage(mqm) {
        if (!this.isRunning)
            return;
        const message = mqm;
        const url = message.url;
        const method = message.method;
        const headers = message.headers ?? {};
        const body = message.body;
        const retryCount = message.retryCount ?? 0;
        try {
            const response = await (0, axios_1.default)({
                method,
                url,
                headers,
                data: body,
            });
            // Process the response here
            // For example, you could save the response to a database
            // or send it to another service
            if (message.headers && message.headers['Webhook'] != null) {
                (0, axios_1.default)(message.headers['Webhook'], { method: 'POST', headers: response.headers, data: response.data });
            }
            console.log("Processed message:", message);
        }
        catch (error) {
            // Handle the error here
            // For example, you could retry the request
            // or log the error
            if (retryCount < this.retryPolicy.maxRetries) {
                // Retry the request
                const newMessage = {
                    ...message,
                    retryCount: retryCount + 1,
                };
                await this.broker.emit(newMessage);
            }
            else {
                this.errorHandler.handle(error);
            }
        }
    }
}
exports.AsyncHttpRestWorker = AsyncHttpRestWorker;
