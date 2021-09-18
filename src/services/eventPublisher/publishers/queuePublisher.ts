'use strict'

import { DateTime } from 'luxon'
import { PubSub } from '@google-cloud/pubsub'
import { IPublisher } from './iPublisher'

export class QueuePublisher implements IPublisher {
    private pubSubClient

    constructor() {
        this.pubSubClient = new PubSub()
    }

    async publishMessage(topicName: string, payload: any) {
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        this.pubSubClient.topic(topicName).publish(dataBuffer)
    }
}
