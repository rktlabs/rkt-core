"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetNewEvent = void 0;
const event_1 = require("./event");
class AssetNewEvent extends event_1.Event {
    constructor(attributes = {}) {
        super('AssetNew', attributes);
    }
}
exports.AssetNewEvent = AssetNewEvent;
