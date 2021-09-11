"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEventPortfolioUpdateEvent = exports.TransactionEventNew = exports.TransactionEventComplete = exports.TransactionEventError = void 0;
const event_1 = require("./event");
class TransactionEventError extends event_1.Event {
    constructor(attributes = {}) {
        super('TransactionError', attributes);
    }
}
exports.TransactionEventError = TransactionEventError;
class TransactionEventComplete extends event_1.Event {
    constructor(attributes = {}) {
        super('TransactionComplete', attributes);
    }
}
exports.TransactionEventComplete = TransactionEventComplete;
class TransactionEventNew extends event_1.Event {
    constructor(attributes = {}) {
        super('TransactionNew', attributes);
    }
}
exports.TransactionEventNew = TransactionEventNew;
class TransactionEventPortfolioUpdateEvent extends event_1.Event {
    constructor(attributes = {}) {
        super('TransactionPortfolioUpdate', attributes);
    }
}
exports.TransactionEventPortfolioUpdateEvent = TransactionEventPortfolioUpdateEvent;
