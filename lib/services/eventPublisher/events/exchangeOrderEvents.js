"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeOrderEventCancel = exports.ExchangeOrderEventNew = void 0;
const event_1 = require("./event");
class ExchangeOrderEventNew extends event_1.Event {
    constructor(attributes = {}) {
        super('ExchangeOrderNew', attributes);
    }
}
exports.ExchangeOrderEventNew = ExchangeOrderEventNew;
class ExchangeOrderEventCancel extends event_1.Event {
    constructor(attributes = {}) {
        super('ExchangeOrderCancel', attributes);
    }
}
exports.ExchangeOrderEventCancel = ExchangeOrderEventCancel;
