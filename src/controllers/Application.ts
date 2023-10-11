import { Request, Response } from "express";
import { QueueMessage } from "../queue/QueueMessage";
import { HTTP_REQUESTOR } from "../worker/AsyncHttpRestWorker";
import { MQEmitter, Message } from "mqemitter";
import { Logger, getLogger } from "log4js";

export class Application {
    private broker;
    private logger;
    public constructor(broker: MQEmitter,) {
        this.broker = broker;
        this.logger = getLogger('Application');
    }

    enqeueHttp(req: Request, res: Response) {
        const postQueueMessage: QueueMessage = {
            topic: HTTP_REQUESTOR,
            url: req.url,
            method: req.method,
            headers: req.headers as { [key: string]: string },
            body: req.query
        };
        this.broker.emit(postQueueMessage);
        this.logger.debug('Push message', postQueueMessage);
        res.status(202);
        res.write('Accepted - Message Queued');
        res.end();
    }

    dequeueHttp(req: Request, res: Response) {
        // Enqueue a GET message
        const _res = res;
        const _listener = (m: Message) => {
            this.logger.debug('Pop message', m);
            _res.write(JSON.stringify(m));
            _res.write(',');
        };
        _res.type('json');
        _res.write('[');
        this.broker.on(HTTP_REQUESTOR, _listener);
        setTimeout(() => {
            this.broker.removeListener(HTTP_REQUESTOR, _listener);
            _res.write('{"end":true}]');
            _res.status(200);
            _res.end();
        }, parseInt(req.params.timeout) || 5000);
    }
}