"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioNewEvent = void 0;
const event_1 = require("./event");
class PortfolioNewEvent extends event_1.Event {
    constructor(attributes = {}) {
        super('PortfolioNew', attributes);
    }
}
exports.PortfolioNewEvent = PortfolioNewEvent;
