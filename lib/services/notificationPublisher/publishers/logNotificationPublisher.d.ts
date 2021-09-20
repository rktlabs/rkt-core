import { Logger } from 'log4js';
import { NotificationPublisherBase } from './notificationPublisherBase';
export declare class LogNotificationPublisher extends NotificationPublisherBase {
    private logger;
    constructor(opts: {
        logger: Logger;
    });
    publishNotification(payload: any): Promise<void>;
}
