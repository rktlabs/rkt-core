// tslint:disable:no-unused-expression

'use strict'

import { DateTime } from 'luxon'
import { Logger } from 'log4js'
import { PubSub } from '@google-cloud/pubsub'

export class Publisher {
    private pubSubClient
    private logger

    constructor(opts?: { logger?: Logger }) {
        if (opts?.logger) {
            this.logger = opts.logger
        }

        this.pubSubClient = new PubSub()
    }

    async publishMessageToTopicAsync(topicName: string, payload: any) {
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        //this.logger && this.logger.debug(`Publish to ${topicName}: ${dataBuffer}`)
        return this.pubSubClient.topic(topicName).publish(dataBuffer)
    }
}
