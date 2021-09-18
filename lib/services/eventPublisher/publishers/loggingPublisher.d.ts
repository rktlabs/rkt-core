import { Logger } from 'log4js';
import { IPublisher } from './iPublisher';
export declare class LoggingPublisher implements IPublisher {
    private logger;
    constructor(opts: {
        logger: Logger;
    });
    publishMessage(topicName: string, payload: any): Promise<void>;
}
