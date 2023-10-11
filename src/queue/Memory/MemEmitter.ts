import { MQEmitter, Message } from "mqemitter";
import { QueueFactory, BrokerConfig, Registrable } from "../QueueFactory";
import { getLogger } from "log4js";
import { basename } from "path";
const logger = getLogger(basename(__filename));
import { nextTick } from "process";
import EventEmitter from "events";
logger.level='debug';
export const MEM_BROKER_PROTOCOL = 'temp:';

export class MemEmitter extends Registrable implements MQEmitter  {
    private _queues:Map<String,Array<Message>>;
    private _listeners:Map<String,Array<Function>>;
    private _timer=true;
    private _emitter ;
    concurrent: number = 0;
    current: number = 0;    
    
    constructor(broker:BrokerConfig) {
        super();
        this._emitter = new EventEmitter();
        this._queues=new Map();
        this._listeners = new Map();
        this._timer = true; 
        this._process();
    }
    public status():Object {
        const obj = { queues:this._queues.size,listeners:this._listeners.size};
        return obj;
    }
    private _process():void {        
        //logger.debug('Tick',this);
        this._queues.forEach((queue,topic)=>{
            if(queue?.length > 0) {
                if(this._listeners.has(topic) && this._listeners.get(topic)!.length > 0) {
                    const m = queue?.shift();
                    this._listeners.get(topic)?.forEach((f)=>{ f(m); });
                }
            }    
        });
        if(this._timer) {
            //logger.debug('Tock',this);
            setTimeout(this._process.bind(this),500);
        } 
        //logger.debug('Nieth',this);
    }
    public on(topic: string, listener: (message: Message, done: () => void) => void, callback?: (() => void) | undefined): this {
        logger.debug('Subscribing Listener',topic);
        if(!this._listeners.has(topic)) {
            this._listeners.set(topic,[]);
        }
        this._listeners.get(topic)?.push(listener);
        if(callback instanceof Function) callback();
        return this;
    }
    public close(callback: () => void): void {
        this._timer=false;
        if(callback instanceof Function) callback();
    }
    public emit(message: Message, callback?: ((error?: Error | undefined) => void) | undefined): void {
        logger.debug('Publishing Message',message);
        if(!this._queues.has(message.topic)) {
            this._queues.set(message.topic,[]);
        }
        this._queues.get(message.topic)?.push(message);
    }
    public removeListener(topic: string, listener: (message: Message, done: () => void) => void, callback?: (() => void) | undefined): void {
        logger.debug('Unsubscribing Listener',topic);
        if(this._listeners.has(topic)) {
            var index = this._listeners.get(topic)?.indexOf(listener);
            if(index != null && index >= 0){
                this._listeners.get(topic)?.splice(index,1);   
            }  
        }
    }
    public static register(): void {
        QueueFactory.registerConstructor(MEM_BROKER_PROTOCOL,MemEmitter);
    } 
    
}