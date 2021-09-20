'use strict'

import { DateTime } from 'luxon'
import { generateNonce } from '../../..'

export class Notification {
    notificationType: string
    publishedAt: string
    attributes: any
    nonce: string
    messageId?: string
    source: string
    topic: string

    constructor(notificationType: string, source: string, topic: string, attributes: any = {}) {
        this.notificationType = notificationType
        this.publishedAt = DateTime.utc().toString()
        this.nonce = generateNonce()
        this.source = source
        this.topic = topic

        this.attributes = {}
        for (const [key, value] of Object.entries(attributes)) {
            this.attributes[key] = value
        }
    }

    get type() {
        return this.notificationType
    }
}

export class ErrorNotification extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('Error', source, topic, attributes)
    }
}

export class WarningNotification extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('Warning', source, topic, attributes)
    }
}

export class OrderFailed extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('OrderFailed', source, topic, attributes)
    }
}

export class OrderComplete extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('OrderComplete', source, topic, attributes)
    }
}

export class OrderFill extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('OrderFill', source, topic, attributes)
    }
}

export class TransactionError extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('TransactionError', source, topic, attributes)
    }
}

export class TransactionComplete extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('TransactionComplete', source, topic, attributes)
    }
}

export class ExchangeOrderNew extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('ExchangeOrderNew', source, topic, attributes)
    }
}

export class ExchangeOrderCancel extends Notification {
    constructor(source: string, topic: string, attributes = {}) {
        super('ExchangeOrderCancel', source, topic, attributes)
    }
}
