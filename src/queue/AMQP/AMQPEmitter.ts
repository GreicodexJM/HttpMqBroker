import { MQEmitter, Message } from "mqemitter";
import { QueueFactory, BrokerConfig, Registrable } from "../QueueFactory";
import AMQP, { Channel, Connection } from "amqplib";
export const AMQP_BROKER_PROTOCOL = 'amqp:';
export class AMQPEmitter extends Registrable implements MQEmitter {
    public current: number = 0;
    public concurrent: number = 0;
    private connection:Connection|null=null;
    private channel:Channel|null=null;
    
    constructor(broker:BrokerConfig) {
        AMQP.connect(`${broker.protocol}://${broker.username}:${broker.password}@${broker.hostname}:${broker.port}`).then((conn)=>{
            this.connection=conn;
            this.connection.createChannel().then((chan)=>{
                this.channel = chan;
            });
            process.once('SIGINT', async () => {
                if(this.connection !=null) {
                    await this.connection.close();
                    this.connection = null;
                    this.channel=null;
                }
            });
        });
        super();
    }


    public on(topic: string, listener: (message: Message, done: () => void) => void, callback?: (() => void) | undefined): this {
        
        (async()=>{
            if(this.channel == null) throw new Error('Connection failure');
            const queue = await this.channel.assertQueue("").then((val)=>val.queue);
            await this.channel.bindQueue("",topic,queue);
            this.channel.prefetch(1);
            this.channel.consume(queue, (message:any) => {
                const text = message.content.toString();
                console.log(" [x] Received '%s'", text);
                //const seconds = text.split('.').length - 1;
                listener(text,() => {
                    console.log(" [x] Done");
                    if(this.channel != null)
                        this.channel.ack(message);
                });
            }, { noAck: false });
            console.log(" [*] Waiting for messages. To exit press CTRL+C");
        })();
        return this;
    }
    public emit(message: Message, callback?: ((error?: Error | undefined) => void) | undefined): void {
        const text = JSON.stringify(message);
        const that = this;
        (async () => {
            if(that.channel == null) return;
            await that.channel.assertExchange("", "topic", { durable: false });
            that.channel.publish("", message.topic, Buffer.from(text))
            console.log(" [x] Sent %s:'%s'", message.topic, text);
        })();
    }
    public removeListener(topic: string, listener: (message: Message, done: () => void) => void, callback?: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    public close(callback: () => void): void {
        throw new Error("Method not implemented.");
    }

    public static register(): void {
        QueueFactory.registerConstructor(AMQP_BROKER_PROTOCOL,AMQPEmitter);
    }
}