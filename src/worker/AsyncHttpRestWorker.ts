import axios from "axios";
import { QueueMessage } from "../queue/QueueMessage";
import { Worker } from "./Worker";
import { ErrorHandler } from "../utils/ErrorHandler";
import { RetryPolicy } from "../policies/RetryPolicy";
import { MQEmitter, Message } from "mqemitter";
export const HTTP_REQUESTOR = 'http-requestor';
export class AsyncHttpRestWorker implements Worker {
    
    private broker: MQEmitter;
    private retryPolicy: RetryPolicy;
    private errorHandler: ErrorHandler |({ handle:(err:unknown)=>void });
    private isRunning:boolean;
    private topic:string;

    constructor( broker: MQEmitter, retryPolicy?: RetryPolicy, errorHandler?: ErrorHandler) {
        this.topic=HTTP_REQUESTOR;
        this.broker = broker;
        this.retryPolicy = retryPolicy ?? { maxRetries: 3 };
        this.errorHandler = errorHandler ?? ({ handle:(error:unknown) => console.error(error)});
        this.isRunning=false;
    }
    start(): void {
        this.isRunning=true;
        this.broker.on(this.topic,this.processMessage);
    }
    stop(): void {
        this.isRunning=false;
        this.broker.removeListener(this.topic,this.processMessage);
    }
    async processMessage(mqm: Message): Promise<void> {
        if(!this.isRunning) return;
        const message:QueueMessage = mqm as QueueMessage;
        const url = message.url;
        const method = message.method;
        const headers = message.headers ?? {};
        const body = message.body;
        const retryCount = message.retryCount ?? 0;

        try {
            const response = await axios({
                method,
                url,
                headers,
                data: body,
            });

            // Process the response here
            // For example, you could save the response to a database
            // or send it to another service
            if (message.headers && message.headers['Webhook'] != null) {
                axios(message.headers['Webhook'], { method: 'POST', headers: response.headers, data: response.data });
            }
            console.log("Processed message:", message);
        } catch (error) {
            // Handle the error here
            // For example, you could retry the request
            // or log the error

            if (retryCount < this.retryPolicy.maxRetries) {
                // Retry the request
                const newMessage: QueueMessage = {
                    ...message,
                    retryCount: retryCount + 1,
                };
                await this.broker.emit(newMessage);
            } else {
                this.errorHandler.handle(error);
            }
        }
    }
}