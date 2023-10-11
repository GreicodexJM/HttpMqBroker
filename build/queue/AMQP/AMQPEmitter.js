"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMQPEmitter = exports.AMQP_BROKER_PROTOCOL = void 0;
const QueueFactory_1 = require("../QueueFactory");
const amqplib_1 = __importDefault(require("amqplib"));
exports.AMQP_BROKER_PROTOCOL = 'amqp:';
class AMQPEmitter extends QueueFactory_1.Registrable {
    constructor(broker) {
        amqplib_1.default.connect(`${broker.protocol}://${broker.username}:${broker.password}@${broker.hostname}:${broker.port}`).then((conn) => {
            this.connection = conn;
            this.connection.createChannel().then((chan) => {
                this.channel = chan;
            });
            process.once('SIGINT', async () => {
                if (this.connection != null) {
                    await this.connection.close();
                    this.connection = null;
                    this.channel = null;
                }
            });
        });
        super();
        this.current = 0;
        this.concurrent = 0;
        this.connection = null;
        this.channel = null;
    }
    on(topic, listener, callback) {
        (async () => {
            if (this.channel == null)
                throw new Error('Connection failure');
            const queue = await this.channel.assertQueue("").then((val) => val.queue);
            await this.channel.bindQueue("", topic, queue);
            this.channel.prefetch(1);
            this.channel.consume(queue, (message) => {
                const text = message.content.toString();
                console.log(" [x] Received '%s'", text);
                //const seconds = text.split('.').length - 1;
                listener(text, () => {
                    console.log(" [x] Done");
                    if (this.channel != null)
                        this.channel.ack(message);
                });
            }, { noAck: false });
            console.log(" [*] Waiting for messages. To exit press CTRL+C");
        })();
        return this;
    }
    emit(message, callback) {
        const text = JSON.stringify(message);
        const that = this;
        (async () => {
            if (that.channel == null)
                return;
            await that.channel.assertExchange("", "topic", { durable: false });
            that.channel.publish("", message.topic, Buffer.from(text));
            console.log(" [x] Sent %s:'%s'", message.topic, text);
        })();
    }
    removeListener(topic, listener, callback) {
        throw new Error("Method not implemented.");
    }
    close(callback) {
        throw new Error("Method not implemented.");
    }
    static register() {
        QueueFactory_1.QueueFactory.registerConstructor(exports.AMQP_BROKER_PROTOCOL, AMQPEmitter);
    }
}
exports.AMQPEmitter = AMQPEmitter;
