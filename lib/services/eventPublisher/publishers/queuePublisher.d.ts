import { IPublisher } from './iPublisher';
export declare class QueuePublisher implements IPublisher {
    private pubSubClient;
    constructor();
    publishMessage(topicName: string, payload: any): Promise<void>;
}
