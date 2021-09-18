'use strict'

import { DateTime } from 'luxon'
import { IPublisher } from './iPublisher'

export class ConsolePublisher implements IPublisher {
    constructor() {}

    async publishMessage(topicName: string, payload: any) {
        payload.publishedAt = DateTime.utc().toString()
        const dataBuffer = Buffer.from(JSON.stringify(payload))
        console.log(`Publish to ${topicName}: ${dataBuffer}`)
    }
}
