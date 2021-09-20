'use strict'

import { NotificationPublisherBase } from './notificationPublisherBase'

export class NullNotificationPublisher extends NotificationPublisherBase {
    constructor() {
        super()
    }

    async publishNotification(payload: any) {}
}
