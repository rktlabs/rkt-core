import { DateTime } from 'luxon'
import { generateNonce } from '../../..'

export type TEvent = {
    eventType: string
    publishedAt: string
    attributes: any
    nonce: string
    messageId?: string
}

export class Event {
    eventType: string
    publishedAt: string
    attributes: any
    nonce: string
    messageId?: string

    constructor(eventType: string, attributes: any = {}) {
        this.eventType = eventType
        this.publishedAt = DateTime.utc().toString()
        this.nonce = generateNonce()

        this.attributes = {}
        for (const [key, value] of Object.entries(attributes)) {
            this.attributes[key] = value
        }
    }

    get type() {
        return this.eventType
    }
}
