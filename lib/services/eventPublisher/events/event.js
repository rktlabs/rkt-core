"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const luxon_1 = require("luxon");
const __1 = require("../../..");
class Event {
    constructor(eventType, attributes = {}) {
        this.eventType = eventType;
        this.publishedAt = luxon_1.DateTime.utc().toString();
        this.nonce = __1.generateNonce();
        this.attributes = {};
        for (const [key, value] of Object.entries(attributes)) {
            this.attributes[key] = value;
        }
    }
    get type() {
        return this.eventType;
    }
}
exports.Event = Event;
