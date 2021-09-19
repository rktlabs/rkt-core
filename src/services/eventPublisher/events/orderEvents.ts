// tslint:disable:max-classes-per-file

import { Event } from './event'

export class OrderEventFailed extends Event {
    constructor(attributes = {}) {
        super('OrderFailed', attributes)
    }
}

export class OrderEventComplete extends Event {
    constructor(attributes = {}) {
        super('OrderComplete', attributes)
    }
}

export class OrderEventFill extends Event {
    constructor(attributes = {}) {
        super('OrderFill', attributes)
    }
}
