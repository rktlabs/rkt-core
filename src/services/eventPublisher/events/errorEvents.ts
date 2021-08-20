// tslint:disable:max-classes-per-file

import { Event } from './event'

export class ErrorEvent extends Event {
    constructor(attributes = {}) {
        super('Error', attributes)
    }
}

export class WarningEvent extends Event {
    constructor(attributes = {}) {
        super('Warning', attributes)
    }
}
