import { NotificationPublisherBase } from './notificationPublisherBase';
export declare class ConsoleNotificationPublisher extends NotificationPublisherBase {
    constructor();
    publishNotification(payload: any): Promise<void>;
}
