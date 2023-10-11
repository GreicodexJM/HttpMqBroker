"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const AsyncHttpRestWorker_1 = require("../worker/AsyncHttpRestWorker");
const log4js_1 = require("log4js");
class Application {
    constructor(broker) {
        this.broker = broker;
        this.logger = (0, log4js_1.getLogger)('Application');
    }
    enqeueHttp(req, res) {
        const postQueueMessage = {
            topic: AsyncHttpRestWorker_1.HTTP_REQUESTOR,
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: req.query
        };
        this.broker.emit(postQueueMessage);
        this.logger.debug('Push message', postQueueMessage);
        res.status(202);
        res.write('Accepted - Message Queued');
        res.end();
    }
    dequeueHttp(req, res) {
        // Enqueue a GET message
        const _res = res;
        const _listener = (m) => {
            this.logger.debug('Pop message', m);
            _res.write(JSON.stringify(m));
            _res.write(',');
        };
        _res.type('json');
        _res.write('[');
        this.broker.on(AsyncHttpRestWorker_1.HTTP_REQUESTOR, _listener);
        setTimeout(() => {
            this.broker.removeListener(AsyncHttpRestWorker_1.HTTP_REQUESTOR, _listener);
            _res.write('{"end":true}]');
            _res.status(200);
            _res.end();
        }, parseInt(req.params.timeout) || 5000);
    }
}
exports.Application = Application;
