export declare type TEvent = {
    eventType: string;
    publishedAt: string;
    attributes: any;
    nonce: string;
    messageId?: string;
};
export declare class Event {
    eventType: string;
    publishedAt: string;
    attributes: any;
    nonce: string;
    messageId?: string;
    constructor(eventType: string, attributes?: any);
    get type(): string;
}
