"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEventFill = exports.OrderEventComplete = exports.OrderEventFailed = void 0;
const event_1 = require("./event");
class OrderEventFailed extends event_1.Event {
    constructor(attributes = {}) {
        super('OrderFailed', attributes);
    }
}
exports.OrderEventFailed = OrderEventFailed;
class OrderEventComplete extends event_1.Event {
    constructor(attributes = {}) {
        super('OrderComplete', attributes);
    }
}
exports.OrderEventComplete = OrderEventComplete;
class OrderEventFill extends event_1.Event {
    constructor(attributes = {}) {
        super('OrderFill', attributes);
    }
}
exports.OrderEventFill = OrderEventFill;
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
