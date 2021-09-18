'use strict'

import { DateTime } from 'luxon'
import { Logger } from 'log4js'
import { IPublisher } from './iPublisher'

export class LoggingPublisher implements IPublisher {
    private logger

    constructor(opts: { logger: Logger }) {
        this.logger = opts.logger
    }

    async publishMessage(topicName: string, payload: any) {
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        this.logger && this.logger.debug(`${topicName}: ${dataBuffer}`)
    }
}
