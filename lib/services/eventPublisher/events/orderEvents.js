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
