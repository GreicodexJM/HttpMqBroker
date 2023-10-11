"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueFactory = exports.Registrable = void 0;
const log4js_1 = require("log4js");
const path_1 = require("path");
const logger = (0, log4js_1.getLogger)((0, path_1.basename)(__filename));
logger.level = 'debug';
;
class Registrable {
    static register() { }
    ;
}
exports.Registrable = Registrable;
;
class QueueFactory {
    static create(dsn) {
        logger.debug("Creating Broker ", dsn);
        const broker = QueueFactory.parseDSN(dsn);
        logger.debug("Parsed DSN Broker ", broker.protocol);
        if (QueueFactory.registered.has(broker.protocol)) {
            const ctor = QueueFactory.registered.get(broker.protocol);
            logger.debug("Constructor for ", broker.protocol, ctor != null);
            if (ctor) {
                logger.debug("Constructing ", ctor);
                return new ctor(broker);
            }
        }
        return false;
    }
    static registerConstructor(protocol, ctor) {
        logger.debug("Registering Ctor ", protocol, ctor);
        QueueFactory.registered.set(protocol, ctor);
    }
    static parseDSN(dsn) {
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
exports.QueueFactory = QueueFactory;
QueueFactory.registered = new Map();
