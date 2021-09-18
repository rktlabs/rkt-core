import { IPublisher } from './iPublisher';
export declare class NullPublisher implements IPublisher {
    constructor();
    publishMessage(topicName: string, payload: any): Promise<void>;
}
