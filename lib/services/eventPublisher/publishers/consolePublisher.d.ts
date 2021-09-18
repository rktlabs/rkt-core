import { IPublisher } from './iPublisher';
export declare class ConsolePublisher implements IPublisher {
    constructor();
    publishMessage(topicName: string, payload: any): Promise<void>;
}
