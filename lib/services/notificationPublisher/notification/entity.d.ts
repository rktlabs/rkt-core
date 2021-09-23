export declare class Notification {
    notificationType: string;
    publishedAt: string;
    attributes: any;
    nonce: string;
    messageId?: string;
    source: string;
    topic: string;
    constructor(notificationType: string, source: string, topic: string, attributes?: any);
    get type(): string;
}
export declare class ErrorNotification extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class WarningNotification extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class OrderFailed extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class OrderComplete extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class OrderFill extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class TransactionError extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class TransactionComplete extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class ExchangeOrderNew extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
export declare class ExchangeOrderCancel extends Notification {
    constructor(source: string, topic: string, attributes?: {});
}
