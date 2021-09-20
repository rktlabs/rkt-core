'use strict'

import { NotificationPublisherBase } from './notificationPublisherBase'
import { DateTime } from 'luxon'

export class ConsoleNotificationPublisher extends NotificationPublisherBase {
    constructor() {
        super()
    }

    async publishNotification(payload: any) {
        const topicName = payload.topic
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        console.log(`Publish to ${topicName}: ${dataBuffer}`)
    }
}
