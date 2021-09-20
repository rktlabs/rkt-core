'use strict'

import { NotificationPublisherBase } from './notificationPublisherBase'
import { DateTime } from 'luxon'
import { PubSub } from '@google-cloud/pubsub'

export class QueueNotificationPublisher extends NotificationPublisherBase {
    private pubSubClient

    constructor() {
        super()
        this.pubSubClient = new PubSub()
    }

    async publishNotification(payload: any) {
        const topicName = payload.topic
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        this.pubSubClient.topic(topicName).publish(dataBuffer)
    }
}
