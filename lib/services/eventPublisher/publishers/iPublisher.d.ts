export interface IPublisher {
    publishMessage(topicName: string, payload: any): Promise<void>;
}
