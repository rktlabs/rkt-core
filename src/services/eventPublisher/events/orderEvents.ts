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

// export class OrderEventAccepted extends Event {
//     constructor(attributes = {}) {
//         super('OrderAccepted', attributes)
//     }
// }

// export class OrderEventRejected extends Event {
//     constructor(attributes = {}) {
//         super('OrderRejected', attributes)
//     }
// }

// export class OrderEventCanceled extends Event {
//     constructor(attributes = {}) {
//         super('OrderCanceled', attributes)
//     }
// }

// export class OrderEventExpired extends Event {
//     constructor(attributes = {}) {
//         super('OrderExpired', attributes)
//     }
// }

// export class OrderEventTrade extends Event {
//     constructor(attributes = {}) {
//         super('OrderTrade', attributes)
//     }
// }
