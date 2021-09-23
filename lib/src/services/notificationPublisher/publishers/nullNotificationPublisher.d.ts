import { NotificationPublisherBase } from './notificationPublisherBase';
export declare class NullNotificationPublisher extends NotificationPublisherBase {
    constructor();
    publishNotification(payload: any): Promise<void>;
}
