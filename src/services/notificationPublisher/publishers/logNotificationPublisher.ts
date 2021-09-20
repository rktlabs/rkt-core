'use strict'

import { Logger } from 'log4js'
import { NotificationPublisherBase } from './notificationPublisherBase'
import { DateTime } from 'luxon'

export class LogNotificationPublisher extends NotificationPublisherBase {
    private logger

    constructor(opts: { logger: Logger }) {
        super()
        this.logger = opts.logger
    }

    async publishNotification(payload: any) {
        const topicName = payload.topic
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        this.logger && this.logger.debug(`${topicName}: ${dataBuffer}`)
    }
}
