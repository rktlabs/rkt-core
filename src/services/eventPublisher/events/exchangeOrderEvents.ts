// tslint:disable:max-classes-per-file

import { Event } from './event'

export class ExchangeOrderEventNew extends Event {
    constructor(attributes = {}) {
        super('ExchangeOrderNew', attributes)
    }
}

export class ExchangeOrderEventCancel extends Event {
    constructor(attributes = {}) {
        super('ExchangeOrderCancel', attributes)
    }
}
