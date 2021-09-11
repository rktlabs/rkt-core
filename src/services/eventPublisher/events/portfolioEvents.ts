// tslint:disable:max-classes-per-file

import { Event } from './event'

export class PortfolioNewEvent extends Event {
    constructor(attributes = {}) {
        super('PortfolioNew', attributes)
    }
}
