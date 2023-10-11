import { MQEmitter, MQEmitterOptions } from "mqemitter";
import { AMQPEmitter } from "./AMQP/AMQPEmitter";
import { MemEmitter } from "./Memory/MemEmitter";
import { QueueFactory } from "./QueueFactory";
import { getLogger } from "log4js";
import { basename } from "path";

AMQPEmitter.register();
MemEmitter.register();
const options: MQEmitterOptions = { concurrency: 5, matchEmptyLevels: false, separator: ':', wildcardOne: undefined, wildcardSome: undefined };
const tempQueue: MQEmitter | false = QueueFactory.create("temp://localhost");
const logger = getLogger(basename(__filename));
logger.level = "debug";


if(false === tempQueue) { 
  logger.error("Unable to create MemQueue, not available");
  process.exit(-1);
}

export { tempQueue, MQEmitter, MQEmitterOptions, AMQPEmitter, MemEmitter, QueueFactory };