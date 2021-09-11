"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarningEvent = exports.ErrorEvent = void 0;
const event_1 = require("./event");
class ErrorEvent extends event_1.Event {
    constructor(attributes = {}) {
        super('Error', attributes);
    }
}
exports.ErrorEvent = ErrorEvent;
class WarningEvent extends event_1.Event {
    constructor(attributes = {}) {
        super('Warning', attributes);
    }
}
exports.WarningEvent = WarningEvent;
