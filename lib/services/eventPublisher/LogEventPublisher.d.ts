import { Logger } from 'log4js';
import { IEventPublisher } from './IEventPublisher';
import { EventPublisherBase } from './EventPublisherBase';
export declare class LogEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor(opts: {
        logger: Logger;
    });
}
