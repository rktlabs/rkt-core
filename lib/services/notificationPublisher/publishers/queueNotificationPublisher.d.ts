import { NotificationPublisherBase } from './notificationPublisherBase';
export declare class QueueNotificationPublisher extends NotificationPublisherBase {
    private pubSubClient;
    constructor();
    publishNotification(payload: any): Promise<void>;
}
