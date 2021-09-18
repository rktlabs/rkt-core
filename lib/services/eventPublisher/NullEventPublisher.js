'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullEventPublisher = void 0;
const EventPublisherBase_1 = require("./EventPublisherBase");
const _1 = require(".");
class NullEventPublisher extends EventPublisherBase_1.EventPublisherBase {
    constructor() {
        const publisher = new _1.NullPublisher();
        super(publisher);
    }
}
exports.NullEventPublisher = NullEventPublisher;
