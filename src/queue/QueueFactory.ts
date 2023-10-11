import { MQEmitter } from "mqemitter";
import { getLogger } from "log4js";
import { basename } from "path";
const logger = getLogger(basename(__filename));
logger.level='debug';

export interface BrokerConfig { 
    protocol: string, 
    hostname: string, 
    port: number, 
    vhost: string, 
    username: string, 
    password: string 
};
export abstract class Registrable {
    static register():void {};
};
export type MQEmitterConstructor<T extends MQEmitter> = new (b:BrokerConfig) => T;
export class QueueFactory {
    static registered:Map<string,any>=new Map();
    static create<T extends MQEmitter>(dsn: string): T | false {
        logger.debug("Creating Broker " , dsn);
        const broker = QueueFactory.parseDSN(dsn);
        logger.debug("Parsed DSN Broker " , broker.protocol);
        if(QueueFactory.registered.has(broker.protocol)) {
            const ctor = QueueFactory.registered.get(broker.protocol);
            logger.debug("Constructor for ",broker.protocol, ctor !=null);
            if(ctor) {
                logger.debug("Constructing ", ctor);
                return new ctor(broker);
            }
        }
        return false;
    }

    static registerConstructor(protocol:string,ctor: MQEmitterConstructor<MQEmitter>) {
        logger.debug("Registering Ctor ", protocol,ctor);
        QueueFactory.registered.set(protocol,ctor);
    }

    static parseDSN(dsn: string): BrokerConfig
    {
        
        let parsedDSN = new URL(dsn);
        return {
            protocol: parsedDSN.protocol,
            hostname: parsedDSN.hostname,
            port: parseInt(parsedDSN.port),
            username: parsedDSN.username,
            password: parsedDSN.password,
            vhost: parsedDSN.pathname || '/'
        };
    }
}

