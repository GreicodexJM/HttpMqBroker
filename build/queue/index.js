"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueFactory = exports.MemEmitter = exports.AMQPEmitter = exports.tempQueue = void 0;
const AMQPEmitter_1 = require("./AMQP/AMQPEmitter");
Object.defineProperty(exports, "AMQPEmitter", { enumerable: true, get: function () { return AMQPEmitter_1.AMQPEmitter; } });
const MemEmitter_1 = require("./Memory/MemEmitter");
Object.defineProperty(exports, "MemEmitter", { enumerable: true, get: function () { return MemEmitter_1.MemEmitter; } });
const QueueFactory_1 = require("./QueueFactory");
Object.defineProperty(exports, "QueueFactory", { enumerable: true, get: function () { return QueueFactory_1.QueueFactory; } });
const log4js_1 = require("log4js");
const path_1 = require("path");
AMQPEmitter_1.AMQPEmitter.register();
MemEmitter_1.MemEmitter.register();
const options = { concurrency: 5, matchEmptyLevels: false, separator: ':', wildcardOne: undefined, wildcardSome: undefined };
const tempQueue = QueueFactory_1.QueueFactory.create("temp://localhost");
exports.tempQueue = tempQueue;
const logger = (0, log4js_1.getLogger)((0, path_1.basename)(__filename));
logger.level = "debug";
if (false === tempQueue) {
    logger.error("Unable to create MemQueue, not available");
    process.exit(-1);
}
