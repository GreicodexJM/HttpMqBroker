"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemEmitter = exports.MEM_BROKER_PROTOCOL = void 0;
const QueueFactory_1 = require("../QueueFactory");
const log4js_1 = require("log4js");
const path_1 = require("path");
const logger = (0, log4js_1.getLogger)((0, path_1.basename)(__filename));
const events_1 = __importDefault(require("events"));
logger.level = 'debug';
exports.MEM_BROKER_PROTOCOL = 'temp:';
class MemEmitter extends QueueFactory_1.Registrable {
    constructor(broker) {
        super();
        this._timer = true;
        this.concurrent = 0;
        this.current = 0;
        this._emitter = new events_1.default();
        this._queues = new Map();
        this._listeners = new Map();
        this._timer = true;
        this._process();
    }
    status() {
        const obj = { queues: this._queues.size, listeners: this._listeners.size };
        return obj;
    }
    _process() {
        //logger.debug('Tick',this);
        this._queues.forEach((queue, topic) => {
            if (queue?.length > 0) {
                if (this._listeners.has(topic) && this._listeners.get(topic).length > 0) {
                    const m = queue?.shift();
                    this._listeners.get(topic)?.forEach((f) => { f(m); });
                }
            }
        });
        if (this._timer) {
            //logger.debug('Tock',this);
            setTimeout(this._process.bind(this), 500);
        }
        //logger.debug('Nieth',this);
    }
    on(topic, listener, callback) {
        logger.debug('Subscribing Listener', topic);
        if (!this._listeners.has(topic)) {
            this._listeners.set(topic, []);
        }
        this._listeners.get(topic)?.push(listener);
        if (callback instanceof Function)
            callback();
        return this;
    }
    close(callback) {
        this._timer = false;
        if (callback instanceof Function)
            callback();
    }
    emit(message, callback) {
        logger.debug('Publishing Message', message);
        if (!this._queues.has(message.topic)) {
            this._queues.set(message.topic, []);
        }
        this._queues.get(message.topic)?.push(message);
    }
    removeListener(topic, listener, callback) {
        logger.debug('Unsubscribing Listener', topic);
        if (this._listeners.has(topic)) {
            var index = this._listeners.get(topic)?.indexOf(listener);
            if (index != null && index >= 0) {
                this._listeners.get(topic)?.splice(index, 1);
            }
        }
    }
    static register() {
        QueueFactory_1.QueueFactory.registerConstructor(exports.MEM_BROKER_PROTOCOL, MemEmitter);
    }
}
exports.MemEmitter = MemEmitter;
