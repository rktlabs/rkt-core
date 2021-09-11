import { Logger } from 'log4js';
export declare class Publisher {
    private pubSubClient;
    private logger;
    constructor(opts?: {
        logger?: Logger;
    });
    publishMessageToTopicAsync(topicName: string, payload: any): Promise<string>;
}
