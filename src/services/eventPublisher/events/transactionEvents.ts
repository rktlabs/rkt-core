// tslint:disable:max-classes-per-file

import { Event } from './event'

export class TransactionEventError extends Event {
    constructor(attributes = {}) {
        super('TransactionError', attributes)
    }
}

export class TransactionEventComplete extends Event {
    constructor(attributes = {}) {
        super('TransactionComplete', attributes)
    }
}

export class TransactionEventNew extends Event {
    constructor(attributes = {}) {
        super('TransactionNew', attributes)
    }
}

export class TransactionEventPortfolioUpdateEvent extends Event {
    constructor(attributes = {}) {
        super('TransactionPortfolioUpdate', attributes)
    }
}
